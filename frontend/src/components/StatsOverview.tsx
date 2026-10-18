import React from 'react';
import { Lock, FileCheck2, Cpu, Scale } from 'lucide-react';
import { ProtocolStats, PQCEscrowRecord } from '../config/genlayer';
import { formatGen } from '../utils/formatters';

interface StatsOverviewProps {
  stats: ProtocolStats | null;
  escrows: PQCEscrowRecord[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, escrows }) => {
  const totalLocked = stats?.total_migration_locked || "0";
  const totalEscrows = stats?.total_escrows || escrows.length;
  const totalSettled = stats?.total_audits_settled || 0;

  // Calculate average compliance score across audited escrows
  const auditedEscrows = escrows.filter(e => e.compliance_score > 0);
  const avgCompliance = auditedEscrows.length > 0
    ? Math.round(auditedEscrows.reduce((acc, curr) => acc + curr.compliance_score, 0) / auditedEscrows.length)
    : 95;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Metric 1 */}
      <div className="bg-obsidian-850/80 border border-obsidian-700/80 hover:border-quantum-violet/40 p-5 rounded-xl transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Escrow Locked</span>
          <div className="p-2 bg-quantum-violet/10 border border-quantum-violet/30 rounded-lg text-quantum-violet group-hover:scale-110 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-display text-white">{formatGen(totalLocked)}</span>
          <span className="text-xs font-mono text-quantum-violet font-semibold">GEN</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono">
          NIST Migration Capital Collateral
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-quantum-violet/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* Metric 2 */}
      <div className="bg-obsidian-850/80 border border-obsidian-700/80 hover:border-quantum-cyan/40 p-5 rounded-xl transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Active PQC Contracts</span>
          <div className="p-2 bg-quantum-cyan/10 border border-quantum-cyan/30 rounded-lg text-quantum-cyan group-hover:scale-110 transition-transform">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-display text-white">{totalEscrows}</span>
          <span className="text-xs font-mono text-slate-400">Escrows</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono">
          ML-KEM / ML-DSA / SLH-DSA
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-quantum-cyan/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* Metric 3 */}
      <div className="bg-obsidian-850/80 border border-obsidian-700/80 hover:border-quantum-emerald/40 p-5 rounded-xl transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Tribunal Audits Settled</span>
          <div className="p-2 bg-quantum-emerald/10 border border-quantum-emerald/30 rounded-lg text-quantum-emerald group-hover:scale-110 transition-transform">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-display text-white">{totalSettled}</span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">Completed</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono">
          NIST FIPS 203/204 Standards Checked
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-quantum-emerald/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* Metric 4 */}
      <div className="bg-obsidian-850/80 border border-obsidian-700/80 hover:border-purple-400/40 p-5 rounded-xl transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">NIST Compliance Index</span>
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-display text-white">{avgCompliance}%</span>
          <span className="text-xs font-mono text-quantum-cyan font-semibold">Mean Score</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono">
          Consensus Semantic Agreement
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

    </div>
  );
};
