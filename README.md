# Ìrántí — The Customer Memory Agent for WhatsApp Sellers

**Ìrántí** (Yoruba: *"memory"*) is a production-grade AI customer memory and debt-tracking assistant built on **Walrus Memory (MemWal)** and **Sui Blockchain** for WhatsApp sellers in Lagos, Nigeria and beyond.

---

## 🌟 Overview & Problem Solved

Most small sellers in Lagos — fashion vendors, phone accessory dealers, cosmetics Hustlers, okrika thrift dealers — run their entire business through WhatsApp DMs. A single vendor juggles hundreds of customer threads every day.

This causes continuous revenue leakages:
1. **Re-asking context**: Sellers re-ask returning customers for their size, color preference, or delivery address — making the customer feel like a stranger.
2. **Forgotten Debts ("Who is owing")**: Partial payments ("I go pay balance next week") get buried in chat scrollback. Uncollected revenue quietly leaks out of the business.
3. **Staff / Handover Zero Context**: If a sibling or new assistant replies to a chat, they have zero context and repeat mistakes.

**Ìrántí** solves this by leveraging **Walrus Memory (MemWal)**:
- Extracts durable, decision-relevant facts (Identity, Size/Fit, Address, Order History, Debt/Credit balance, Complaints).
- Recalls everything known about a customer the moment their name or number is mentioned.
- Drafts warm, natural Lagos vendor replies (in English/Pidgin tone) surfacing uncollected debts unprompted.
- Anchors debt receipts & memory hashes on the **Sui Blockchain** via the `iranti_ledger` Move smart contract.

---

## 🏗 System Architecture

```
                       +-----------------------------------+
                       |    WhatsApp Seller Interaction    |
                       |  (Pastes DM / Voice Transcript)   |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |    Ìrántí Next.js Web dApp /    |
                       |   Claude MCP System Prompt Driver |
                       +--------+-----------------+--------+
                                |                 |
                                v                 v
        +-----------------------+-----+     +-----+-----------------------+
        |   Walrus Memory (MemWal)    |     |    Sui Move Smart Contract  |
        |  Mainnet Relayer / Engine   |     |    (move/iranti_ledger)     |
        |                             |     |                             |
        | - memwal_remember           |     | - MerchantLedger object     |
        | - memwal_recall (semantic)  |     | - CustomerRecord table      |
        | - memwal_analyze            |     | - SettlementReceipt proof   |
        | - Identity Anchor Tagging   |     | - Move unit tests (Passed)  |
        +-----------------------------+     +-----------------------------+
```

---

## 🚀 Quick Start Guide

### 1. Sui Move Smart Contract (`move/iranti_ledger`)

To compile and test the Sui Move smart contract package:

```bash
cd move/iranti_ledger
sui move test
```

> **Test Output**:
> ```text
> Running Move unit tests
> [ PASS ] iranti_ledger::ledger_tests::test_create_and_manage_ledger
> Test result: OK. Total tests: 1; passed: 1; failed: 0
> ```

### 2. Next.js 14 Interactive Web Application

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch the Ìrántí Workbench:
- **WhatsApp Assistant & Simulator**: Test live customer interactions with presets (Amaka, Chidi, Folake) or paste custom transcripts.
- **Walrus Memory Explorer**: Query stored memory blobs via semantic `memwal_recall`.
- **Debt & Credit Ledger**: Track uncollected revenue in Naira (₦) and generate 1-click WhatsApp payment reminders.
- **Sui On-Chain Proofs**: Connect Sui Wallet (`@mysten/dapp-kit`) and create on-chain merchant ledgers.
- **System Prompt Hub**: Copy-paste the production System Prompt into Claude or custom connectors.

---

## 🧠 Setup Walrus Memory in Claude (Custom Connector)

Targets **Mainnet/Production** (`https://relayer.memory.walrus.xyz`):

1. Open Claude (Web or Desktop) → **Settings** → **Connectors** → **Add custom connector**.
2. Paste URL: `https://relayer.memory.walrus.xyz/api/mcp`
3. Connect a Sui Wallet on the consent screen and approve (sponsored, gas-free transaction).
4. Verify by asking Claude: *"What MCP tools do you have?"* — confirm `memwal_remember`, `memwal_recall`, `memwal_analyze`, `memwal_restore` are present.
5. Paste the system prompt from `Iranti-Walrus-Memory-Submission.md` into Claude Project custom instructions.

---

## 🎥 2-Minute Demo Script

1. **Session 1 (Monday)**: Select customer **Amaka** (`+2348012345678`), order size 42 slide for ₦7,000 with ₦3,500 deposit. Run Ìrántí Agent to analyze and store memories in Walrus Memory.
2. **Session 2 (Next Week)**: Reset context, enter *"Amaka is messaging me again, what should I say?"*. Show Ìrántí executing `memwal_recall` and returning size preference, order history, and the ₦3,500 debt unprompted.

---

## 📄 License

MIT License. See [LICENSE](file:///home/ebendttl/portfolio-projects/iranti/LICENSE) for details.
