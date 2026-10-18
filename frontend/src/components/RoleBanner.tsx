import React from 'react';
import { UserCheck, Shield, KeyRound, Gavel, Globe, CheckCircle2 } from 'lucide-react';
import { formatAddress } from '../utils/formatters';

export type UserRole = 'all' | 'client' | 'cryptographer' | 'magistrate';

interface RoleBannerProps {
  account: string | null;
  ownerAddress: string;
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  myEscrowCount: number;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  account,
  ownerAddress,
  selectedRole,
  onSelectRole,
  myEscrowCount
}) => {
  const isOwner = account && ownerAddress && account.toLowerCase() === ownerAddress.toLowerCase();

  return (
    <div className="bg-obsidian-850 border border-obsidian-750 rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Connected Identity & Inferred Role */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-quantum-violet/20 border border-quantum-violet/30 rounded-xl text-quantum-violet shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Connected Identity:</span>
              <span className="text-xs font-mono font-bold text-white">
                {account ? formatAddress(account) : "No Wallet Connected (Observer Mode)"}
              </span>
              {isOwner && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-full font-semibold">
                  Protocol Owner
                </span>
              )}
              {myEscrowCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-quantum-cyan/20 text-cyan-300 border border-cyan-500/40 rounded-full font-semibold">
                  {myEscrowCount} Associated Escrows
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Role-Based Access Control (RBAC) strictly enforced on-chain. Actions are authenticated via sender address.
            </p>
          </div>
        </div>

        {/* Right: Role Perspective Switcher */}
        <div className="flex items-center gap-1.5 bg-obsidian-900/90 p-1.5 rounded-xl border border-obsidian-700/80 w-full lg:w-auto overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-mono text-slate-500 px-2 hidden sm:inline">Role Filter:</span>
          
          <button
            onClick={() => onSelectRole('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedRole === 'all'
                ? 'bg-quantum-violet text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Roles</span>
          </button>

          <button
            onClick={() => onSelectRole('client')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedRole === 'client'
                ? 'bg-quantum-cyan text-obsidian-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Enterprise Client</span>
          </button>

          <button
            onClick={() => onSelectRole('cryptographer')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedRole === 'cryptographer'
                ? 'bg-quantum-emerald text-obsidian-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PQC Cryptographer</span>
          </button>

          <button
            onClick={() => onSelectRole('magistrate')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedRole === 'magistrate'
                ? 'bg-purple-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Tribunal Magistrate</span>
          </button>
        </div>

      </div>

      {/* Permissions Breakdown Callout */}
      <div className="mt-3 pt-3 border-t border-obsidian-750/70 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        <div className="p-2 bg-obsidian-900/60 rounded-lg border border-obsidian-800">
          <strong className="text-quantum-cyan block mb-0.5">Enterprise Client Privileges:</strong>
          <span className="text-slate-400">Lock GEN Escrow • Request Adjudication • File Appeal (10% Bond) • Reclaim Stalled</span>
        </div>
        <div className="p-2 bg-obsidian-900/60 rounded-lg border border-obsidian-800">
          <strong className="text-quantum-emerald block mb-0.5">PQC Cryptographer Privileges:</strong>
          <span className="text-slate-400">Accept Escrow • Submit PQC Keys/CSR • SHA-256 Commitment • Finalize Payout</span>
        </div>
        <div className="p-2 bg-obsidian-900/60 rounded-lg border border-obsidian-800">
          <strong className="text-purple-300 block mb-0.5">AI Tribunal / Magistrate:</strong>
          <span className="text-slate-400">NIST Parameter Consensus • Adjudicate Appeals • Pull-Payment Safety Buffer</span>
        </div>
      </div>

    </div>
  );
};
