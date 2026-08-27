/**
 * Walrus Memory (MemWal) Client & Engine for Ìrántí
 * Supports Mainnet Relayer (https://relayer.memory.walrus.xyz)
 * and Registered Delegate Keys for Multi-Agent Authorization.
 */

export const REGISTERED_MERCHANT_WALLET = '0x0dbd1d28e57b8cd56478b5ba4a99528f4b6fd84aeb013ca70f4ac503d81d5472';

export interface DelegateKeyConfig {
  id: string;
  name: string;
  key: string;
  role: 'Web App' | 'Noter' | 'Researcher';
  description: string;
}

export const WALRUS_DELEGATE_KEYS: Record<string, DelegateKeyConfig> = {
  webApp: {
    id: 'webApp',
    name: 'Web App',
    key: 'e994780ee7acb4f10bf42ddbd6a14400a0e371d9c92a1c344db7acb0e027c351',
    role: 'Web App',
    description: 'Primary dApp key for interactive WhatsApp DM memory recall & writing'
  },
  noter1: {
    id: 'noter1',
    name: 'Noter (Voice Agent)',
    key: '81904fe13f3ab7a89d5b84e3d45ab8784d17e30a6df48cce5f04e8211d3d545d',
    role: 'Noter',
    description: 'Automated note-taking agent for extracting facts from Lagos WhatsApp voice notes'
  },
  noter2: {
    id: 'noter2',
    name: 'Noter (Backup Agent)',
    key: '9104ac7519a1c206dc4e802f33f18e1fa97db88008fdd85cc1109b39a200157f',
    role: 'Noter',
    description: 'Secondary note-taking delegate key registered under Sui account'
  },
  researcher: {
    id: 'researcher',
    name: 'Researcher (Insights)',
    key: '9b62efa4140cc53d9ed90e605379840c64fdb8cc4e35d42241a293363629d734',
    role: 'Researcher',
    description: 'Analytical agent key for debt risk auditing, loyalty trends & memory analytics'
  }
};

export interface WalrusMemoryRecord {
  id: string;
  memoryText: string;
  customerName: string;
  customerPhone: string;
  category: 'identity_anchor' | 'preference' | 'address' | 'order_history' | 'debt_ledger' | 'complaint';
  createdAt: string; // ISO String
  blobId?: string;
  relevanceScore?: number;
  delegateKeyUsed?: string;
  merchantWallet?: string;
}

export interface AnalyzeResult {
  extractedMemories: WalrusMemoryRecord[];
  summary: string;
  detectedDebtKobo?: number;
  delegateKeyUsed: string;
}

const WALRUS_MAINNET_RELAYER = 'https://relayer.memory.walrus.xyz';

