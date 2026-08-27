# Ìrántí — The Customer Memory Agent for WhatsApp Sellers

**Ìrántí** (Yoruba: *"memory"*) is a production-grade AI customer memory and debt-tracking assistant built on **Walrus Memory (MemWal)** and **Sui Blockchain** for WhatsApp sellers in Lagos, Nigeria and beyond.

---

## 🔑 Registered Merchant Account & Delegate Keys

Registered Sui Merchant Account:
`0x0dbd1d28e57b8cd56478b5ba4a99528f4b6fd84aeb013ca70f4ac503d81d5472`

Ìrántí utilizes **4 Walrus Memory Delegate Keys** registered under the merchant account at [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard) to authorize gas-free multi-agent memory operations:

| Delegate Key Role | Public Key | Purpose in Ìrántí System |
|---|---|---|
| **Web App Key** 🌐 | `e994780ee7acb4f10bf42ddbd6a14400a0e371d9c92a1c344db7acb0e027c351` | Primary key for dApp interactive customer chat, memory recall, and customer reply generation |
| **Noter Agent 1** 🎙️ | `81904fe13f3ab7a89d5b84e3d45ab8784d17e30a6df48cce5f04e8211d3d545d` | Automated note-taking agent for parsing WhatsApp transcripts & voice note facts (sizes, addresses) |
| **Noter Agent 2** 🎙️ | `9104ac7519a1c206dc4e802f33f18e1fa97db88008fdd85cc1109b39a200157f` | Secondary backup note-taking delegate key |
| **Researcher Agent** 📊 | `9b62efa4140cc53d9ed90e605379840c64fdb8cc4e35d42241a293363629d734` | Deep analytical agent key for customer debt ledger updates, risk auditing & purchasing trends |

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
        | - Web App Delegate Key      |     | - MerchantLedger object     |
        | - Noter Voice Agent Key     |     | - CustomerRecord table      |
        | - Researcher Analytical Key |     | - SettlementReceipt proof   |
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
- **Delegate Keys Control Bar**: Switch between `Web App`, `Noter`, and `Researcher` delegate keys in real-time.
- **Walrus Memory Explorer**: Query stored memory blobs via semantic `memwal_recall`.
- **Debt & Credit Ledger**: Track uncollected revenue in Naira (₦) and generate 1-click WhatsApp payment reminders.
- **Sui On-Chain Proofs**: Connect Sui Wallet (`@mysten/dapp-kit`) and create on-chain merchant ledgers.
- **System Prompt & Delegate Keys Hub**: Access all 4 registered public keys and prompt copy buttons.

---

## 📄 License

MIT License. See [LICENSE](file:///home/ebendttl/portfolio-projects/iranti/LICENSE) for details.
