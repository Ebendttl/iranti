# Ìrántí — The Customer Memory Agent for WhatsApp Sellers

**Ìrántí** (Yoruba: "memory") is an AI sales assistant that never forgets a
customer — built on Walrus Memory (MemWal).

---

## 1. The Real Problem

Most small sellers in Lagos — fashion resellers, phone accessory vendors,
cosmetics hustlers, thrift ("okrika") dealers — run their *entire* business
through WhatsApp DMs. A single vendor juggles hundreds of customer threads.

Every day this causes small, real losses:

- They re-ask a returning customer for their size, color preference, or
  delivery address — customer feels like "just another stranger," sale stalls.
- They send the wrong size again because they forgot last time's complaint.
- They lose track of **who is owing** ("I go pay next week" never gets
  followed up) — money quietly leaks out of the business.
- If a spouse, sibling, or new staff member has to reply to a chat, they have
  *zero* context and the customer has to repeat everything.

None of this is solved by "just read the chat history" — vendors don't have
time to scroll 300 messages before every reply, and WhatsApp search doesn't
know that "the blue one" three weeks ago means a size-42 blue slide.

## 2. What We Built

Ìrántí is a system prompt for an AI agent (Claude, via the Walrus Memory
skill/MCP) that a vendor talks to alongside their WhatsApp. After any
customer interaction, the vendor pastes in the message(s) or a quick voice
note transcript. The agent:

1. **Extracts** only the durable, decision-relevant facts (not the whole
   chat) and writes them to Walrus Memory, tagged to that customer.
2. **Recalls** everything known about a customer the moment their name or
   number comes up again, and drafts a reply that uses it naturally —
   referencing their size, last order, and any outstanding balance.
3. Tracks a running **debt/credit ledger** per customer so nothing owed is
   ever silently forgotten.

No app to build. No code. Just Claude + the Walrus Memory skill + this
prompt.

## 3. What It Remembers, When, and Why

| Memory type | Written when | Why it matters |
|---|---|---|
| Identity anchor (name + phone number, always in every memory string) | First interaction with a new customer | Recall is semantic search, not a database lookup — every memory must carry the identifier in plain text so future recalls can be filtered to the right person |
| Size / fit / color preference | Any time the customer states or confirms one | Prevents re-asking, prevents wrong-item mistakes |
| Delivery address | First time given, or when it changes | Saves re-asking on every order |
| Payment method preference | When observed or stated | Speeds up checkout |
| Order history (item, price, date) | After every completed sale | Basis for "want the same as last time?" upsells |
| Outstanding balance (amount owed, date incurred) | Any time a customer pays partially or asks for credit | This is the single highest-value memory — it's literally uncollected revenue if forgotten |
| Complaints / returns | Any time something goes wrong | Never repeat the same mistake with the same customer |
| Explicitly NOT stored | Small talk, greetings, one-off jokes, anything not needed for a future business decision | Keeps memory dense and cheap to embed/search instead of drowning signal in noise |

Every write is a **fresh, dated statement** (never edited in place, since
`remember()` is append-only) so recall can resolve conflicts by *most recent
date wins* — e.g. two memories about balance owed are reconciled by the
agent picking the latest one and noting the trend.

## 4. Setup (verified against the real docs and your screenshot)

**Important, confirmed from your screenshot:** the testnet/staging relayer
(`relayer-staging.memory.walrus.xyz`) is currently paused for a security
upgrade and returning stubbed writes — do not use it. Everything below
targets **mainnet/production only**: `https://relayer.memory.walrus.xyz`.

The genuinely no-code path (no terminal, no Node.js) is Claude's **Custom
Connector**, which uses a browser + Sui wallet sign-in instead of any key
paste:

1. In Claude (web or Desktop) → Settings → Connectors → **Add custom
   connector**.