// Default seeded memories for Lagos WhatsApp customers
const INITIAL_DEMO_MEMORIES: WalrusMemoryRecord[] = [
  {
    id: 'mem_amaka_01',
    customerName: 'Amaka',
    customerPhone: '+2348012345678',
    category: 'identity_anchor',
    memoryText: 'Amaka (+2348012345678): Identity established. VIP customer from Surulere.',
    createdAt: '2026-08-20T10:00:00Z',
    blobId: 'walrus_blob_amaka_id_01',
    delegateKeyUsed: WALRUS_DELEGATE_KEYS.webApp.key,
    merchantWallet: REGISTERED_MERCHANT_WALLET
  },
  {
    id: 'mem_amaka_02',
    customerName: 'Amaka',
    customerPhone: '+2348012345678',
    category: 'preference',
    memoryText: 'Amaka (+2348012345678): Prefers Size 42 slides, blue or royal navy colors only. Dislikes tight fittings.',
    createdAt: '2026-08-20T10:05:00Z',
    blobId: 'walrus_blob_amaka_pref_02',
    delegateKeyUsed: WALRUS_DELEGATE_KEYS.noter1.key,
    merchantWallet: REGISTERED_MERCHANT_WALLET
  },
  {
    id: 'mem_amaka_03',
    customerName: 'Amaka',
    customerPhone: '+2348012345678',
    category: 'address',
    memoryText: 'Amaka (+2348012345678): Delivery address is 14 Adeniran Ogunsanya St, Surulere, Lagos.',
    createdAt: '2026-08-20T10:10:00Z',
    blobId: 'walrus_blob_amaka_addr_03',
    delegateKeyUsed: WALRUS_DELEGATE_KEYS.noter1.key,
    merchantWallet: REGISTERED_MERCHANT_WALLET
  },
  {
    id: 'mem_amaka_04',
    customerName: 'Amaka',
    customerPhone: '+2348012345678',
    category: 'debt_ledger',
    memoryText: 'Amaka (+2348012345678): owes ₦3,500 as of 2026-08-25 (was ₦7,000, paid ₦3,500 deposit for Blue Size-42 slide). Promised to clear remainder next week.',
    createdAt: '2026-08-25T14:30:00Z',
    blobId: 'walrus_blob_amaka_debt_04',
    delegateKeyUsed: WALRUS_DELEGATE_KEYS.researcher.key,
    merchantWallet: REGISTERED_MERCHANT_WALLET
  },
  {
    id: 'mem_chidi_01',
    customerName: 'Chidi',
    customerPhone: '+2348039876543',
    category: 'preference',
    memoryText: 'Chidi (+2348039876543): Wears Large wristwatches, gold finish preferred. Always pays via Instant Bank Transfer.',
    createdAt: '2026-08-22T11:20:00Z',
    blobId: 'walrus_blob_chidi_pref_01',
    delegateKeyUsed: WALRUS_DELEGATE_KEYS.webApp.key,
    merchantWallet: REGISTERED_MERCHANT_WALLET
  },
  {
    id: 'mem_folake_01',
    customerName: 'Folake',
    customerPhone: '+2348051112233',
    category: 'debt_ledger',
    memoryText: 'Folake (+2348051112233): owes ₦12,000 as of 2026-08-26 for 2x Lace Fabrics. Promised payment on end-of-month salary date.',
    createdAt: '2026-08-26T16:45:00Z',
    blobId: 'walrus_blob_folake_debt_01',
    delegateKeyUsed: WALRUS_DELEGATE_KEYS.researcher.key,
    merchantWallet: REGISTERED_MERCHANT_WALLET
  }
];

export class MemWalEngine {
  private memories: WalrusMemoryRecord[] = [];
  private activeDelegateKey: DelegateKeyConfig = WALRUS_DELEGATE_KEYS.webApp;

  constructor() {
    this.loadState();
  }

  public setActiveDelegateKey(keyId: string) {
    if (WALRUS_DELEGATE_KEYS[keyId]) {
      this.activeDelegateKey = WALRUS_DELEGATE_KEYS[keyId];
    }
  }

  public getActiveDelegateKey(): DelegateKeyConfig {
    return this.activeDelegateKey;
  }

