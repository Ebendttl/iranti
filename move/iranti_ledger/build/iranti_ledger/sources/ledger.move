module iranti_ledger::ledger {
    use std::string::{Self, String};
    use sui::object::ID;
    use sui::event;
    use sui::table::{Self, Table};

    /// Error codes
    const ENotOwner: u64 = 0;
    const ECustomerNotFound: u64 = 1;
    const ECustomerAlreadyExists: u64 = 2;
    const EInvalidAmount: u64 = 3;

    /// Capability proving merchant ownership over a ledger
    public struct MerchantCap has key, store {
        id: UID,
        ledger_id: ID,
    }

    /// Single customer memory & debt record
    public struct CustomerRecord has store, copy, drop {
        customer_name: String,
        phone_number: String,
        outstanding_kobo: u64,
        last_order_item: String,
        last_updated_timestamp: u64,
        walrus_blob_id: String,
    }

    /// Main Merchant Ledger object on Sui
    public struct MerchantLedger has key, store {
        id: UID,
        merchant: address,
        shop_name: String,
        total_uncollected_kobo: u64,
        customers: Table<String, CustomerRecord>,
        anchored_memories_count: u64,
    }

    /// Proof receipt object emitted when a customer settles debt
    public struct SettlementReceipt has key, store {
        id: UID,
        merchant: address,
        customer_phone: String,
        amount_settled_kobo: u64,
        remaining_debt_kobo: u64,
        walrus_blob_id: String,
        timestamp: u64,
    }

    // --- Events ---

    public struct LedgerCreatedEvent has copy, drop {
        ledger_id: ID,
        merchant: address,
        shop_name: String,
    }

    public struct CustomerRegisteredEvent has copy, drop {
        ledger_id: ID,
        customer_name: String,
        phone_number: String,
    }

    public struct DebtUpdatedEvent has copy, drop {
        ledger_id: ID,
        customer_phone: String,
        new_debt_kobo: u64,
        total_uncollected_kobo: u64,
        walrus_blob_id: String,
    }

    public struct DebtSettledEvent has copy, drop {
        ledger_id: ID,
        customer_phone: String,
        amount_paid_kobo: u64,
        remaining_debt_kobo: u64,
        walrus_blob_id: String,
    }

    public struct WalrusMemoryAnchoredEvent has copy, drop {
        ledger_id: ID,
        customer_phone: String,
        walrus_blob_id: String,
        memory_hash: String,
        timestamp: u64,
    }

    // --- Entry & Public Functions ---

    /// Creates a new Merchant Ledger for a seller shop and transfers MerchantCap to caller
    public entry fun create_ledger(shop_name_bytes: vector<u8>, ctx: &mut TxContext) {
        let shop_name = string::utf8(shop_name_bytes);
        let merchant = ctx.sender();
        let ledger_uid = object::new(ctx);
        let ledger_id = object::uid_to_inner(&ledger_uid);

        let ledger = MerchantLedger {
            id: ledger_uid,
            merchant,
            shop_name,
            total_uncollected_kobo: 0,
            customers: table::new(ctx),
            anchored_memories_count: 0,
        };

        let cap = MerchantCap {
            id: object::new(ctx),
            ledger_id,
        };

        event::emit(LedgerCreatedEvent {
            ledger_id,
            merchant,
            shop_name,
        });

        transfer::transfer(cap, merchant);
        transfer::share_object(ledger);
    }

    /// Registers a new customer under the merchant's ledger
    public entry fun register_customer(
        cap: &MerchantCap,
        ledger: &mut MerchantLedger,
        name_bytes: vector<u8>,
        phone_bytes: vector<u8>,
        _ctx: &mut TxContext
    ) {
        let ledger_id = object::id(ledger);
        assert!(cap.ledger_id == ledger_id, ENotOwner);
        let phone = string::utf8(phone_bytes);
        assert!(!table::contains(&ledger.customers, phone), ECustomerAlreadyExists);

        let name = string::utf8(name_bytes);
        let record = CustomerRecord {
            customer_name: name,
            phone_number: phone,
            outstanding_kobo: 0,
            last_order_item: string::utf8(b"None"),
            last_updated_timestamp: 0,
            walrus_blob_id: string::utf8(b""),
        };

        table::add(&mut ledger.customers, phone, record);

        event::emit(CustomerRegisteredEvent {
            ledger_id,
            customer_name: name,
            phone_number: phone,
        });
    }

    /// Records a new debt or partial debt incurred by a customer
    public entry fun record_debt(
        cap: &MerchantCap,
        ledger: &mut MerchantLedger,
        phone_bytes: vector<u8>,
        debt_kobo: u64,
        order_item_bytes: vector<u8>,
        walrus_blob_bytes: vector<u8>,
        timestamp: u64,
        _ctx: &mut TxContext
    ) {
        let ledger_id = object::id(ledger);
        assert!(cap.ledger_id == ledger_id, ENotOwner);
        let phone = string::utf8(phone_bytes);
        assert!(table::contains(&ledger.customers, phone), ECustomerNotFound);

        let record = table::borrow_mut(&mut ledger.customers, phone);
        record.outstanding_kobo = record.outstanding_kobo + debt_kobo;
        record.last_order_item = string::utf8(order_item_bytes);
        record.last_updated_timestamp = timestamp;
        record.walrus_blob_id = string::utf8(walrus_blob_bytes);

        let new_customer_debt = record.outstanding_kobo;
        let blob_id = record.walrus_blob_id;

        ledger.total_uncollected_kobo = ledger.total_uncollected_kobo + debt_kobo;
        ledger.anchored_memories_count = ledger.anchored_memories_count + 1;

        event::emit(DebtUpdatedEvent {
            ledger_id,
            customer_phone: phone,
            new_debt_kobo: new_customer_debt,
            total_uncollected_kobo: ledger.total_uncollected_kobo,
            walrus_blob_id: blob_id,
        });
    }

    /// Settles a customer's debt (fully or partially) and issues an on-chain SettlementReceipt
    public entry fun settle_debt(
        cap: &MerchantCap,
        ledger: &mut MerchantLedger,
        phone_bytes: vector<u8>,
        amount_paid_kobo: u64,
        walrus_blob_bytes: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        let ledger_id = object::id(ledger);
        assert!(cap.ledger_id == ledger_id, ENotOwner);
        let phone = string::utf8(phone_bytes);
        assert!(table::contains(&ledger.customers, phone), ECustomerNotFound);
        assert!(amount_paid_kobo > 0, EInvalidAmount);

        let record = table::borrow_mut(&mut ledger.customers, phone);
        let actual_deduction = if (amount_paid_kobo > record.outstanding_kobo) {
            record.outstanding_kobo
        } else {
            amount_paid_kobo
        };

        record.outstanding_kobo = record.outstanding_kobo - actual_deduction;
        record.last_updated_timestamp = timestamp;
        let blob_id = string::utf8(walrus_blob_bytes);
        record.walrus_blob_id = blob_id;

        let remaining_debt = record.outstanding_kobo;

        if (actual_deduction <= ledger.total_uncollected_kobo) {
            ledger.total_uncollected_kobo = ledger.total_uncollected_kobo - actual_deduction;
        };

        event::emit(DebtSettledEvent {
            ledger_id,
            customer_phone: phone,
            amount_paid_kobo: actual_deduction,
            remaining_debt_kobo: remaining_debt,
            walrus_blob_id: blob_id,
        });

        let receipt = SettlementReceipt {
            id: object::new(ctx),
            merchant: ledger.merchant,
            customer_phone: phone,
            amount_settled_kobo: actual_deduction,
            remaining_debt_kobo: remaining_debt,
            walrus_blob_id: blob_id,
            timestamp,
        };

        transfer::transfer(receipt, ctx.sender());
    }

    /// Anchors a Walrus Memory blob ID and hash on-chain for verification
    public entry fun anchor_walrus_memory(
        cap: &MerchantCap,
        ledger: &mut MerchantLedger,
        phone_bytes: vector<u8>,
        walrus_blob_bytes: vector<u8>,
        memory_hash_bytes: vector<u8>,
        timestamp: u64,
        _ctx: &mut TxContext
    ) {
        let ledger_id = object::id(ledger);
        assert!(cap.ledger_id == ledger_id, ENotOwner);
        let phone = string::utf8(phone_bytes);
        let blob_id = string::utf8(walrus_blob_bytes);
        let hash = string::utf8(memory_hash_bytes);

        if (table::contains(&ledger.customers, phone)) {
            let record = table::borrow_mut(&mut ledger.customers, phone);
            record.walrus_blob_id = blob_id;
            record.last_updated_timestamp = timestamp;
        };

        ledger.anchored_memories_count = ledger.anchored_memories_count + 1;

        event::emit(WalrusMemoryAnchoredEvent {
            ledger_id,
            customer_phone: phone,
            walrus_blob_id: blob_id,
            memory_hash: hash,
            timestamp,
        });
    }

    // --- View Functions ---

    public fun get_shop_name(ledger: &MerchantLedger): String {
        ledger.shop_name
    }

    public fun get_total_uncollected(ledger: &MerchantLedger): u64 {
        ledger.total_uncollected_kobo
    }

    public fun get_customer_outstanding(ledger: &MerchantLedger, phone: String): u64 {
        if (table::contains(&ledger.customers, phone)) {
            let record = table::borrow(&ledger.customers, phone);
            record.outstanding_kobo
        } else {
            0
        }
    }

    public fun get_anchored_memories_count(ledger: &MerchantLedger): u64 {
        ledger.anchored_memories_count
    }
}
