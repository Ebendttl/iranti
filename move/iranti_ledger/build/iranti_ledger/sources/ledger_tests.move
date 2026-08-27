#[test_only]
module iranti_ledger::ledger_tests {
    use std::string;
    use sui::test_scenario::{Self as ts};
    use iranti_ledger::ledger::{Self, MerchantLedger, MerchantCap};

    const MERCHANT_ADDR: address = @0xACE;

    #[test]
    fun test_create_and_manage_ledger() {
        let mut scenario = ts::begin(MERCHANT_ADDR);

        // Step 1: Merchant creates ledger
        {
            ledger::create_ledger(b"Lagos Fashion Hub", ts::ctx(&mut scenario));
        };

        // Step 2: Retrieve Cap and Shared Object
        ts::next_tx(&mut scenario, MERCHANT_ADDR);
        {
            let cap = ts::take_from_sender<MerchantCap>(&scenario);
            let mut ledger = ts::take_shared<MerchantLedger>(&scenario);

            assert!(ledger::get_shop_name(&ledger) == string::utf8(b"Lagos Fashion Hub"), 0);
            assert!(ledger::get_total_uncollected(&ledger) == 0, 1);

            // Register customer Amaka
            ledger::register_customer(
                &cap,
                &mut ledger,
                b"Amaka",
                b"+2348012345678",
                ts::ctx(&mut scenario)
            );

            // Record initial debt: 7,000 NGN (700,000 kobo)
            ledger::record_debt(
                &cap,
                &mut ledger,
                b"+2348012345678",
                700000,
                b"Blue Size-42 Slide",
                b"blob_walrus_mem_001",
                1787834400,
                ts::ctx(&mut scenario)
            );

            assert!(ledger::get_total_uncollected(&ledger) == 700000, 2);
            assert!(ledger::get_customer_outstanding(&ledger, string::utf8(b"+2348012345678")) == 700000, 3);

            ts::return_to_sender(&scenario, cap);
            ts::return_shared(ledger);
        };

        // Step 3: Partial Settlement (3,500 NGN paid)
        ts::next_tx(&mut scenario, MERCHANT_ADDR);
        {
            let cap = ts::take_from_sender<MerchantCap>(&scenario);
            let mut ledger = ts::take_shared<MerchantLedger>(&scenario);

            ledger::settle_debt(
                &cap,
                &mut ledger,
                b"+2348012345678",
                350000,
                b"blob_walrus_mem_002",
                1787838000,
                ts::ctx(&mut scenario)
            );

            assert!(ledger::get_total_uncollected(&ledger) == 350000, 4);
            assert!(ledger::get_customer_outstanding(&ledger, string::utf8(b"+2348012345678")) == 350000, 5);

            // Anchor Walrus Memory hash
            ledger::anchor_walrus_memory(
                &cap,
                &mut ledger,
                b"+2348012345678",
                b"blob_walrus_mem_002",
                b"0xhash_amaka_memory_walrus",
                1787838100,
                ts::ctx(&mut scenario)
            );

            assert!(ledger::get_anchored_memories_count(&ledger) == 2, 6);

            ts::return_to_sender(&scenario, cap);
            ts::return_shared(ledger);
        };

        ts::end(scenario);
    }
}