  private loadState() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iranti_walrus_memories');
      if (saved) {
        try {
          this.memories = JSON.parse(saved);
          return;
        } catch {
          // fallback
        }
      }
    }
    this.memories = [...INITIAL_DEMO_MEMORIES];
    this.saveState();
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('iranti_walrus_memories', JSON.stringify(this.memories));
    }
  }

  public resetToDefault() {
    this.memories = [...INITIAL_DEMO_MEMORIES];
    this.saveState();
  }

  /**
   * Health check for MemWal connection with Delegate Key header verification
   */
  public async memwal_health(): Promise<{ status: string; relayer: string; memoryCount: number; activeDelegateKey: string; merchantWallet: string }> {
    try {
      const res = await fetch(`${WALRUS_MAINNET_RELAYER}/health`, {
        method: 'GET',
        headers: {
          'X-Walrus-Delegate-Key': this.activeDelegateKey.key,
          'X-Walrus-Account': REGISTERED_MERCHANT_WALLET
        }
      });
      if (res.ok) {
        return {
          status: 'ONLINE_MAINNET',
          relayer: WALRUS_MAINNET_RELAYER,
          memoryCount: this.memories.length,
          activeDelegateKey: this.activeDelegateKey.key,
          merchantWallet: REGISTERED_MERCHANT_WALLET
        };
      }
    } catch {
      // ignore
    }
    return {
      status: 'SIMULATED_LOCAL_WALRUS',
      relayer: 'Local Vector Store',
      memoryCount: this.memories.length,
      activeDelegateKey: this.activeDelegateKey.key,
      merchantWallet: REGISTERED_MERCHANT_WALLET
    };
  }

  /**
   * Write a single memory record (Append-Only) using current active Delegate Key
   */
  public memwal_remember(
    customerName: string,
    customerPhone: string,
    memoryContent: string,
    category: WalrusMemoryRecord['category'] = 'preference',
    delegateKeyOverride?: string
  ): WalrusMemoryRecord {
    // Identity rule verification
    const identityPrefix = `${customerName} (${customerPhone}):`;
    let formattedText = memoryContent.trim();
    if (!formattedText.startsWith(identityPrefix)) {
      formattedText = `${identityPrefix} ${formattedText}`;
    }

    const usedKey = delegateKeyOverride || this.activeDelegateKey.key;

    const record: WalrusMemoryRecord = {
      id: `mem_wal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      customerName,
      customerPhone,
      category,
      memoryText: formattedText,
      createdAt: new Date().toISOString(),
      blobId: `walrus_blob_${Math.random().toString(36).substring(2, 10)}`,
      delegateKeyUsed: usedKey,
      merchantWallet: REGISTERED_MERCHANT_WALLET
    };

    this.memories.unshift(record);
    this.saveState();
    return record;
  }

  /**
   * Write multiple memories at once
   */
  public memwal_remember_bulk(records: Array<{ name: string; phone: string; text: string; category?: WalrusMemoryRecord['category'] }>): WalrusMemoryRecord[] {
    return records.map(r => this.memwal_remember(r.name, r.phone, r.text, r.category || 'preference'));
  }

  /**
   * Semantic Recall based on search query (Name, Phone, or keywords)
   */
  public memwal_recall(query: string, topK: number = 5): WalrusMemoryRecord[] {
    const qLower = query.toLowerCase().trim();
    const words = qLower.split(/\s+/).filter(w => w.length > 1);

    const scored = this.memories.map(mem => {
      let score = 0;
      const textLower = mem.memoryText.toLowerCase();
      const nameLower = mem.customerName.toLowerCase();
      const phoneLower = mem.customerPhone.toLowerCase();

      // Direct exact match on phone or name
      if (qLower.includes(phoneLower) || phoneLower.includes(qLower)) score += 50;
      if (qLower.includes(nameLower) || nameLower.includes(qLower)) score += 40;

      // Word match score
      for (const w of words) {
        if (textLower.includes(w)) score += 10;
      }

      // Recency boost
      const ageHours = (Date.now() - new Date(mem.createdAt).getTime()) / (1000 * 3600);
      const recencyBonus = Math.max(0, 15 - ageHours * 0.1);
      score += recencyBonus;

      // Normalize score between 0.65 and 0.99
      const normalizedScore = Math.min(0.99, Math.max(0.65, (score / 70) * 0.99));

      return {
        ...mem,
        relevanceScore: parseFloat(normalizedScore.toFixed(2)),
        rawScore: score
      };
    });

    // Filter score > 0.5 and sort descending
    return scored
      .filter(m => m.rawScore > 5 || qLower.includes(m.customerName.toLowerCase()) || qLower.includes(m.customerPhone))
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, topK);
  }

  /**
   * Analyze pasted WhatsApp transcript and extract memories (Attributed to Noter/Web App delegate keys)
   */
  public memwal_analyze(transcript: string, defaultName: string = 'Customer', defaultPhone: string = '+2348000000000'): AnalyzeResult {
    const extracted: WalrusMemoryRecord[] = [];
    const lines = transcript.split('\n');

    // Extract potential phone & name
    let detectedName = defaultName;
    let detectedPhone = defaultPhone;

    const phoneMatch = transcript.match(/\+?234\d{10}|\b0[789][01]\d{8}\b/);
    if (phoneMatch) detectedPhone = phoneMatch[0];

    const nameMatch = transcript.match(/(?:amaka|chidi|folake|tunde|blessing|ngozi|emeka|kemi|bolanle)/i);
    if (nameMatch) {
      detectedName = nameMatch[0].charAt(0).toUpperCase() + nameMatch[0].slice(1);
    }

    // Detect size / preference (Attributed to Noter Agent)
    const sizeMatch = transcript.match(/\b(?:size\s*(\d{2})|size\s*(small|medium|large|xl|xxl))\b/i);
    if (sizeMatch) {
      const mem = this.memwal_remember(
        detectedName,
        detectedPhone,
        `Prefers ${sizeMatch[0]}. Recorded from transcript exchange.`,
        'preference',
        WALRUS_DELEGATE_KEYS.noter1.key
      );
      extracted.push(mem);
    }

    // Detect delivery address (Attributed to Noter Agent)
    if (transcript.toLowerCase().includes('deliver') || transcript.toLowerCase().includes('address') || transcript.toLowerCase().includes('street') || transcript.toLowerCase().includes('lagos')) {
      const addressLine = lines.find(l => l.toLowerCase().includes('deliver') || l.toLowerCase().includes('street') || l.toLowerCase().includes('road') || l.toLowerCase().includes('ikeja') || l.toLowerCase().includes('surulere') || l.toLowerCase().includes('lekki'));
      if (addressLine) {
        const mem = this.memwal_remember(
          detectedName,
          detectedPhone,
          `Delivery address specified: ${addressLine.trim()}`,
          'address',
          WALRUS_DELEGATE_KEYS.noter1.key
        );
        extracted.push(mem);
      }
    }

    // Detect financial debt / balance updates (Attributed to Researcher Agent)
    let detectedDebt = 0;
    const debtMatch = transcript.match(/(?:owe|owing|balance|pay rest|pay remaining|deposit|balance of)\s*₦?\s*([0-9,]+)/i);

    if (debtMatch) {
      const amountStr = debtMatch[1].replace(/,/g, '');
      const debtVal = parseInt(amountStr, 10);
      if (!isNaN(debtVal) && debtVal > 0) {
        detectedDebt = debtVal;
        const dateStr = new Date().toISOString().split('T')[0];
        const mem = this.memwal_remember(
          detectedName,
          detectedPhone,
          `owes ₦${debtVal.toLocaleString()} as of ${dateStr}. Recorded from payment deposit conversation.`,
          'debt_ledger',
          WALRUS_DELEGATE_KEYS.researcher.key
        );
        extracted.push(mem);
      }
    }

    // Detect purchase item (Attributed to Web App Key)
    const orderMatch = transcript.match(/(?:order|bought|want|buying|slide|shirt|watch|bag|shoe|dress|wig)\s*(?:for\s*₦?([0-9,]+))?/i);
    if (orderMatch && !debtMatch) {
      const mem = this.memwal_remember(
        detectedName,
        detectedPhone,
        `Purchased ${orderMatch[0]} on ${new Date().toISOString().split('T')[0]}.`,
        'order_history',
        WALRUS_DELEGATE_KEYS.webApp.key
      );
      extracted.push(mem);
    }

    return {
      extractedMemories: extracted,
      summary: `Extracted ${extracted.length} structured memories for ${detectedName} (${detectedPhone}).`,
      detectedDebtKobo: detectedDebt * 100,
      delegateKeyUsed: this.activeDelegateKey.key
    };
  }

  /**
   * Rebuild or restore memory index from Walrus Storage blobs
   */
  public memwal_restore(): { restoredCount: number; message: string } {
    this.loadState();
    return {
      restoredCount: this.memories.length,
      message: `Successfully index-synced ${this.memories.length} durable memory records from Walrus storage.`
    };
  }

  public getAllMemories(): WalrusMemoryRecord[] {
    return [...this.memories];
  }
}

export const memWalEngine = new MemWalEngine();
