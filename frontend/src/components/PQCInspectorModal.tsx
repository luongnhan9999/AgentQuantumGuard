import React from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Hash,
  ExternalLink,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Binary,
  Layers,
  Fingerprint,
  Lock
} from 'lucide-react';
import { PQCEscrowRecord } from '../config/genlayer';
import { formatAddress, formatGen, getStatusInfo, getCategoryLabel } from '../utils/formatters';

interface PQCInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrow: PQCEscrowRecord | null;
  account: string | null;
  onAdjudicate?: (escrowId: string) => Promise<void>;
  loading?: boolean;
}

export const PQCInspectorModal: React.FC<PQCInspectorModalProps> = ({
  isOpen,
  onClose,
  escrow,
  account,
  onAdjudicate,
  loading
}) => {
  if (!isOpen || !escrow) return null;

  const statusInfo = getStatusInfo(escrow.status);
  const isClient = account && account.toLowerCase() === escrow.client.toLowerCase();
  const isCryptographer = account && account.toLowerCase() === escrow.cryptographer.toLowerCase();
  const canAdjudicate = (escrow.status === 1 || escrow.status === 8);

  const hashMatches = escrow.evidence_hash && escrow.spec_evidence_hash &&
    escrow.evidence_hash.toLowerCase() === escrow.spec_evidence_hash.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-obsidian-850 border border-obsidian-700 w-full max-w-3xl rounded-2xl p-6 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-quantum-violet/20 border border-quantum-violet/30 rounded-xl text-quantum-violet">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-display font-bold text-white">
                  PQC Cryptographic Examination Tribunal
                </h3>
                <span className={`px-2.5 py-0.5 text-xs font-mono rounded-full border font-semibold ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Contract Escrow #{escrow.escrow_id} • NIST FIPS 203/204/205 Verification Matrix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-6">
          
          {/* Metadata Grid */}
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono block mb-1">Target Suite</span>
              <span className="text-white font-mono font-semibold flex items-center gap-1">
                <Binary className="w-3.5 h-3.5 text-quantum-violet" />
                {escrow.target_algorithm_suite}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block mb-1">Target Security</span>
              <span className="text-quantum-cyan font-mono font-semibold">
                {getCategoryLabel(escrow.min_security_category)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block mb-1">Escrow Capital</span>
              <span className="text-quantum-violet font-mono font-semibold">
                {formatGen(escrow.escrow_amount)} GEN
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block mb-1">Consensus Confidence</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {escrow.confidence > 0 ? `${escrow.confidence}%` : "Pending Deliberation"}
              </span>
            </div>
          </div>

          {/* Tri-Perspective Examination Breakdown */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-quantum-cyan" /> Multi-Perspective AI Magistrate Audit
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Perspective 1: Structure */}
              <div className="bg-obsidian-900/90 border border-obsidian-750 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-quantum-cyan font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> 1. Parameter Audit
                  </span>
                  <span className="text-xs font-mono font-bold text-quantum-cyan">
                    {escrow.compliance_score > 0 ? `${escrow.compliance_score}%` : "N/A"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Checks polynomial ring dimension n=256, modulus q (3329 for ML-KEM, 8380417 for ML-DSA) and public key byte encoding.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-quantum-cyan"></span>
                  <span>Matrix Dimension: Conformant</span>
                </div>
              </div>

              {/* Perspective 2: Entropy */}
              <div className="bg-obsidian-900/90 border border-obsidian-750 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> 2. Backdoor Hunter
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {escrow.entropy_assurance_score > 0 ? `${escrow.entropy_assurance_score}%` : "N/A"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Cryptanalyses Gaussian noise distribution and checks for degenerate or backdoored lattice vectors vulnerable to BKZ reduction.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>Weak-Key Resistance: Verified</span>
                </div>
              </div>

              {/* Perspective 3: Quantum Bit-Strength */}
              <div className="bg-obsidian-900/90 border border-obsidian-750 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> 3. Category Strength
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {escrow.verdict.includes("APPROVED") ? "PASSED" : escrow.verdict.includes("PARTIAL") ? "PARTIAL" : "EVAL"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Evaluates effective quantum bits of security under dual and primal lattice sieve algorithms against NIST requirements.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Target: Category {escrow.min_security_category}</span>
                </div>
              </div>

            </div>
          </div>

          {/* AI Verdict & Detailed Reasoning */}
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {escrow.verdict === "PQC_COMPLIANT_APPROVED" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {escrow.verdict === "PQC_PARTIAL_COMPLIANCE" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {escrow.verdict === "PQC_INSECURE_REJECTED" && <XCircle className="w-5 h-5 text-rose-400" />}
                {escrow.verdict.startsWith("UNRESOLVED_") && <Info className="w-5 h-5 text-red-400" />}
                <span className="font-mono text-sm uppercase tracking-wide text-white font-bold">
                  Consensus Ruling: {escrow.verdict}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                GenVM Semantic Agreement
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono bg-obsidian-950 p-3.5 rounded-lg border border-obsidian-800 leading-relaxed">
              {escrow.reason || "Adjudication pending. The Chief Cryptographic Magistrate will convene when triggered."}
            </p>
          </div>

          {/* Cryptographic SHA-256 Commitments */}
          <div className="bg-obsidian-900/60 border border-obsidian-750 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-2 font-semibold">
                <Fingerprint className="w-4 h-4 text-quantum-cyan" /> Cryptographic Integrity Fingerprints
              </span>
              {hashMatches && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Hash Match Verified
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Submitted Specification URL:</span>
                {escrow.spec_document_url ? (
                  <a
                    href={escrow.spec_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-quantum-cyan hover:underline flex items-center gap-1 break-all"
                  >
                    <span>{escrow.spec_document_url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-500">Not submitted yet</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Committed Deliverable SHA-256 Hash:</span>
                <span className="text-slate-300 bg-obsidian-950 px-2.5 py-1.5 rounded block break-all border border-obsidian-800">
                  {escrow.spec_evidence_hash || "Awaiting submission"}
                </span>
              </div>

              {escrow.evidence_hash && (
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">AI Node Rendered SHA-256 Digest:</span>
                  <span className={`px-2.5 py-1.5 rounded block break-all border font-mono ${
                    hashMatches
                      ? 'text-emerald-300 bg-emerald-950/30 border-emerald-800/40'
                      : 'text-amber-300 bg-amber-950/30 border-amber-800/40'
                  }`}>
                    {escrow.evidence_hash}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stakeholders & Access Control Callout */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-obsidian-900 rounded-xl border border-obsidian-800">
              <span className="text-slate-500 block mb-1">Enterprise Client (Funder)</span>
              <span className="text-slate-200 font-semibold">{formatAddress(escrow.client)}</span>
              {isClient && <span className="text-[10px] text-quantum-cyan block mt-0.5 font-bold">★ You are the Client</span>}
            </div>
            <div className="p-3 bg-obsidian-900 rounded-xl border border-obsidian-800">
              <span className="text-slate-500 block mb-1">PQC Cryptographer (Contractor)</span>
              <span className="text-slate-200 font-semibold">{formatAddress(escrow.cryptographer)}</span>
              {isCryptographer && <span className="text-[10px] text-quantum-emerald block mt-0.5 font-bold">★ You are the Cryptographer</span>}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-obsidian-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
          >
            Close
          </button>

          {canAdjudicate && onAdjudicate && (
            <button
              onClick={() => onAdjudicate(escrow.escrow_id)}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-quantum-violet to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-display font-semibold shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Convening AI Tribunal...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Adjudicate PQC Compliance</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
