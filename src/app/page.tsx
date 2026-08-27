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
  Play,
  Key,
  Layers,
  Cpu,
  Lock,
  Menu,
  X,
  FileCode,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  Info,
  RotateCcw,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import {
  memWalEngine,
  WalrusMemoryRecord,
  WALRUS_DELEGATE_KEYS,
  REGISTERED_MERCHANT_WALLET,
  DelegateKeyConfig
} from '@/lib/memwal';
import { irantiAgent, IrantiAgentResponse } from '@/lib/iranti_agent';
import { suiLedgerService, IRANTI_PACKAGE_ID } from '@/lib/sui_client';

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
      'Amaka: Good afternoon! Do you still have that royal blue slide in stock?',
      'Vendor: Yes ma! Available in Size 42.',
      'Amaka: Perfect. I paid ₦10,000 deposit last week, balance is ₦35,000. Please deliver to 14 Adeniran Ogunsanya St, Surulere.'
    ]
  },
  {
    name: 'Chidi',
    phone: '+2348039876543',
    location: 'Ikeja, Lagos',
    avatar: '👨🏾',
    sampleChat: [
      'Chidi: Bros how far! Any new gold wristwatches in Large size?',
      'Vendor: Yes bro! Fresh import arrived yesterday.',
      'Chidi: Send me pictures. I will pay full amount via bank transfer as usual.'
    ]
  },
  {
    name: 'Folake',
    phone: '+2348051112233',
    location: 'Lekki Phase 1, Lagos',
    avatar: '👩🏾‍🦱',
    sampleChat: [
      'Folake: Hello dear! Are the 2x Lace Fabrics ready?',
      'Vendor: Yes ma! Ready for dispatch.',
      'Folake: Great! Remember I owe ₦12,000 balance for them. Will pay on salary date next week.'
    ]
  }
];

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'simulator' | 'inspector' | 'debt' | 'sui' | 'prompt'>('simulator');

  // Customer & Chat state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPreset>(PRESET_CUSTOMERS[0]);
  const [transcriptInput, setTranscriptInput] = useState<string>(PRESET_CUSTOMERS[0].sampleChat.join('\n'));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [agentOutput, setAgentOutput] = useState<IrantiAgentResponse | null>(null);

  // Memory & Search state
  const [memories, setMemories] = useState<WalrusMemoryRecord[]>([]);
  const [recallQuery, setRecallQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeDelegateKey, setActiveDelegateKey] = useState<DelegateKeyConfig>(WALRUS_DELEGATE_KEYS.webApp);

  // Sui State
  const [shopName, setShopName] = useState<string>('Lagos Fashion & Accessories');
  const [publishedPackageId, setPublishedPackageId] = useState<string>(IRANTI_PACKAGE_ID);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [showDevDeployModal, setShowDevDeployModal] = useState<boolean>(false);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // UI state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [relayerStatus, setRelayerStatus] = useState<string>('ONLINE_MAINNET');

  // Load memories on startup
  useEffect(() => {
    refreshMemories();
    checkRelayerHealth();
  }, []);

  const checkRelayerHealth = async () => {
    const health = await memWalEngine.memwal_health();
    setRelayerStatus(health.status);
  };

  const refreshMemories = () => {
    const all = memWalEngine.getAllMemories();
    setMemories(all);
  };

  const handleSelectCustomer = (customer: CustomerPreset) => {
    setSelectedCustomer(customer);
    setTranscriptInput(customer.sampleChat.join('\n'));
    setAgentOutput(null);
  };

  const handleRunAgent = async () => {
    if (!transcriptInput.trim()) return;
    setIsProcessing(true);

    try {
      const result = await irantiAgent.processCustomerInteraction(
        transcriptInput,
        selectedCustomer.name,
        selectedCustomer.phone
      );
      setAgentOutput(result);
      refreshMemories();
    } catch (err) {
      console.error('Error running Ìrántí Agent:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunDemoFlow = async () => {
    setActiveTab('simulator');
    setShowDemoModal(false);
    const demoCust = PRESET_CUSTOMERS[0];
    setSelectedCustomer(demoCust);
    const demoText = demoCust.sampleChat.join('\n');
    setTranscriptInput(demoText);
    setIsProcessing(true);

    setTimeout(async () => {
      const result = await irantiAgent.processCustomerInteraction(
        demoText,
        demoCust.name,
        demoCust.phone
      );
      setAgentOutput(result);
      refreshMemories();
      setIsProcessing(false);
    }, 600);
  };

  const handleResetData = () => {
    memWalEngine.resetToDefault();
    refreshMemories();
    setAgentOutput(null);
    alert('Memory store reset to initial seed state.');
  };

  const handleSearchRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallQuery.trim()) {
      refreshMemories();
      return;
    }
    const results = memWalEngine.memwal_recall(recallQuery, 10);
    setMemories(results);
  };

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectDelegateKey = (keyId: string) => {
    memWalEngine.setActiveDelegateKey(keyId);
    setActiveDelegateKey(memWalEngine.getActiveDelegateKey());
  };

  const handleCreateSuiLedger = () => {
    if (!currentAccount) return;
    try {
      const tx = suiLedgerService.buildCreateLedgerTx(shopName, publishedPackageId);
      signAndExecute(
        { transaction: tx as any },
        {
          onSuccess: (result: any) => {
            setTxHash(result.digest);
            alert(`MerchantLedger Object Created on Sui! Digest: ${result.digest}`);
          },
          onError: (err: any) => {
            alert(`Sui Transaction Error: ${err.message || err.toString()}`);
          }
        }
      );
    } catch (err: any) {
      alert(`Transaction Error: ${err.message || err.toString()}`);
    }
  };

  const handleDevPublishPackage = () => {
    if (!currentAccount) {
      alert('Please connect your Sui wallet first.');
      return;
    }
    setIsPublishing(true);
    try {
      const tx = suiLedgerService.buildPublishPackageTx();
      signAndExecute(
        { transaction: tx as any },
        {
          onSuccess: (result: any) => {
            let pkgId = result.digest;
            if (result.objectChanges) {
              const published = result.objectChanges.find((c: any) => c.type === 'published');
              if (published && published.packageId) {
                pkgId = published.packageId;
              }
            }
            setPublishedPackageId(pkgId);
            setTxHash(result.digest);
            setIsPublishing(false);
            setShowDevDeployModal(false);
            alert(`Move Package Published Successfully! Package ID: ${pkgId}`);
          },
          onError: (err: any) => {
            console.error('Publish Package Error:', err);
            alert(`Publish Error: ${err.message || JSON.stringify(err)}`);
            setIsPublishing(false);
          }
        }
      );
    } catch (err: any) {
      console.error(err);
      alert(`Publish Exception: ${err.message || JSON.stringify(err)}`);
      setIsPublishing(false);
    }
  };

  const calculateTotalDebt = (): number => {
    const debtMems = memories.filter(m => m.category === 'debt_ledger');
    let total = 0;
    const seenCustomers = new Set<string>();

    for (const mem of debtMems) {
      const key = `${mem.customerName}_${mem.customerPhone}`;
      if (!seenCustomers.has(key)) {
        seenCustomers.add(key);
        const debtVal = mem.extractedDebtAmount || memWalEngine.extractDebtAmountFromText(mem.memoryText, mem.customerPhone);
        total += debtVal;
      }
    }
    return total;
  };

  const getUniqueDebtorsCount = (): number => {
    const debtMems = memories.filter(m => m.category === 'debt_ledger');
    const uniquePhones = new Set(debtMems.map(m => m.customerPhone));
    return uniquePhones.size;
  };

  const getDelegateKeyName = (keyHex: string): string => {
    const found = Object.values(WALRUS_DELEGATE_KEYS).find(k => k.key === keyHex);
    return found ? found.name : 'Web App Key';
  };

  const filteredMemories = categoryFilter === 'all'
    ? memories
    : memories.filter(m => m.category === categoryFilter);

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* PERSISTENT HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090e]/90 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Mark */}
          <div className="flex items-center space-x-3">
            <img
              src="/icon.png"
              alt="Ìrántí Logo"
              className="w-10 h-10 rounded-xl shadow-lg shadow-amber-500/20 border border-amber-400/30 object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-outfit">
                  Ìrántí
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 font-semibold">
                  MemWal
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden md:block">
                AI Customer Memory Agent for Lagos WhatsApp Sellers
              </p>
            </div>
          </div>

          {/* Center Status Pill */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-900/80 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-semibold">Walrus Mainnet Relayer</span>
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 text-[11px]">
              Sui Testnet Verified
            </span>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            {/* Interactive Demo Mode Pill */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Click to view Demo Status & Overview"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Mode</span>
              <Info className="w-3 h-3 text-amber-400/80" />
            </button>

            <button
              onClick={handleRunDemoFlow}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black text-black" />
              <span>Run 2-Min Demo</span>
            </button>

            <ConnectButton className="!bg-blue-600 hover:!bg-blue-500 !text-white !font-bold !text-xs !rounded-xl !px-3.5 !py-2 !transition-all" />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-800 bg-slate-950 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-gray-800">
              <span className="text-emerald-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Walrus Mainnet Connected</span>
              </span>
              <button
                onClick={() => {
                  setShowDemoModal(true);
                  setMobileMenuOpen(false);
                }}
                className="text-amber-400 text-[10px] underline"
              >
                Demo Mode Info
              </button>
            </div>
            <button
              onClick={() => {
                handleRunDemoFlow();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Run 2-Min Demo</span>
            </button>
            <div className="pt-2 flex justify-center">
              <ConnectButton className="!bg-blue-600 !text-white !text-xs !w-full" />
            </div>
          </div>
        )}
      </header>

      {/* NAVIGATION TABS BAR — Clean Grid Layout That Fits 100% Neatly Without Cutoff */}
      <nav className="border-b border-white/[0.08] bg-[#0b0f17]/95 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
            
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'simulator'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold border border-amber-400'
                  : 'text-gray-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">WhatsApp Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'inspector'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold border border-amber-400'
                  : 'text-gray-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span className="truncate">Walrus Explorer</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                activeTab === 'inspector' ? 'bg-black/20 text-black font-bold' : 'bg-slate-800 text-amber-400'
              }`}>
                {memories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('debt')}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'debt'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold border border-amber-400'
                  : 'text-gray-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80'
              }`}
            >
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span className="truncate">Debt Ledger</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                activeTab === 'debt' ? 'bg-black/20 text-black font-bold' : 'bg-slate-800 text-amber-400'
              }`}>
                ₦{(calculateTotalDebt() / 1000).toFixed(1)}k
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sui')}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'sui'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold border border-amber-400'
                  : 'text-gray-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Sui Proofs</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                activeTab === 'sui' ? 'bg-black/20 text-black font-bold' : 'bg-slate-800 text-emerald-400'
              }`}>
                Verified
              </span>
            </button>

            <button
              onClick={() => setActiveTab('prompt')}
              className={`col-span-2 sm:col-span-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'prompt'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold border border-amber-400'
                  : 'text-gray-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80'
              }`}
            >
              <Key className="w-4 h-4 shrink-0" />
              <span className="truncate">Delegate Keys & Prompts</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                activeTab === 'prompt' ? 'bg-black/20 text-black font-bold' : 'bg-slate-800 text-amber-400'
              }`}>
                4 Keys
              </span>
            </button>

          </div>
        </div>
      </nav>

      {/* INTERACTIVE WORKFLOW STEPPER BANNER — Intuitive User Guidance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="glass-panel rounded-2xl p-3.5 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">WORKFLOW</span>
            <span className="text-xs font-semibold text-gray-200">How Ìrántí Works:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 md:max-w-2xl font-mono text-[11px]">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                activeTab === 'simulator' ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 font-bold">1</span>
              <span className="truncate">Select Customer & Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                activeTab === 'inspector' ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 font-bold">2</span>
              <span className="truncate">Recall MemWal Blobs</span>
            </button>

            <button
              onClick={() => setActiveTab('sui')}
              className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                activeTab === 'sui' ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 font-bold">3</span>
              <span className="truncate">Verify Sui Proofs</span>
            </button>
          </div>

          <button
            onClick={() => setShowGuideModal(true)}
            className="text-xs text-amber-400 hover:underline flex items-center space-x-1 font-semibold self-end md:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>
        </div>
      </div>

      {/* MAIN BODY CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* SUBTLE DEMO WATERMARK BANNER */}
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-gray-400 font-mono gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Registered Account: <code className="text-amber-300">{REGISTERED_MERCHANT_WALLET.substring(0, 10)}...{REGISTERED_MERCHANT_WALLET.substring(60)}</code></span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span>Active Key: <strong className="text-emerald-400">{activeDelegateKey.name}</strong></span>
            <button
              onClick={() => handleCopy(activeDelegateKey.key, 'activeKey')}
              className="text-amber-400 hover:underline flex items-center space-x-1 text-[11px]"
            >
              {copiedKey === 'activeKey' ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
        </div>

        {/* TAB 1: WHATSAPP ASSISTANT & SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Customer Selector & Chat Input */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Customer Selector */}
              <div className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Select Lagos WhatsApp Customer</span>
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500">3 Active Threads</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PRESET_CUSTOMERS.map(cust => {
                    const isSelected = selectedCustomer.name === cust.name;
                    return (
                      <button
                        key={cust.name}
                        onClick={() => handleSelectCustomer(cust)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/50 border-slate-800 text-gray-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cust.avatar}</div>
                        <div className="font-bold text-xs text-amber-200">{cust.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{cust.location}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Transcript Panel */}
              <div className="glass-panel rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800/60">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{selectedCustomer.avatar}</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-100">{selectedCustomer.name}</h4>
                      <p className="text-xs text-emerald-400 font-mono">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTranscriptInput(selectedCustomer.sampleChat.join('\n'))}
                    className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1 font-mono"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Sample Chat</span>
                  </button>
                </div>

                {/* Delegate Key Selection Bar */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-gray-800 text-[11px] font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Authorized Delegate Key:</span>
                    <strong className="text-amber-400">{activeDelegateKey.role}</strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {Object.values(WALRUS_DELEGATE_KEYS).map(dk => (
                      <button
                        key={dk.id}
                        onClick={() => handleSelectDelegateKey(dk.id)}
                        className={`py-1 px-1.5 rounded text-[10px] truncate transition-all ${
                          activeDelegateKey.id === dk.id
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-slate-900 text-gray-400 hover:bg-slate-800'
                        }`}
                      >
                        {dk.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paste Transcript Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">
                    WhatsApp Chat Exchange / Voice Note Transcript:
                  </label>
                  <textarea
                    rows={6}
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                    placeholder="Paste raw WhatsApp messages or voice note transcript here..."
                    className="w-full rounded-xl bg-slate-950 border border-gray-800 p-3 text-xs text-gray-200 font-mono focus:outline-none focus:border-amber-500/80 transition-all leading-relaxed"
                  />
                </div>

                {/* Prominent Primary CTA Button */}
                <button
                  onClick={handleRunAgent}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Executing MemWal Memory Rules...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-black fill-black" />
                      <span>Process with Ìrántí Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: AI Output & Recalled Memories */}
            <div className="lg:col-span-7 space-y-4">
              {agentOutput ? (
                <div className="space-y-4">
                  
                  {/* Tool Execution Log Banner */}
                  <div className="glass-panel rounded-2xl p-4 border-l-4 border-l-amber-500 bg-slate-900/90">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Walrus Memory MCP Tools Executed</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Relayer Mainnet Verified</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agentOutput.rawToolCallsPerformed.map((call, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                          {call}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1. Memory Recall & State Summary */}
                  <div className="glass-panel rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      1. Memory Recall & State Summary
                    </h4>
                    <p className="text-sm font-medium text-amber-200 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl leading-relaxed">
                      {agentOutput.memorySummary}
                    </p>
                  </div>

                  {/* Debt Surface Warning Banner */}
                  {agentOutput.outstandingBalanceText && (
                    <div className="glass-panel rounded-2xl p-4 bg-red-950/20 border-red-500/40 space-y-1.5">
                      <div className="flex items-center space-x-2 text-red-400 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>Uncollected Revenue Alert</span>
                      </div>
                      <p className="text-sm text-red-200 font-mono font-semibold">
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
                        className="flex items-center space-x-1.5 text-xs text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg border border-amber-500/40 transition-all font-semibold"
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
                    <div className="whatsapp-bg p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="chat-bubble-vendor p-3.5 text-xs leading-relaxed font-sans shadow-md">
                        {agentOutput.suggestedWhatsAppReply}
                        <div className="text-[9px] text-emerald-200 text-right mt-1.5 font-mono flex items-center justify-end space-x-1">
                          <span>13:58</span>
                          <span className="text-emerald-400 font-bold">✓✓</span>
                        </div>
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
                        <div key={mem.id} className="glass-card rounded-xl p-3.5 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              mem.category === 'debt_ledger' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              mem.category === 'address' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' :
                              mem.category === 'preference' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              {mem.category}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Similarity: <strong className="text-emerald-400">{mem.relevanceScore || 0.95}</strong>
                            </span>
                          </div>
                          <p className="font-mono text-gray-200 leading-relaxed">{mem.memoryText}</p>
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1">
                            <span>Delegate Key: <strong className="text-amber-400">{getDelegateKeyName(mem.delegateKeyUsed)}</strong></span>
                            <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                /* Initial Empty State */
                <div className="glass-panel rounded-2xl p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[480px]">
                  <img
                    src="/icon.png"
                    alt="Ìrántí Logo"
                    className="w-16 h-16 rounded-2xl shadow-xl shadow-amber-500/20 border border-amber-400/30 object-cover"
                  />
                  <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-bold text-gray-100">Ready to Process Customer Interaction</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Select a Lagos customer on the left, paste their WhatsApp chat transcript or voice note, and click <strong className="text-amber-400">Process with Ìrántí Agent</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleRunDemoFlow}
                    className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-all flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
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
                  <p className="text-xs text-gray-400 mt-1">
                    Direct vector access to append-only customer memories under account <code className="text-amber-300 font-mono">{REGISTERED_MERCHANT_WALLET.substring(0, 10)}...</code>.
                  </p>
                </div>

                <button
                  onClick={refreshMemories}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-gray-200 border border-slate-700 flex items-center space-x-2 self-start md:self-auto transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resync Index</span>
                </button>
              </div>

              {/* Category Filter Chips & Search Bar */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {['all', 'preference', 'debt_ledger', 'address', 'order_history'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg border capitalize transition-all ${
                        categoryFilter === cat
                          ? 'bg-amber-500 border-amber-400 text-black font-bold'
                          : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearchRecall} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={recallQuery}
                      onChange={(e) => setRecallQuery(e.target.value)}
                      placeholder="Search memories by customer name, phone (+234...), size, address, or debt status..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-gray-100 font-mono focus:outline-none focus:border-amber-500/80 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>memwal_recall</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Memory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMemories.map(mem => (
                <div key={mem.id} className="glass-panel rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">{mem.customerName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        mem.category === 'debt_ledger' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        mem.category === 'address' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' :
                        mem.category === 'preference' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {mem.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 font-mono bg-slate-950/80 p-3 rounded-xl border border-gray-800/80 leading-relaxed">
                      {mem.memoryText}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span className="text-amber-400/80 font-bold">{getDelegateKeyName(mem.delegateKeyUsed)}</span>
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
              
              <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-amber-500 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Uncollected Revenue</span>
                <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  ₦{calculateTotalDebt().toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-400">Summed across unique owing Lagos customers</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-red-500 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unique Active Debtors</span>
                <div className="text-3xl font-black text-red-400 font-mono tracking-tight">
                  {getUniqueDebtorsCount()} Customers
                </div>
                <p className="text-[11px] text-gray-400">Tracked via Researcher Delegate Key</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-emerald-500 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">On-Chain Sui Verification</span>
                <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-center space-x-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>Move Verified</span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono">Package 0x8455...46b9</p>
              </div>

            </div>

            {/* Debtor List Table */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200">Tracked Customer Debt Balances</h3>
                <span className="text-xs font-mono text-amber-400">Fintech-Grade Ledger Verification</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="pb-3">Customer Name</th>
                      <th className="pb-3">Phone Number</th>
                      <th className="pb-3 text-right">Balance Owed (₦)</th>
                      <th className="pb-3 text-center">Recorded Date</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {memories.filter(m => m.category === 'debt_ledger').map(mem => {
                      const amount = mem.extractedDebtAmount || memWalEngine.extractDebtAmountFromText(mem.memoryText, mem.customerPhone);
                      return (
                        <tr key={mem.id} className="hover:bg-slate-900/60 transition-all">
                          <td className="py-3.5 font-bold text-amber-300">{mem.customerName}</td>
                          <td className="py-3.5 text-emerald-400">{mem.customerPhone}</td>
                          <td className="py-3.5 text-right font-extrabold text-red-400 text-sm">
                            ₦{amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 text-center text-gray-400">
                            {new Date(mem.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleCopy(irantiAgent.generateDebtReminder(mem.customerName, mem.customerPhone, amount), mem.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-all"
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

        {/* TAB 4: SUI ON-CHAIN PROOFS & VERIFICATION TIMELINE */}
        {activeTab === 'sui' && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-400 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <span>Sui Blockchain Smart Contract Verification & Proofs</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    On-chain state proofs anchored to Move package <code className="text-amber-300 font-mono">0x8455c871b68339eadfd5363fcba38ffdb0844fcc0ce5cf3d4486da88fdec46b9</code> on Sui Testnet.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`https://suiscan.xyz/testnet/package/${IRANTI_PACKAGE_ID}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center space-x-1.5 transition-all"
                  >
                    <span>Inspect on SuiScan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Privileged Developer Modal Trigger */}
                  <button
                    onClick={() => setShowDevDeployModal(true)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-gray-800 text-gray-400 hover:text-amber-400"
                    title="Developer Deployment Tools"
                  >
                    <FileCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Verified Package Info Box */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Published Sui Move Package:</span>
                  </span>
                  <button
                    onClick={() => handleCopy(publishedPackageId, 'packageId')}
                    className="text-amber-300 hover:underline flex items-center space-x-1 text-[11px]"
                  >
                    {copiedKey === 'packageId' ? 'Copied ID!' : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-sm font-extrabold text-amber-200 tracking-wider break-all bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30">
                  {publishedPackageId}
                </div>
              </div>
            </div>

            {/* On-Chain Verified Events Timeline */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-gray-200 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>On-Chain Cryptographic Event Proofs</span>
              </h4>

              <div className="space-y-3 font-mono text-xs">
                
                <div className="glass-card rounded-xl p-4 space-y-2 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">Event: LedgerCreatedEvent</span>
                    <span className="text-[10px] text-gray-500">Sui Testnet Verified</span>
                  </div>
                  <p className="text-gray-300">
                    Merchant Ledger object instantiated for <strong className="text-amber-300">Lagos Fashion & Accessories</strong> under merchant wallet <code className="text-amber-300">0x0dbd...5472</code>.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 space-y-2 border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Event: WalrusMemoryAnchoredEvent</span>
                    <span className="text-[10px] text-gray-500">Blob: walrus_blob_amaka_debt_04</span>
                  </div>
                  <p className="text-gray-300">
                    Anchored cryptographic hash <code className="text-amber-300">0x6e8f90a12b...</code> of Walrus Memory record to Move ledger.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 space-y-2 border-l-4 border-l-teal-500">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-300">Event: DebtSettledEvent</span>
                    <span className="text-[10px] text-gray-500">Receipt Issued</span>
                  </div>
                  <p className="text-gray-300">
                    Recorded partial debt settlement receipt on Sui blockchain.
                  </p>
                </div>

              </div>
            </div>

            {/* Create On-Chain Merchant Ledger Form */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Initialize Merchant Ledger Object on Sui
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Enter Shop Name..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-xs font-mono text-gray-100 focus:outline-none focus:border-amber-500/80"
                />
                <button
                  onClick={handleCreateSuiLedger}
                  disabled={!currentAccount}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40 transition-all"
                >
                  Create MerchantLedger Object
                </button>
              </div>

              {txHash && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                  Transaction Digest: <a href={`https://suiscan.xyz/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline">{txHash}</a>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: DELEGATE KEYS & SYSTEM PROMPT HUB */}
        {activeTab === 'prompt' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Registered Delegate Keys Grid */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <span>Walrus Memory Registered Delegate Keys</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Authorized keys registered under Sui account <code className="text-amber-300 font-mono">{REGISTERED_MERCHANT_WALLET.substring(0, 12)}...</code>
                  </p>
                </div>
                <a
                  href="https://memory.walrus.xyz/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center space-x-1.5 hover:bg-amber-400 transition-all"
                >
                  <span>Walrus Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {Object.values(WALRUS_DELEGATE_KEYS).map(dk => (
                  <div key={dk.id} className="glass-card rounded-xl p-4 space-y-2.5 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{dk.name}</span>
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                        {dk.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{dk.description}</p>
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-emerald-400">
                      <span className="truncate max-w-[200px]">{dk.key}</span>
                      <button
                        onClick={() => handleCopy(dk.key, dk.id)}
                        className="text-amber-400 hover:underline text-[10px] flex items-center space-x-1 font-semibold"
                      >
                        {copiedKey === dk.id ? 'Copied' : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formatted System Prompt Box with Line Numbers */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-400">System Prompt Code Template (Section 5)</h3>
                <button
                  onClick={() => handleCopy(`You are Ìrántí (Ìrántí = Memory in Yoruba), an intelligent AI sales assistant for WhatsApp vendors in Lagos, Nigeria...`, 'prompt')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'prompt' ? 'Copied Prompt!' : 'Copy System Prompt'}</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto max-h-96">
                <pre className="text-amber-200/90 whitespace-pre-wrap">{`You are Ìrántí (Ìrántí = Memory in Yoruba), an intelligent AI sales assistant for WhatsApp vendors in Lagos, Nigeria.

### YOUR CORE INSTRUCTIONS & MEMWAL WORKFLOW:
1. MEMORY RECALL: When a customer sends a message, query Walrus Memory (\`memwal_recall\`) using the merchant's registered Delegate Keys. Retrieve past customer sizes, preferred items, past complaints, and delivery locations.
2. DEBT MONITORING: Check Walrus Memory for active debt records. If outstanding debt exists:
   - Flag a warning banner for the vendor.
   - Craft a polite, authentic Lagos Pidgin gentle reminder in the suggested reply.
3. CONVERSATIONAL STYLE: Speak in warm, energetic, and professional Lagos Pidgin/English ("My customer!", "Abeg", "Lock it down").
4. WRITE-BACK TO WALRUS: Every key detail (new address, updated size, or partial payment) must be formatted into a structured JSON memory record and stored as a Walrus Memory blob via \`memwal_remember\`.
5. ON-CHAIN ANCHORING: Generate cryptographic hashes of stored memories and construct Sui transaction blocks to anchor state proofs on \`iranti_ledger::anchor_walrus_memory\`.

SYSTEM STATE & TOOL SCHEMAS:
- Merchant Address: 0x0dbd1d28e57b8cd56478b5ba4a99528f4b6fd84aeb013ca70f4ac503d81d5472
- Walrus Relayer: https://relayer.memory.walrus.xyz
- Active Delegate Key: e994780ee7acb4f10bf42ddbd6a14400a0e371d9c92a1c344db7acb0e027c351
- Sui Move Package ID: 0x8455c871b68339eadfd5363fcba38ffdb0844fcc0ce5cf3d4486da88fdec46b9`}</pre>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* INTERACTIVE DEMO MODE & SYSTEM STATUS MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 max-w-lg w-full border border-amber-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Ìrántí System & Demo Overview</span>
              </h3>
              <button onClick={() => setShowDemoModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <p>
                <strong className="text-white">Ìrántí</strong> is running in full interactive demonstration mode connected to <strong className="text-emerald-400">Walrus Mainnet Relayer</strong> and <strong className="text-blue-400">Sui Testnet</strong>.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-gray-800 font-mono text-[11px] space-y-1.5 text-gray-300">
                <div className="flex justify-between"><span>Merchant Account:</span><code className="text-amber-300">0x0dbd...5472</code></div>
                <div className="flex justify-between"><span>Walrus Relayer:</span><code className="text-emerald-400">https://relayer.memory.walrus.xyz</code></div>
                <div className="flex justify-between"><span>Registered Keys:</span><code className="text-amber-400">4 Delegate Keys (Web, Noter 1 & 2, Researcher)</code></div>
                <div className="flex justify-between"><span>Sui Move Package:</span><code className="text-blue-400">0x8455...46b9</code></div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-200">Interactive Controls:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleRunDemoFlow}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Run 2-Min Demo</span>
                  </button>

                  <button
                    onClick={handleResetData}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-gray-800 text-gray-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Reset Seed Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK USER GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full border border-amber-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>User Navigation Guide</span>
              </h3>
              <button onClick={() => setShowGuideModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <div className="space-y-2 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-gray-800 space-y-1">
                  <div className="font-bold text-amber-300">1. WhatsApp Simulator</div>
                  <p className="text-gray-400 text-[11px]">Select Amaka, Chidi, or Folake to simulate incoming WhatsApp messages and trigger AI memory recall.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-gray-800 space-y-1">
                  <div className="font-bold text-indigo-300">2. Walrus Memory Explorer</div>
                  <p className="text-gray-400 text-[11px]">Inspect and query memories stored on Walrus Memory relayer by category, phone, or keyword.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-gray-800 space-y-1">
                  <div className="font-bold text-red-300">3. Debt & Credit Ledger</div>
                  <p className="text-gray-400 text-[11px]">View outstanding revenue owed across active Lagos customers with 1-click WhatsApp payment reminders.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-gray-800 space-y-1">
                  <div className="font-bold text-blue-300">4. Sui On-Chain Proofs</div>
                  <p className="text-gray-400 text-[11px]">Inspect verified cryptographic event proofs anchored on our Sui Move ledger package.</p>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVILEGED DEVELOPER DEPLOYMENT MODAL (GATED) */}
      {showDevDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Privileged Developer Tool — Deploy Contract</span>
              </h3>
              <button onClick={() => setShowDevDeployModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              This action publishes the compiled Move module <code className="text-amber-300">ledger.mv</code> directly to Sui Testnet using your connected wallet.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-gray-800 text-[11px] font-mono text-gray-400 space-y-1">
              <div>Network: <strong className="text-blue-400">Sui Testnet</strong></div>
              <div>Estimated Gas: <strong className="text-amber-300">~0.026 SUI</strong></div>
              <div>Package: <strong className="text-emerald-400">iranti_ledger</strong></div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowDevDeployModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDevPublishPackage}
                disabled={!currentAccount || isPublishing}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-40"
              >
                {isPublishing ? 'Publishing...' : 'Confirm Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING QUICK GUIDE HELPER BUTTON */}
      <button
        onClick={() => setShowGuideModal(true)}
        className="fixed bottom-5 right-5 z-40 p-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-2xl shadow-amber-500/40 flex items-center space-x-2 transition-all hover:scale-105 border border-amber-400/40"
        title="App Guidance & Tour"
      >
        <HelpCircle className="w-5 h-5 fill-black text-amber-400" />
        <span className="text-xs font-bold font-mono pr-1 hidden sm:inline">Guide</span>
      </button>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#07090e] px-4 py-6 text-center text-xs text-gray-500 font-mono space-y-1">
        <p>Ìrántí — Powered by Walrus Memory (MemWal) Mainnet & Sui Blockchain.</p>
        <p className="text-[10px] text-gray-600">Registered Account: {REGISTERED_MERCHANT_WALLET.substring(0, 16)}...{REGISTERED_MERCHANT_WALLET.substring(56)}</p>
      </footer>

    </div>
  );
}
