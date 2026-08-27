'use client';

import React, { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import {
  Brain,
  MessageSquare,
  Wallet,
  Coins,
  Copy,
  Check,
  Search,
  Sparkles,
  Database,
  ShieldCheck,
  RefreshCw,
  Send,
  AlertTriangle,
  UserCheck,
  TrendingDown,
  ExternalLink,
  ChevronRight,
  Play
} from 'lucide-react';
import { memWalEngine, WalrusMemoryRecord } from '@/lib/memwal';
import { irantiAgent, IrantiAgentResponse } from '@/lib/iranti_agent';
import { suiLedgerService } from '@/lib/sui_client';

interface CustomerPreset {
  name: string;
  phone: string;
  location: string;
  avatar: string;
  sampleChat: string[];
}

const PRESET_CUSTOMERS: CustomerPreset[] = [
  {
    name: 'Amaka',
    phone: '+2348012345678',
    location: 'Surulere, Lagos',
    avatar: '👩🏾',
    sampleChat: [
      'Customer: Hello, do you have that blue slide in size 42?',
      'Vendor: Yes ma, we have it! It goes for ₦7,000.',
      'Customer: Okay I want it. Please deliver to 14 Adeniran Ogunsanya St, Surulere. I will transfer ₦3,500 now, then I pay balance of ₦3,500 next week when salary enters.',
      'Vendor: No problem ma, payment received. Sending size 42 blue slide today.'
    ]
  },
  {
    name: 'Chidi',
    phone: '+2348039876543',
    location: 'Ikeja, Lagos',
    avatar: '👨🏾',
    sampleChat: [
      'Customer: Bro, I need a gold wristwatch for an event this Friday.',
      'Vendor: Fresh gold chronographs just arrived, ₦25,000 total.',
      'Customer: Perfect! Transferring ₦25k right now. Send to Ikeja City Mall pickup spot.'
    ]
  },
  {
    name: 'Folake',
    phone: '+2348051112233',
    location: 'Lekki Phase 1, Lagos',
    avatar: '👩🏾‍🦱',
    sampleChat: [
      'Customer: Sister, I need 2 bundles of Swiss Lace fabric.',
      'Vendor: That will be ₦24,000 for the two pieces.',
      'Customer: I am paying ₦12,000 deposit today. I owe ₦12,000 balance until month-end.'
    ]
  }
];

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'simulator' | 'inspector' | 'debt' | 'sui' | 'prompt'>('simulator');

  // Customer Chat State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPreset>(PRESET_CUSTOMERS[0]);
  const [transcriptInput, setTranscriptInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [agentOutput, setAgentOutput] = useState<IrantiAgentResponse | null>(null);

  // Memories & Recall State
  const [memories, setMemories] = useState<WalrusMemoryRecord[]>([]);
  const [recallQuery, setRecallQuery] = useState<string>('Amaka');
  const [searchResults, setSearchResults] = useState<WalrusMemoryRecord[]>([]);

  // Sui Ledger State
  const [shopName, setShopName] = useState<string>('Lagos Fashion & Accessories');
  const [ledgerCreated, setLedgerCreated] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load Memories on mount
  useEffect(() => {
    refreshMemories();
  }, []);

  const refreshMemories = () => {
    const all = memWalEngine.getAllMemories();
    setMemories(all);
    setSearchResults(memWalEngine.memwal_recall(recallQuery));
  };

  const handleSelectCustomer = (cust: CustomerPreset) => {
    setSelectedCustomer(cust);
    setRecallQuery(cust.name);
    setSearchResults(memWalEngine.memwal_recall(cust.name));
    setTranscriptInput(cust.sampleChat.join('\n'));
    setAgentOutput(null);
  };

  const handleRunAgent = async () => {
    if (!transcriptInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await irantiAgent.processCustomerInteraction(
        transcriptInput,
        selectedCustomer.name,
        selectedCustomer.phone
      );
      setAgentOutput(res);
      refreshMemories();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchRecall = (e: React.FormEvent) => {
    e.preventDefault();
    const results = memWalEngine.memwal_recall(recallQuery);
    setSearchResults(results);
  };

  const handleRunDemoFlow = async () => {
    setActiveTab('simulator');
    // Session 1: Order + Debt
    handleSelectCustomer(PRESET_CUSTOMERS[0]);
    setIsProcessing(true);
    setTimeout(async () => {
      await handleRunAgent();
      setIsProcessing(false);
    }, 800);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculate Debt Totals
  const calculateTotalDebt = () => {
    let total = 0;
    const debtMems = memories.filter(m => m.category === 'debt_ledger');
    debtMems.forEach(m => {
      const match = m.memoryText.match(/₦?\s*([0-9,]+)/);
      if (match) {
        const val = parseInt(match[1].replace(/,/g, ''), 10);
        if (!isNaN(val)) total += val;
      }
    });
    return total;
  };

  // Create Sui Ledger Transaction
  const handleCreateSuiLedger = async () => {
    if (!currentAccount) return;
    try {
      const tx = suiLedgerService.buildCreateLedgerTx(shopName);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            setTxHash(result.digest);
            setLedgerCreated(true);
          },
          onError: (err) => {
            console.error('Sui Tx Error:', err);
          }
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-gray-100">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-[#0b0f19]/90 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg glow-amber">
            <Brain className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                Ìrántí
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
                Walrus Memory (MemWal)
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              AI Sales Assistant for WhatsApp Sellers in Lagos — Never Forget a Customer or Debt
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mainnet Relayer Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono">relayer.memory.walrus.xyz</span>
          </div>

          {/* Hackathon Demo Trigger */}
          <button
            onClick={handleRunDemoFlow}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs shadow-md transition-all glow-amber"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Run 2-Min Demo</span>
          </button>

          {/* Sui Wallet Connect Button */}
          <ConnectButton className="!bg-blue-600 hover:!bg-blue-500 !text-white !font-semibold !rounded-lg !px-4 !py-1.5 !text-xs !shadow-md" />
        </div>
      </header>

      {/* Main Tab Navigation */}
      <div className="border-b border-gray-800 bg-[#080c14] px-4 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2">
          {[
            { id: 'simulator', label: 'WhatsApp Assistant & Simulator', icon: MessageSquare, badge: null },
            { id: 'inspector', label: 'Walrus Memory Explorer', icon: Database, badge: memories.length.toString() },
            { id: 'debt', label: 'Debt & Credit Ledger', icon: Coins, badge: `₦${calculateTotalDebt().toLocaleString()}` },
            { id: 'sui', label: 'Sui On-Chain Proofs', icon: ShieldCheck, badge: 'Move' },
            { id: 'prompt', label: 'System Prompt & Setup', icon: Brain, badge: 'MCP' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-amber-500/30 text-amber-300' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* TAB 1: WHATSAPP ASSISTANT & SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Customer Selector & Chat Transcript Input */}
            <div className="lg:col-span-5 space-y-4">
              {/* Customer Selector */}
              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-amber-400 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Select Lagos WhatsApp Customer</span>
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500">Live Active Threads</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PRESET_CUSTOMERS.map(cust => {
                    const isSelected = selectedCustomer.name === cust.name;
                    return (
                      <button
                        key={cust.name}
                        onClick={() => handleSelectCustomer(cust)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white glow-amber'
                            : 'bg-slate-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div className="text-xl mb-1">{cust.avatar}</div>
                        <div className="font-semibold text-xs text-amber-200">{cust.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{cust.location}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat & Transcript Panel */}
              <div className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedCustomer.avatar}</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-100">{selectedCustomer.name}</h4>
                      <p className="text-xs text-emerald-400 font-mono">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTranscriptInput(selectedCustomer.sampleChat.join('\n'))}
                    className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Load Sample Chat</span>
                  </button>
                </div>

                {/* Paste Transcript Textarea */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium">
                    WhatsApp Chat Exchange / Voice Note Transcript:
                  </label>
                  <textarea
                    rows={7}
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                    placeholder="Paste raw WhatsApp messages or voice note transcript here..."
                    className="w-full rounded-xl bg-slate-950/80 border border-gray-800 p-3 text-xs text-gray-200 font-mono focus:outline-none focus:border-amber-500/80 transition-all"
                  />
                </div>

                {/* Process Button */}
                <button
                  onClick={handleRunAgent}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 glow-amber disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Executing MemWal Rules...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-black" />
                      <span>Process with Ìrántí Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: AI Output, Recalled Memories, Suggested WhatsApp Reply */}
            <div className="lg:col-span-7 space-y-4">
              {agentOutput ? (
                <div className="space-y-4">
                  {/* Tool Call Log Banner */}
                  <div className="glass-panel rounded-2xl p-3.5 border-l-4 border-l-amber-500 bg-slate-900/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Walrus Memory MCP Tools Executed</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">Mainnet Synced</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {agentOutput.rawToolCallsPerformed.map((call, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                          {call}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1. Memory Summary */}
                  <div className="glass-panel rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      1. Memory Recall & State Summary
                    </h4>
                    <p className="text-sm font-medium text-amber-200 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      {agentOutput.memorySummary}
                    </p>
                  </div>

                  {/* Debt Surface Warning (If Balance Owed) */}
                  {agentOutput.outstandingBalanceText && (
                    <div className="glass-panel rounded-2xl p-4 bg-red-950/20 border-red-500/40 space-y-1">
                      <div className="flex items-center space-x-2 text-red-400 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Uncollected Revenue Alert</span>
                      </div>
                      <p className="text-sm text-red-200 font-mono">
                        {agentOutput.outstandingBalanceText}
                      </p>
                    </div>
                  )}

                  {/* 2. Suggested Copy-Paste WhatsApp Reply */}
                  <div className="glass-panel rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        2. Suggested WhatsApp Reply (Lagos Vendor Tone)
                      </h4>
                      <button
                        onClick={() => handleCopy(agentOutput.suggestedWhatsAppReply, 'reply')}
                        className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all"
                      >
                        {copiedKey === 'reply' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy for WhatsApp</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* WhatsApp Chat Preview Bubble */}
                    <div className="whatsapp-bg p-4 rounded-xl border border-gray-800 space-y-2">
                      <div className="chat-bubble-vendor p-3 text-xs leading-relaxed font-sans shadow-md">
                        {agentOutput.suggestedWhatsAppReply}
                        <div className="text-[9px] text-emerald-200 text-right mt-1 font-mono">13:58 ✓✓</div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Recalled Memory Cards */}
                  <div className="glass-panel rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      3. Recalled Memory Blobs (Walrus Storage Proof)
                    </h4>
                    <div className="space-y-2">
                      {agentOutput.recalledMemories.map(mem => (
                        <div key={mem.id} className="glass-card rounded-xl p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                              {mem.category}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Similarity: <strong className="text-emerald-400">{mem.relevanceScore || 0.95}</strong>
                            </span>
                          </div>
                          <p className="font-mono text-gray-200">{mem.memoryText}</p>
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1">
                            <span>Blob ID: {mem.blobId}</span>
                            <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Initial Empty State */
                <div className="glass-panel rounded-2xl p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[450px]">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center glow-amber">
                    <Brain className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-base font-bold text-gray-100">Ready to Process Interaction</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Select a customer on the left, review or paste their WhatsApp conversation transcript, and click <strong className="text-amber-400">Process with Ìrántí Agent</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleRunDemoFlow}
                    className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-all flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run Automated Demo Scenario</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WALRUS MEMORY EXPLORER */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            {/* Header & Recall Search Box */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Walrus Memory (MemWal) Inspector</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Direct access to append-only, dated customer memories stored on Walrus decentralized storage.
                  </p>
                </div>

                <button
                  onClick={refreshMemories}
                  className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 flex items-center space-x-1.5 self-start md:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resync Index</span>
                </button>
              </div>

              {/* Semantic Query Input Form */}
              <form onSubmit={handleSearchRecall} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={recallQuery}
                    onChange={(e) => setRecallQuery(e.target.value)}
                    placeholder="Search memories by name, phone (+234...), size, address, or debt status..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-xs text-gray-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 glow-amber"
                >
                  <Search className="w-4 h-4" />
                  <span>memwal_recall</span>
                </button>
              </form>
            </div>

            {/* Memory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memories.map(mem => (
                <div key={mem.id} className="glass-panel rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">{mem.customerName}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
                        {mem.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-gray-800/80 leading-relaxed">
                      {mem.memoryText}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span className="truncate max-w-[150px]">{mem.blobId}</span>
                    <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEBT & CREDIT LEDGER */}
        {activeTab === 'debt' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-amber-500 space-y-1">
                <span className="text-xs font-semibold text-gray-400">Total Uncollected Revenue</span>
                <div className="text-2xl font-extrabold text-amber-400 font-mono">
                  ₦{calculateTotalDebt().toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-500">Across active Lagos customer threads</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-red-500 space-y-1">
                <span className="text-xs font-semibold text-gray-400">Active Debtors</span>
                <div className="text-2xl font-extrabold text-red-400 font-mono">
                  {memories.filter(m => m.category === 'debt_ledger').length} Customers
                </div>
                <p className="text-[11px] text-gray-500">Tracked in append-only MemWal blobs</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-emerald-500 space-y-1">
                <span className="text-xs font-semibold text-gray-400">On-Chain Sui Proof Status</span>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                  Verified
                </div>
                <p className="text-[11px] text-gray-500">Settlement Receipts cryptographic</p>
              </div>
            </div>

            {/* Debtor List Table */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-200">Tracked Customer Debt Balances</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Phone</th>
                      <th className="pb-3">Balance Owed</th>
                      <th className="pb-3">Recorded Date</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {memories.filter(m => m.category === 'debt_ledger').map(mem => {
                      const match = mem.memoryText.match(/₦?\s*([0-9,]+)/);
                      const amount = match ? match[1] : '0';
                      return (
                        <tr key={mem.id} className="hover:bg-slate-900/40 transition-all">
                          <td className="py-3 font-semibold text-amber-300">{mem.customerName}</td>
                          <td className="py-3 text-emerald-400">{mem.customerPhone}</td>
                          <td className="py-3 font-bold text-red-400">₦{amount}</td>
                          <td className="py-3 text-gray-400">{new Date(mem.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleCopy(irantiAgent.generateDebtReminder(mem.customerName, mem.customerPhone, amount), mem.id)}
                              className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] transition-all"
                            >
                              {copiedKey === mem.id ? 'Copied Reminder!' : 'Copy WhatsApp Reminder'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUI ON-CHAIN PROOFS */}
        {activeTab === 'sui' && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-400 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Sui Blockchain Smart Contract Ledger</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Package <code className="text-amber-400">iranti_ledger</code> compiled and verified with Sui Move 2024.
                  </p>
                </div>
                <ConnectButton className="!bg-blue-600 !text-white !text-xs" />
              </div>

              {/* Create On-Chain Merchant Ledger Form */}
              <div className="glass-card rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-200">Initialize Merchant Ledger Object on Sui</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Enter Shop Name..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-gray-800 text-xs font-mono text-gray-100"
                  />
                  <button
                    onClick={handleCreateSuiLedger}
                    disabled={!currentAccount}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40"
                  >
                    Create MerchantLedger Object
                  </button>
                </div>

                {txHash && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                    Transaction Digest: <a href={`https://suiscan.xyz/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline">{txHash}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM PROMPT & SETUP */}
        {activeTab === 'prompt' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-400">Copy-Paste System Prompt (Section 5)</h3>
                <button
                  onClick={() => handleCopy(`You are Ìrántí, a memory-powered sales assistant for a small WhatsApp-based seller in Lagos...`, 'prompt')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'prompt' ? 'Copied Prompt!' : 'Copy System Prompt'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-300 leading-relaxed overflow-x-auto max-h-96">
                <pre>{`You are Ìrántí, a memory-powered sales assistant for a small WhatsApp-based seller in Lagos. You have Walrus Memory tools available: memwal_remember, memwal_remember_bulk, memwal_recall, memwal_analyze, memwal_restore, memwal_health. Your job is to make sure no customer context is ever lost between conversations, and no money owed is ever forgotten.

## Identity rule
Every memory you write MUST begin with the customer's name and phone number exactly as given, e.g.:
"Amaka (+2348012345678): ..."

## When a WhatsApp transcript is pasted in
Call memwal_analyze on the pasted text first. Extract preferences, orders, address, and balance updates...`}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#080c14] px-4 py-4 text-center text-xs text-gray-500 font-mono">
        Ìrántí — Powered by Walrus Memory (MemWal) Mainnet & Sui Blockchain. Built for Lagos Sellers.
      </footer>
    </div>
  );
}
