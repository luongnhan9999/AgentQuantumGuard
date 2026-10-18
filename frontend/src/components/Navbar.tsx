import React from 'react';
import { ShieldCheck, Wallet, ExternalLink, Network, RefreshCw } from 'lucide-react';
import { DEFAULT_CONTRACT_ADDRESS, CHAIN_ID_HEX, CHAIN_ID_DECIMAL, EXPLORER_URL } from '../config/genlayer';
import { formatAddress } from '../utils/formatters';

interface NavbarProps {
  account: string | null;
  balance: string;
  chainId: string | null;
  connecting: boolean;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  contractAddress: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  balance,
  chainId,
  connecting,
  onConnect,
  onSwitchNetwork,
  onRefresh,
  refreshing,
  contractAddress
}) => {
  const isCorrectNetwork = chainId === CHAIN_ID_HEX || chainId === String(CHAIN_ID_DECIMAL);

  return (
    <header className="border-b border-obsidian-700/80 bg-obsidian-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img src="/logo.svg" alt="AgentQuantumGuard Logo" className="w-11 h-11" />
            <div className="absolute -inset-0.5 bg-quantum-violet rounded-full blur opacity-30 -z-10 animate-pulse-slow"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Agent<span className="text-quantum-violet">Quantum</span>Guard
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-quantum-violet/20 text-purple-300 border border-purple-500/30 rounded-full font-semibold">
                NIST FIPS 203/204/205
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Autonomous Post-Quantum Cryptography Migration Escrow & Key Verification Tribunal
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Refresh State */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 text-slate-400 hover:text-white bg-obsidian-800/80 hover:bg-obsidian-700/80 border border-obsidian-700 rounded-lg transition-all"
            title="Refresh on-chain state"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-quantum-cyan' : ''}`} />
          </button>

          {/* Network Switcher / Indicator */}
          {account && (
            <div>
              {isCorrectNetwork ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>StudioNet (61999)</span>
                </div>
              ) : (
                <button
                  onClick={onSwitchNetwork}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/50 rounded-lg text-amber-300 text-xs font-mono transition-all"
                >
                  <Network className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch to StudioNet</span>
                </button>
              )}
            </div>
          )}

          {/* Contract Explorer Link */}
          <a
            href={`${EXPLORER_URL}/address/${contractAddress || DEFAULT_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-obsidian-850 hover:bg-obsidian-700/80 border border-obsidian-700 rounded-lg text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="Inspect on GenLayer Studio Explorer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-quantum-cyan" />
            <span>Contract: {formatAddress(contractAddress || DEFAULT_CONTRACT_ADDRESS)}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Wallet Button */}
          {account ? (
            <div className="flex items-center gap-2 bg-obsidian-850 border border-obsidian-700 rounded-lg p-1.5 pl-3">
              <div className="text-right">
                <div className="text-xs font-mono font-medium text-slate-200">
                  {formatAddress(account)}
                </div>
                <div className="text-[11px] font-mono text-quantum-violet font-semibold">
                  {balance} GEN
                </div>
              </div>
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-quantum-violet to-quantum-cyan flex items-center justify-center text-white text-xs font-bold font-mono">
                {account.slice(2, 4).toUpperCase()}
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-quantum-violet to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-purple-900/30 transition-all font-display"
            >
              <Wallet className="w-4 h-4" />
              <span>{connecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
