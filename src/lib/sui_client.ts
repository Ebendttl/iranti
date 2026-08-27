import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export const SUI_NETWORK = 'testnet';
export const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });

// Package ID fallback or environment variable
export const IRANTI_PACKAGE_ID = process.env.NEXT_PUBLIC_IRANTI_PACKAGE_ID || '0x0';

export interface SuiLedgerRecord {
  shopName: string;
  totalUncollectedKobo: number;
  anchoredMemoriesCount: number;
}

export class SuiLedgerService {
  /**
   * Constructs a transaction block to create a new Merchant Ledger on Sui
   */
  public buildCreateLedgerTx(shopName: string): Transaction {
    const tx = new Transaction();
    const shopNameBytes = Array.from(new TextEncoder().encode(shopName));

    tx.moveCall({
      target: `${IRANTI_PACKAGE_ID}::ledger::create_ledger`,
      arguments: [tx.pure.vector('u8', shopNameBytes)],
    });

    return tx;
  }

  /**
   * Constructs a transaction block to anchor a Walrus Memory hash on-chain
   */
  public buildAnchorMemoryTx(
    ledgerId: string,
    merchantCapId: string,
    phone: string,
    walrusBlobId: string,
    memoryHash: string
  ): Transaction {
    const tx = new Transaction();
    const phoneBytes = Array.from(new TextEncoder().encode(phone));
    const blobBytes = Array.from(new TextEncoder().encode(walrusBlobId));
    const hashBytes = Array.from(new TextEncoder().encode(memoryHash));
    const timestamp = Date.now();

    tx.moveCall({
      target: `${IRANTI_PACKAGE_ID}::ledger::anchor_walrus_memory`,
      arguments: [
        tx.object(merchantCapId),
        tx.object(ledgerId),
        tx.pure.vector('u8', phoneBytes),
        tx.pure.vector('u8', blobBytes),
        tx.pure.vector('u8', hashBytes),
        tx.pure.u64(timestamp),
      ],
    });

    return tx;
  }

  /**
   * Constructs a transaction block to record customer debt settlement receipt on Sui
   */
  public buildSettleDebtTx(
    ledgerId: string,
    merchantCapId: string,
    phone: string,
    amountKobo: number,
    walrusBlobId: string
  ): Transaction {
    const tx = new Transaction();
    const phoneBytes = Array.from(new TextEncoder().encode(phone));
    const blobBytes = Array.from(new TextEncoder().encode(walrusBlobId));
    const timestamp = Date.now();

    tx.moveCall({
      target: `${IRANTI_PACKAGE_ID}::ledger::settle_debt`,
      arguments: [
        tx.object(merchantCapId),
        tx.object(ledgerId),
        tx.pure.vector('u8', phoneBytes),
        tx.pure.u64(amountKobo),
        tx.pure.vector('u8', blobBytes),
        tx.pure.u64(timestamp),
      ],
    });

    return tx;
  }
}

export const suiLedgerService = new SuiLedgerService();
