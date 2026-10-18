import React, { useState, useEffect } from 'react';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { EscrowCard } from './components/EscrowCard';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { SubmitDeliverableModal } from './components/SubmitDeliverableModal';
import { PQCInspectorModal } from './components/PQCInspectorModal';
import { AppealModal } from './components/AppealModal';
import { PullPayoutButton } from './components/PullPayoutButton';
import {
  DEFAULT_CONTRACT_ADDRESS,
  CHAIN_ID_HEX,
  CHAIN_ID_DECIMAL,
  PQCEscrowRecord,
  ProtocolStats,
  RPC_URL,
  EXPLORER_URL
} from './config/genlayer';
import { formatGen } from './utils/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Cpu,
  Layers,
  Lock,
  Binary,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Contract Data
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [escrows, setEscrows] = useState<PQCEscrowRecord[]>([]);
  const [claimableBalance, setClaimableBalance] = useState<string>("0");

  // Filtering & Search
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'awaiting' | 'settled' | 'disputed' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitEscrow, setSubmitEscrow] = useState<PQCEscrowRecord | null>(null);
  const [inspectEscrow, setInspectEscrow] = useState<PQCEscrowRecord | null>(null);
  const [appealEscrow, setAppealEscrow] = useState<PQCEscrowRecord | null>(null);

  // Status & Transaction Loading
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [txNotice, setTxNotice] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Initialize and check MetaMask
  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            fetchBalance(accounts[0]);
          }
        })
        .catch(console.error);

      (window as any).ethereum
        .request({ method: 'eth_chainId' })
        .then((id: string) => setChainId(id))
        .catch(console.error);

      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          setAccount(null);
          setBalance("0");
        }
      });

      (window as any).ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId);
      });
    }

    fetchContractState();
  }, []);

  // Update claimable balance whenever account or escrows update
  useEffect(() => {
    if (account) {
      fetchClaimableBalance(account);
    }
  }, [account, escrows]);

  const fetchBalance = async (addr: string) => {
    try {
      if ((window as any).ethereum) {
        const balHex = await (window as any).ethereum.request({
          method: 'eth_getBalance',
          params: [addr, 'latest'],
        });
        const wei = BigInt(balHex);
        const genNum = Number(wei) / 1e18;
        setBalance(genNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
      }
    } catch (e) {
      console.error("Balance fetch error:", e);
    }
  };

  const handleSwitchNetwork = async () => {
    if (!(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_ID_HEX,
                chainName: 'GenLayer Studio Network',
                nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: [EXPLORER_URL],
              },
            ],
          });
        } catch (addError) {
          console.error("Add chain error:", addError);
        }
      }
    }
  };

  const handleConnect = async () => {
    if (!(window as any).ethereum) {
      alert("MetaMask extension not found. Please install MetaMask to interact with GenLayer StudioNet.");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        fetchBalance(accounts[0]);
      }
    } catch (err: any) {
      console.error("Connect error:", err);
    } finally {
      setConnecting(false);
    }
  };

  const getClient = () => {
    if (!account) {
      return createClient({ chain: studionet });
    }
    return createClient({ chain: studionet, account: account as `0x${string}` });
  };

  const fetchContractState = async () => {
    setRefreshing(true);
    try {
      const client = getClient();

      // Read Stats
      const rawStats = await (client as any).readContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'get_stats',
        args: [],
      });
      if (rawStats) {
        const parsed = typeof rawStats === 'string' ? JSON.parse(rawStats) : rawStats;
        setStats(parsed);
      }

      // Read All Escrows
      const rawEscrows = await (client as any).readContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'get_all_escrows',
        args: [],
      });
      if (rawEscrows) {
        const parsed = typeof rawEscrows === 'string' ? JSON.parse(rawEscrows) : rawEscrows;
        setEscrows(parsed.reverse());
      }
    } catch (err: any) {
      console.error("Error fetching on-chain state:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchClaimableBalance = async (userAddr: string) => {
    try {
      const client = getClient();
      const rawBal = await (client as any).readContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'get_claimable_balance',
        args: [userAddr],
      });
      if (rawBal !== undefined && rawBal !== null) {
        setClaimableBalance(String(rawBal));
      }
    } catch (e) {
      console.error("Error reading claimable balance:", e);
    }
  };

  // ── Write Transactions ─────────────────────────────────────────────

  const handleCreateEscrow = async (suite: string, category: number, blocks: number, depositGen: string) => {
    if (!account) {
      await handleConnect();
      return;
    }
    setTxNotice({ message: "Submitting PQC migration escrow deposit to StudioNet...", type: "info" });
    try {
      const client = getClient();
      const depositWei = BigInt(Math.floor(parseFloat(depositGen) * 1e18));

      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'create_pqc_escrow',
        args: [suite, category, blocks],
        value: depositWei,
      });

      setTxNotice({ message: "Escrow locked! Awaiting GenVM block finality...", type: "info" });
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "PQC Migration Escrow successfully created!", type: "success" });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Failed to create escrow", type: "error" });
      throw err;
    }
  };

  const handleSubmitDeliverable = async (escrowId: string, specUrl: string, specHash: string) => {
    if (!account) {
      await handleConnect();
      return;
    }
    setTxNotice({ message: `Registering PQC keys & spec commitment for Escrow #${escrowId}...`, type: "info" });
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'submit_pqc_deliverable',
        args: [escrowId, specUrl, specHash],
      });

      setTxNotice({ message: "Deliverable registered! Waiting for GenVM block inclusion...", type: "info" });
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "PQC Deliverable package committed on-chain!", type: "success" });
      await fetchContractState();
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Failed to submit deliverable", type: "error" });
      throw err;
    }
  };

  const handleAdjudicate = async (escrowId: string) => {
    if (!account) {
      await handleConnect();
      return;
    }
    setLoadingAction(`${escrowId}-adjudicate`);
    setTxNotice({ message: `Convening AI Cryptographic Tribunal for Escrow #${escrowId}...`, type: "info" });
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'adjudicate_pqc_compliance',
        args: [escrowId],
      });

      setTxNotice({ message: "AI Jury evaluating lattice parameters against NIST FIPS standards...", type: "info" });
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "Tribunal verdict rendered and recorded on GenLayer!", type: "success" });
      await fetchContractState();
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Adjudication failed", type: "error" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAppealVerdict = async (escrowId: string, reason: string, suppUrl: string, bondGen: string) => {
    if (!account) {
      await handleConnect();
      return;
    }
    setTxNotice({ message: `Filing appeal with 10% staked bond for Escrow #${escrowId}...`, type: "info" });
    try {
      const client = getClient();
      const bondWei = BigInt(Math.floor(parseFloat(bondGen) * 1e18));

      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'appeal_verdict',
        args: [escrowId, reason, suppUrl],
        value: bondWei,
      });

      setTxNotice({ message: "Appeal recorded! Escrow frozen into DISPUTED court status...", type: "info" });
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "Supreme Appellate Tribunal invoked with 10% staked bond!", type: "success" });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Appeal failed", type: "error" });
      throw err;
    }
  };

  const handleAdjudicateAppeal = async (escrowId: string) => {
    if (!account) {
      await handleConnect();
      return;
    }
    setLoadingAction(`${escrowId}-appeal`);
    setTxNotice({ message: `Supreme Court reviewing bound supplemental evidence for #${escrowId}...`, type: "info" });
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'adjudicate_appeal',
        args: [escrowId],
      });

      setTxNotice({ message: "Appellate jury cross-examining formal audit benchmarks...", type: "info" });
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "Appellate ruling finalized and capital distributed!", type: "success" });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Appellate adjudication failed", type: "error" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinalizeSettlement = async (escrowId: string) => {
    if (!account) {
      await handleConnect();
      return;
    }
    setLoadingAction(`${escrowId}-finalize`);
    setTxNotice({ message: `Executing uncontested settlement for Escrow #${escrowId}...`, type: "info" });
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'finalize_settlement',
        args: [escrowId],
      });

      setTxNotice({ message: "Disbursing migration capital on GenLayer consensus...", type: "info" });
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "Escrow settled and capital released!", type: "success" });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Finalize failed (cooling-off window may still be active)", type: "error" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReclaimEscrow = async (escrowId: string) => {
    if (!account) {
      await handleConnect();
      return;
    }
    setLoadingAction(`${escrowId}-reclaim`);
    setTxNotice({ message: `Reclaiming expired escrow funds for #${escrowId}...`, type: "info" });
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'cancel_or_reclaim',
        args: [escrowId],
      });

      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "Escrow reclaimed back to client account!", type: "success" });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Reclaim failed", type: "error" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClaimPayout = async () => {
    if (!account) {
      await handleConnect();
      return;
    }
    setLoadingAction("claim-pull");
    setTxNotice({ message: "Withdrawing buffered pull-payment balance...", type: "info" });
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'claim_payout',
        args: [],
      });

      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTxNotice({ message: "Withdrawn successfully to your wallet!", type: "success" });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      setTxNotice({ message: err?.message || "Claim payout failed", type: "error" });
    } finally {
      setLoadingAction(null);
    }
  };

  // Filtered List
  const filteredEscrows = escrows.filter((e) => {
    // Tab filter
    if (activeTab === 'open' && e.status !== 0) return false;
    if (activeTab === 'awaiting' && e.status !== 1 && e.status !== 2) return false;
    if (activeTab === 'settled' && e.status !== 3 && e.status !== 4 && e.status !== 5) return false;
    if (activeTab === 'disputed' && e.status !== 6 && e.status !== 8) return false;
    if (activeTab === 'mine') {
      if (!account) return false;
      const acc = account.toLowerCase();
      if (e.client.toLowerCase() !== acc && e.cryptographer.toLowerCase() !== acc) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = e.escrow_id.includes(q);
      const matchSuite = e.target_algorithm_suite.toLowerCase().includes(q);
      const matchClient = e.client.toLowerCase().includes(q);
      const matchCrypto = e.cryptographer.toLowerCase().includes(q);
      return matchId || matchSuite || matchClient || matchCrypto;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-900 text-slate-100">
      
      {/* Navbar */}
      <Navbar
        account={account}
        balance={balance}
        chainId={chainId}
        connecting={connecting}
        onConnect={handleConnect}
        onSwitchNetwork={handleSwitchNetwork}
        onRefresh={fetchContractState}
        refreshing={refreshing}
        contractAddress={DEFAULT_CONTRACT_ADDRESS}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Notification Toast */}
        {txNotice && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-xs font-mono animate-fadeIn ${
            txNotice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : txNotice.type === 'error'
              ? 'bg-red-950/60 border-red-500/50 text-red-300'
              : 'bg-purple-950/60 border-purple-500/50 text-purple-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {txNotice.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {txNotice.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
              {txNotice.type === 'info' && <Info className="w-4 h-4 text-purple-400 shrink-0" />}
              <span>{txNotice.message}</span>
            </div>
            <button
              onClick={() => setTxNotice(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pull Payment Claim Available Bar */}
        <PullPayoutButton
          claimableBalance={claimableBalance}
          onClaim={handleClaimPayout}
          loading={loadingAction === "claim-pull"}
        />

        {/* Hero Section */}
        <div className="relative mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-obsidian-850 via-obsidian-850 to-purple-950/40 border border-obsidian-750 overflow-hidden shadow-2xl">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quantum-violet/10 border border-quantum-violet/30 text-quantum-violet text-xs font-mono font-semibold mb-3">
              <Binary className="w-3.5 h-3.5" />
              <span>NIST Post-Quantum Cryptography Migration Escrow</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Autonomous Key Verification & PQC Migration Tribunal
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Guarding Web3 and financial infrastructure against quantum attacks (Shor's Algorithm).
              GenLayer AI Consensus autonomously verifies public key matrices, polynomial parameters, and CSRs against 
              <strong className="text-quantum-cyan"> NIST FIPS 203 (ML-KEM)</strong>, <strong className="text-quantum-emerald">FIPS 204 (ML-DSA)</strong>, and <strong className="text-purple-300">FIPS 205 (SLH-DSA)</strong> before disbursing locked GEN capital.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-quantum-violet to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-display font-semibold shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Initiate PQC Migration Escrow</span>
              </button>

              <button
                onClick={fetchContractState}
                disabled={refreshing}
                className="px-4 py-2.5 bg-obsidian-800 hover:bg-obsidian-750 border border-obsidian-700 text-slate-300 hover:text-white rounded-xl text-sm font-mono transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-quantum-cyan' : ''}`} />
                <span>Sync StudioNet</span>
              </button>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-quantum-violet/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-quantum-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} escrows={escrows} />

        {/* Standards Information Ribbon */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-obsidian-850/60 border border-obsidian-750 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-quantum-cyan/10 border border-quantum-cyan/30 rounded-lg text-quantum-cyan shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-white">NIST FIPS 203: ML-KEM</div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Module-Lattice Key Encapsulation (Kyber). Verifies polynomial ring dimension n=256 and prime modulus q=3329.
              </p>
            </div>
          </div>

          <div className="bg-obsidian-850/60 border border-obsidian-750 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-quantum-emerald/10 border border-quantum-emerald/30 rounded-lg text-quantum-emerald shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-white">NIST FIPS 204: ML-DSA</div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Module-Lattice Digital Signatures (Dilithium). Validates matrix dimensions and modulus q=8380417.
              </p>
            </div>
          </div>

          <div className="bg-obsidian-850/60 border border-obsidian-750 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-white">NIST FIPS 205: SLH-DSA</div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Stateless Hash-based Signatures (SPHINCS+). High-assurance fail-safe resistant even if lattice assumptions fail.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Escrows' },
              { id: 'open', label: 'Open' },
              { id: 'awaiting', label: 'Under Review' },
              { id: 'settled', label: 'Settled' },
              { id: 'disputed', label: 'Disputed' },
              { id: 'mine', label: 'My Contracts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-quantum-violet text-white font-semibold shadow-md shadow-purple-950'
                    : 'bg-obsidian-850 text-slate-400 hover:text-slate-200 border border-obsidian-750'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by suite, ID, or address..."
              className="w-full bg-obsidian-850 border border-obsidian-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-quantum-violet"
            />
          </div>

        </div>

        {/* Escrows Grid */}
        {filteredEscrows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEscrows.map((escrow) => (
              <EscrowCard
                key={escrow.escrow_id}
                escrow={escrow}
                account={account}
                onOpenSubmitModal={setSubmitEscrow}
                onOpenInspectModal={setInspectEscrow}
                onOpenAppealModal={setAppealEscrow}
                onAdjudicate={handleAdjudicate}
                onAdjudicateAppeal={handleAdjudicateAppeal}
                onFinalize={handleFinalizeSettlement}
                onReclaim={handleReclaimEscrow}
                loadingAction={loadingAction}
              />
            ))}
          </div>
        ) : (
          <div className="bg-obsidian-850/40 border border-obsidian-750 rounded-2xl p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="font-display font-semibold text-lg text-slate-300">No PQC Escrows Found</h4>
            <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No escrows matching "${searchQuery}". Try a different search term.`
                : "No post-quantum migration escrows in this view. Click 'Initiate PQC Migration Escrow' to open a new contract."}
            </p>
            <div className="mt-5">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-quantum-violet/20 hover:bg-quantum-violet/30 border border-quantum-violet/40 text-purple-300 rounded-lg text-xs font-mono transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Escrow Deposit</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-obsidian-800 bg-obsidian-950 py-6 mt-16 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AgentQuantumGuard</span>
            <span>• GenLayer StudioNet (Chain ID: {CHAIN_ID_DECIMAL} / Hex: {CHAIN_ID_HEX})</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href={`${EXPLORER_URL}/address/${DEFAULT_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-quantum-violet transition-colors"
            >
              Contract: {DEFAULT_CONTRACT_ADDRESS.slice(0, 8)}...
            </a>
            <a
              href="https://csrc.nist.gov/projects/post-quantum-cryptography"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-quantum-cyan transition-colors"
            >
              NIST PQC Standards
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateEscrowModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateEscrow}
        loading={isCreateOpen && loadingAction === "create"}
      />

      <SubmitDeliverableModal
        isOpen={!!submitEscrow}
        onClose={() => setSubmitEscrow(null)}
        escrowId={submitEscrow?.escrow_id || ""}
        targetSuite={submitEscrow?.target_algorithm_suite || ""}
        onSubmit={handleSubmitDeliverable}
        loading={!!submitEscrow && loadingAction === "submit"}
      />

      <PQCInspectorModal
        isOpen={!!inspectEscrow}
        onClose={() => setInspectEscrow(null)}
        escrow={inspectEscrow}
        onAdjudicate={handleAdjudicate}
        loading={!!(inspectEscrow && loadingAction === `${inspectEscrow.escrow_id}-adjudicate`)}
      />

      <AppealModal
        isOpen={!!appealEscrow}
        onClose={() => setAppealEscrow(null)}
        escrow={appealEscrow}
        onSubmit={handleAppealVerdict}
        loading={!!(appealEscrow && loadingAction === `${appealEscrow.escrow_id}-appeal`)}
      />

    </div>
  );
}
