import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Send,
  Scale,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Binary,
  Layers,
  Cpu,
  Clock,
  Eye,
  KeyRound,
  Fingerprint,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { PQCEscrowRecord } from '../config/genlayer';
import { formatAddress, formatGen, formatTimestamp, getStatusInfo, getCategoryLabel } from '../utils/formatters';

interface QuantumCommandCockpitProps {
  escrows: PQCEscrowRecord[];
  selectedEscrow: PQCEscrowRecord | null;
  onSelectEscrow: (escrow: PQCEscrowRecord) => void;
  account: string | null;
  onOpenSubmitModal: (escrow: PQCEscrowRecord) => void;
  onOpenInspectModal: (escrow: PQCEscrowRecord) => void;
  onOpenAppealModal: (escrow: PQCEscrowRecord) => void;
  onOpenAdjudicateAppealModal: (escrow: PQCEscrowRecord) => void;
  onAdjudicate: (escrowId: string) => Promise<void>;
  onFinalize: (escrowId: string) => Promise<void>;
  onReclaim: (escrowId: string) => Promise<void>;
  loadingAction: string | null;
}

export const QuantumCommandCockpit: React.FC<QuantumCommandCockpitProps> = ({
  escrows,
  selectedEscrow,
  onSelectEscrow,
  account,
  onOpenSubmitModal,
  onOpenInspectModal,
  onOpenAppealModal,
  onOpenAdjudicateAppealModal,
  onAdjudicate,
  onFinalize,
  onReclaim,
  loadingAction,
}) => {
  const e = selectedEscrow || (escrows.length > 0 ? escrows[0] : null);

  const isClient = account && e && account.toLowerCase() === e.client.toLowerCase();
  const isCryptographer = account && e && account.toLowerCase() === e.cryptographer.toLowerCase();
  const isActionLoading = (actionName: string) => Boolean(e && loadingAction === `${e.escrow_id}-${actionName}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      
      {/* ── Left Column: Escrow Pipeline Queue (3 cols) ─────────── */}
      <div className="lg:col-span-4 bg-obsidian-850/90 border border-obsidian-750 rounded-2xl p-4 flex flex-col shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-obsidian-750">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-quantum-violet" />
            <h3 className="font-display font-bold text-white text-sm">Escrow Migration Queue</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-quantum-violet/20 text-purple-300 border border-purple-500/30">
            {escrows.length} Total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[640px] pr-1">
          {escrows.length > 0 ? (
            escrows.map((item) => {
              const itemStatus = getStatusInfo(item.status);
              const isSelected = e && e.escrow_id === item.escrow_id;

              return (
                <div
                  key={item.escrow_id}
                  onClick={() => onSelectEscrow(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs font-mono relative overflow-hidden ${
                    isSelected
                      ? 'bg-quantum-violet/15 border-quantum-violet shadow-lg shadow-purple-950/40'
                      : 'bg-obsidian-900/70 border-obsidian-750 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white font-display text-sm">#{item.escrow_id}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full border font-semibold ${itemStatus.bg} ${itemStatus.color} ${itemStatus.border}`}>
                      {itemStatus.label.split(" ")[0]}
                    </span>
                  </div>

                  <div className="text-slate-300 font-semibold truncate mb-1">
                    {item.target_algorithm_suite}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-quantum-violet font-semibold">{formatGen(item.escrow_amount)} GEN</span>
                    <span>{getCategoryLabel(item.min_security_category).split(" ")[0]} {getCategoryLabel(item.min_security_category).split(" ")[1]}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-quantum-violet"></div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No escrows available on StudioNet.
            </div>
          )}
        </div>
      </div>

      {/* ── Center Column: Tactical Quantum Inspection Console (5 cols) ── */}
      <div className="lg:col-span-5 bg-obsidian-850/90 border border-obsidian-750 rounded-2xl p-5 flex flex-col shadow-xl">
        {e ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-obsidian-750">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg text-white">Escrow #{e.escrow_id}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-obsidian-900 border border-obsidian-700 text-quantum-cyan">
                    {getCategoryLabel(e.min_security_category)}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{e.target_algorithm_suite}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">Collateral Locked</span>
                <span className="font-display font-bold text-lg text-quantum-violet">
                  {formatGen(e.escrow_amount)} GEN
                </span>
              </div>
            </div>

            {/* Lattice Parameter Visualizer Matrix */}
            <div className="mt-4 p-4 bg-obsidian-900 border border-obsidian-750 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Binary className="w-3.5 h-3.5 text-quantum-cyan" /> Lattice Polynomial Vector Space
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                  {e.status >= 2 ? "Audited by AI Consensus" : "Pre-Adjudication"}
                </span>
              </div>

              {/* Matrix Badges */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span className="text-slate-500 text-[10px] block">Degree (n)</span>
                  <span className="text-white font-bold">256</span>
                </div>
                <div className="p-2 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span className="text-slate-500 text-[10px] block">Modulus (q)</span>
                  <span className="text-quantum-cyan font-bold">
                    {e.target_algorithm_suite.includes("DSA") ? "8380417" : "3329"}
                  </span>
                </div>
                <div className="p-2 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span className="text-slate-500 text-[10px] block">Matrix (k)</span>
                  <span className="text-purple-300 font-bold">
                    {e.min_security_category === 1 ? "2x2" : e.min_security_category === 3 ? "3x3" : "4x4"}
                  </span>
                </div>
                <div className="p-2 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span className="text-slate-500 text-[10px] block">Security</span>
                  <span className="text-emerald-400 font-bold">
                    Cat {e.min_security_category}
                  </span>
                </div>
              </div>

              {/* Progress Gauges */}
              {e.compliance_score > 0 && (
                <div className="space-y-2 pt-2 border-t border-obsidian-800">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">NIST Parameter Conformity:</span>
                      <span className="text-emerald-400 font-bold">{e.compliance_score}%</span>
                    </div>
                    <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden border border-obsidian-800">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${e.compliance_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">Entropy & Backdoor Resistance:</span>
                      <span className="text-purple-400 font-bold">{e.entropy_assurance_score}%</span>
                    </div>
                    <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden border border-obsidian-800">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: `${e.entropy_assurance_score}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Verdict Reasoning */}
            <div className="mt-4 p-3.5 bg-obsidian-900 border border-obsidian-750 rounded-xl text-xs font-mono">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Tribunal Verdict:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusInfo(e.status).color}`}>
                  {e.verdict}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed bg-obsidian-950 p-2.5 rounded border border-obsidian-800">
                {e.reason}
              </p>
            </div>

            {/* Stakeholders & Timestamps */}
            <div className="mt-4 pt-3 border-t border-obsidian-750 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block">Enterprise Client</span>
                <span className="text-slate-300 font-semibold">{formatAddress(e.client)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">PQC Cryptographer</span>
                <span className="text-slate-300 font-semibold">{formatAddress(e.cryptographer)}</span>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="mt-5 pt-3 border-t border-obsidian-750 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => onOpenInspectModal(e)}
                className="px-3 py-1.5 bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-quantum-cyan" />
                <span>Deep Rubric</span>
              </button>

              <div className="flex items-center gap-2">
                {e.status === 0 && (
                  <button
                    onClick={() => onOpenSubmitModal(e)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-quantum-cyan to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-cyan-950 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Deliverable</span>
                  </button>
                )}

                {(e.status === 1 || e.status === 8) && (
                  <button
                    onClick={() => onAdjudicate(e.escrow_id)}
                    disabled={isActionLoading('adjudicate')}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-quantum-violet to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-purple-950 transition-all flex items-center gap-1.5"
                  >
                    {isActionLoading('adjudicate') ? (
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Scale className="w-3.5 h-3.5" />
                    )}
                    <span>{e.status === 8 ? "Retry Adjudication" : "Adjudicate Compliance"}</span>
                  </button>
                )}

                {e.status === 2 && (
                  <>
                    <button
                      onClick={() => onOpenAppealModal(e)}
                      className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-mono transition-all flex items-center gap-1"
                    >
                      <Gavel className="w-3.5 h-3.5 text-purple-400" />
                      <span>Appeal (10% Bond)</span>
                    </button>

                    <button
                      onClick={() => onFinalize(e.escrow_id)}
                      disabled={isActionLoading('finalize')}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-quantum-emerald to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-emerald-950 transition-all flex items-center gap-1.5"
                    >
                      {isActionLoading('finalize') ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Finalize Settlement</span>
                    </button>
                  </>
                )}

                {e.status === 6 && (
                  <button
                    onClick={() => onOpenAdjudicateAppealModal(e)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-purple-950 transition-all flex items-center gap-1.5"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Adjudicate Appeal</span>
                  </button>
                )}

                {(e.status === 0 || e.status === 8) && isClient && (
                  <button
                    onClick={() => onReclaim(e.escrow_id)}
                    disabled={isActionLoading('reclaim')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
                  >
                    Reclaim
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs">
            <Shield className="w-12 h-12 text-slate-700 mb-2" />
            <span>Select an escrow from the queue to inspect tactical lattice parameters.</span>
          </div>
        )}
      </div>

      {/* ── Right Column: NIST FIPS Threat Intel & Knowledge Graph (3 cols) ── */}
      <div className="lg:col-span-3 bg-obsidian-850/90 border border-obsidian-750 rounded-2xl p-4 flex flex-col shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-obsidian-750">
          <Cpu className="w-4 h-4 text-quantum-cyan" />
          <h3 className="font-display font-bold text-white text-sm">NIST Threat Intelligence</h3>
        </div>

        {/* Threat comparison box */}
        <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs font-mono space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-400 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" /> Classical EVM Vulnerable
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Shor's Algorithm breaks ECDSA (secp256k1) and RSA in polynomial time $O((\log N)^3)$. All un-migrated Ethereum smart contract keys face private key reconstruction.
          </p>
        </div>

        {/* NIST Standards Status Card */}
        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs font-mono space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> NIST FIPS Approved (Aug 2024)
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div>• <strong>FIPS 203</strong>: ML-KEM (Kyber)</div>
            <div>• <strong>FIPS 204</strong>: ML-DSA (Dilithium)</div>
            <div>• <strong>FIPS 205</strong>: SLH-DSA (SPHINCS+)</div>
          </div>
        </div>

        {/* Accredited Authorities Whitelist */}
        <div className="p-3 bg-obsidian-900 border border-obsidian-750 rounded-xl text-xs font-mono space-y-1">
          <span className="text-slate-400 block text-[11px] font-semibold mb-1">Accredited Telemetry Oracles:</span>
          <div className="text-[11px] text-quantum-cyan space-y-0.5">
            <div>• csrc.nist.gov</div>
            <div>• openquantumsafe.org</div>
            <div>• eprint.iacr.org</div>
            <div>• pq-crystals.org</div>
          </div>
        </div>

        {/* On-Chain Security Guarantees */}
        <div className="p-3 bg-obsidian-900 border border-obsidian-750 rounded-xl text-[11px] font-mono text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold mb-0.5">On-Chain Protocol Invariants:</div>
          <div>✓ Anti-Prompt-Injection Canary</div>
          <div>✓ Content SHA-256 Commitment</div>
          <div>✓ 24-Block Dispute Timelock</div>
          <div>✓ Pull-Payment Safe Withdrawal</div>
        </div>

      </div>

    </div>
  );
};
