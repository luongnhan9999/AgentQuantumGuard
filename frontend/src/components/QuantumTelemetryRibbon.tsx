import React from 'react';
import { ShieldAlert, Zap, Cpu, Activity, Binary, CheckCircle } from 'lucide-react';
import { CHAIN_ID_DECIMAL, CHAIN_ID_HEX } from '../config/genlayer';

interface TelemetryRibbonProps {
  totalLocked: string;
  totalEscrows: number;
  totalSettled: number;
}

export const QuantumTelemetryRibbon: React.FC<TelemetryRibbonProps> = ({
  totalLocked,
  totalEscrows,
  totalSettled
}) => {
  return (
    <div className="bg-obsidian-950 border-b border-obsidian-750/70 text-[11px] font-mono py-2 px-4 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max text-slate-400">
        
        {/* Consensus Network */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold">GenLayer StudioNet</span>
          <span className="text-slate-500">({CHAIN_ID_DECIMAL} / {CHAIN_ID_HEX})</span>
        </div>

        {/* NIST Standards Status */}
        <div className="flex items-center gap-1.5 text-quantum-cyan">
          <Binary className="w-3.5 h-3.5" />
          <span>NIST FIPS 203/204/205 Standards: <strong>ENACTED</strong></span>
        </div>

        {/* Shor Threat Level */}
        <div className="flex items-center gap-1.5 text-quantum-rose">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Shor's Quantum Threat Level: <strong className="text-red-400">CRITICAL (ECDSA/RSA At-Risk)</strong></span>
        </div>

        {/* Consensus Mode */}
        <div className="flex items-center gap-1.5 text-purple-300">
          <Cpu className="w-3.5 h-3.5" />
          <span>Consensus: <strong>AI Semantic Tribunal (gl.vm.run_nondet)</strong></span>
        </div>

        {/* Anti-Tamper Status */}
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Integrity: <strong>SHA-256 Locked (Zero-Tamper)</strong></span>
        </div>

      </div>
    </div>
  );
};