2. Paste this MCP URL: `https://relayer.memory.walrus.xyz/api/mcp`
3. Claude opens a Walrus Memory consent screen. Connect a Sui wallet (create
   one free if you don't have it) and approve. This is a sponsored,
   gas-free transaction — you don't need WAL/SUI in the wallet for this
   step.
4. Back in Claude, ask "what MCP tools do you have?" — you should see
   `memwal_remember`, `memwal_recall`, `memwal_analyze`, `memwal_restore`,
   etc. Confirm at [memory.walrus.xyz](https://memory.walrus.xyz) that a
   delegate now appears on your account.
5. Paste the prompt in Section 5 below as a Claude Project's custom
   instructions (or just as the first message of a chat) and you're live.

If you'd rather use Claude Code instead of the web/Desktop app:
`/plugin marketplace add MystenLabs/MemWal` then
`/plugin install memwal@memwal-plugins`, restart, and let it run
`memwal_login` on first use.

## 5. The Exact Prompt (copy-paste ready)

This assumes the agent already has the `memwal_*` tools available (via the
connector or plugin above) — it doesn't call the SDK directly, it tells the
agent how and when to use the tools it already has.

```markdown
You are Ìrántí, a memory-powered sales assistant for a small WhatsApp-based
seller in Lagos. You have Walrus Memory tools available: memwal_remember,
memwal_remember_bulk, memwal_recall, memwal_analyze, memwal_restore,
memwal_health. Your job is to make sure no customer context is ever lost
between conversations, and no money owed is ever forgotten.

## Identity rule
Every memory you write MUST begin with the customer's name and phone number
exactly as given, e.g.:
"Amaka (+2348012345678): ..."
This is required because memwal_recall is semantic search over text, not an
exact-match database lookup — without the identifier written into the
memory text itself, you cannot reliably filter results back to one customer
later.

## When a WhatsApp transcript is pasted in
Call memwal_analyze on the pasted text first. It extracts and saves each
distinct fact (preference, order, balance change, complaint) as its own
memory automatically. After analyze runs, check its output against the
rules below and use memwal_remember for anything analyze may have missed —
especially balance changes, which must always state the new outstanding
amount explicitly, e.g. "Amaka (+2348012345678): owes ₦3,500 as of
2026-08-27 (was ₦7,000, paid ₦3,500 today)."

## When to WRITE a single memory (call memwal_remember)
Write a new, dated memory immediately when any of these happen, whether
from a pasted transcript or something the vendor tells you directly:
1. A customer states or confirms a preference (size, color, style, brand).
2. A customer gives or updates a delivery address.
3. A customer states a payment method preference.
4. An order is completed — record item(s), price, and date.
5. A balance changes — a customer pays partially, asks for credit, or
   settles a debt.
6. A complaint, wrong item, or return happens — record what went wrong and
   what was done about it.
If the vendor gives you several distinct facts about different customers at
once, use memwal_remember_bulk instead of separate calls.

Do NOT write memories for greetings, small talk, or anything that isn't
useful for a future business decision. If in doubt, ask: "would the vendor
want to know this the next time this customer messages, weeks from now?" If
no, don't store it.

## When to RECALL (call memwal_recall)
Before drafting ANY reply to, or summary of, a specific customer, first call
memwal_recall using their name and/or phone number as the query. Read every
result. If multiple memories about balance owed conflict, trust the most
recently dated one and mention the trend if it's relevant ("used to owe
₦7,000, now ₦3,500"). If memwal_recall unexpectedly returns nothing for a
customer you know you've stored before, call memwal_restore once before
concluding there's really no memory.

## How to use what you recall
When you draft a reply for the vendor to send (or send on their behalf if
asked), naturally weave in what you remember — don't just list facts. Good:
"Tell her: hey Amaka! Still on the size 42 in that blue slide? Also just a
gentle one — you're still owing ₦3,500 from last time, want me to add it to
this order?"
Bad: "Customer preferences: size 42. Balance: 3500."

## Output format for the vendor
Always respond to the vendor (not the customer directly) with:
1. A one-line summary of what you now remember/just recalled about this
   customer.
2. A suggested reply the vendor can copy straight into WhatsApp.
3. If a balance is owed, always surface it even if the vendor didn't ask.

## Housekeeping
If the vendor pastes in a whole day's worth of chats across many customers,
process them one customer at a time — one memwal_analyze or memwal_remember
call per customer's fact-worthy events, not one giant memory mixing several
customers.
```

## 6. Proof It Works — Demo Script for the Video

Keep it under 2 minutes:

1. **Session 1 (Monday):** Paste in a WhatsApp exchange where "Amaka,
   +2348012345678" orders a blue size-42 slide for ₦7,000 and pays ₦3,500,
   promising the rest "next week." Show the agent calling `memwal_analyze`
   (or `memwal_remember`) — screen-record the tool-call confirmation.
2. **Close the session entirely** (new chat, or fully quit/reopen Claude
   Desktop) to prove this isn't just in-context memory.
3. **Session 2 (days later, simulating "next week"):** Type just: "Amaka is
   messaging me again, what should I say?" Show the agent calling
   `memwal_recall` and returning the size preference, the order, and — most
   importantly — the ₦3,500 still owed, unprompted.
4. Show the raw `memwal_recall` tool output (the memory text + relevance
   score) as the literal "link to stored memory" evidence the submission
   requires, and/or open [memory.walrus.xyz](https://memory.walrus.xyz) and
   show the stored memories for your account/namespace directly in the
   dashboard.
5. One closing sentence on camera: "This is the exact prompt — anyone with
   Claude and the Walrus Memory connector can paste this in and get this for
   their own shop in five minutes, no code required."

## 7. Why This Should Win on the Stated Criteria

- **Solves a real problem, not a toy:** debt-tracking and re-explaining
  yourself are daily, concrete pain points for Lagos WhatsApp sellers — not
  a hypothetical.
- **Well-crafted memory rules:** the prompt above is explicit about what to
  store, when, in what format, and — just as important — what *not* to
  store, which is what separates a good memory design from "dump everything
  in a vector DB."
- **Reproducible:** it's one prompt + one `curl` command. Anyone — coder or
  not — can pick it up and run it in the time it takes to read this doc.
- **Original angle:** it goes beyond the example prompts the organizers gave
  (personal assistant / coding agent / research agent / relationship
  tracker) by targeting informal commerce, a use case specific to how Lagos
  actually does business.

## 8. Fast Setup Checklist for Hackathon Day

1. Follow Section 4 to connect Claude to Walrus Memory via the **Custom
   Connector** (mainnet URL, Sui wallet sign-in, no code) — or the Claude
   Code plugin if you're comfortable with a terminal.
2. Confirm it worked: ask Claude "what MCP tools do you have?" and check
   [memory.walrus.xyz](https://memory.walrus.xyz) shows an active delegate.
3. Paste the prompt in Section 5 as your Claude Project's custom
   instructions (or the opening message of a chat).
4. Run through the demo script in Section 6 with two or three fictional (or
   real, anonymized) customers to show it generalizes, not just a single
   lucky example.
5. Record the short video, grab the `memwal_recall` output (or a dashboard
   screenshot) as your proof link, and write up the four submission fields
   (prompt / what you built / what it remembers / proof) using this doc as
   your source.

## 9. Known Gotchas (from the live docs + your screenshot)

- **Testnet/staging is currently down for a security upgrade** as of early
  August 2026 — always use the mainnet relayer
  (`relayer.memory.walrus.xyz`), not staging.
- **Namespace matching is exact-string.** If you ever switch to the SDK/CLI
  path instead of the connector, a typo'd namespace silently creates a new,
  empty memory space instead of erroring.
- **Recall is semantic, not exact-match** — this is *why* every memory
  string needs the customer's name/phone baked in (see the Identity rule in
  the prompt); relying on recall alone to disambiguate two similarly-worded
  customers will occasionally misfire.
- If `memwal_recall` ever comes back empty for a customer you know you
  stored, that's what `memwal_restore` is for — it rebuilds the index from
  the durable Walrus blobs rather than the (possibly stale) local index.

---

*Sourced from the live Walrus Memory docs (docs.wal.app/walrus-memory),
the MCP/Claude Connector/Claude Desktop pages, the GitHub repo
(MystenLabs/MemWal), the Walrus blog post on portable Claude Code memory,
and the two screenshots of the SuiHub Lagos resources page and a MemWal
demo repo's `.env.example`. I still could not load the Notion pages
themselves (both require JavaScript/login in this environment) — worth a
quick manual check for any hackathon-specific account or dashboard steps
that might differ from the public docs.*
