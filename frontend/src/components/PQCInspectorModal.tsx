import React from 'react';
import { X, ShieldCheck, Cpu, Hash, ExternalLink, Scale, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { PQCEscrowRecord } from '../config/genlayer';
import { formatAddress, formatGen, getStatusInfo, getCategoryLabel } from '../utils/formatters';

interface PQCInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrow: PQCEscrowRecord | null;
  onAdjudicate?: (escrowId: string) => Promise<void>;
  loading?: boolean;
}

export const PQCInspectorModal: React.FC<PQCInspectorModalProps> = ({
  isOpen,
  onClose,
  escrow,
  onAdjudicate,
  loading
}) => {
  if (!isOpen || !escrow) return null;

  const statusInfo = getStatusInfo(escrow.status);
  const canAdjudicate = escrow.status === 1 || escrow.status === 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-obsidian-850 border border-obsidian-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-quantum-violet/20 border border-quantum-violet/30 rounded-xl text-quantum-violet">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-bold text-white">PQC Verification Tribunal</h3>
                <span className={`px-2.5 py-0.5 text-xs font-mono rounded-full border font-semibold ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Escrow Contract #{escrow.escrow_id} • NIST Standards Examination</p>
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
        <div className="mt-5 space-y-5">
          
          {/* Target Metadata Card */}
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono block mb-1">Target Suite</span>
              <span className="text-white font-mono font-semibold">{escrow.target_algorithm_suite}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block mb-1">Security Target</span>
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
              <span className="text-slate-400 font-mono block mb-1">Confidence</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {escrow.confidence > 0 ? `${escrow.confidence}%` : "Pending"}
              </span>
            </div>
          </div>

          {/* AI Score Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Compliance Score */}
            <div className="bg-obsidian-900/80 border border-obsidian-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-quantum-emerald" /> NIST FIPS Compliance
                </span>
                <span className="text-lg font-bold font-display text-quantum-emerald">
                  {escrow.compliance_score}%
                </span>
              </div>
              <div className="w-full bg-obsidian-950 h-2 rounded-full overflow-hidden border border-obsidian-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-quantum-cyan h-full rounded-full transition-all duration-500"
                  style={{ width: `${escrow.compliance_score}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Matrix dimension n=256, modulus q conformity
              </span>
            </div>

            {/* Entropy Score */}
            <div className="bg-obsidian-900/80 border border-obsidian-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-400" /> Entropy & Weak-Key Assurance
                </span>
                <span className="text-lg font-bold font-display text-purple-400">
                  {escrow.entropy_assurance_score}%
                </span>
              </div>
              <div className="w-full bg-obsidian-950 h-2 rounded-full overflow-hidden border border-obsidian-800">
                <div
                  className="bg-gradient-to-r from-purple-500 to-quantum-violet h-full rounded-full transition-all duration-500"
                  style={{ width: `${escrow.entropy_assurance_score}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Weak-lattice parameter & backdoor resistance
              </span>
            </div>

          </div>

          {/* AI Verdict Box */}
          <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {escrow.verdict === "PQC_COMPLIANT_APPROVED" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {escrow.verdict === "PQC_PARTIAL_COMPLIANCE" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {escrow.verdict === "PQC_INSECURE_REJECTED" && <XCircle className="w-4 h-4 text-rose-400" />}
              {escrow.verdict.startsWith("UNRESOLVED_") && <Info className="w-4 h-4 text-red-400" />}
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
                Consensus Verdict: {escrow.verdict}
              </span>
            </div>
            <p className="text-sm text-slate-300 font-mono bg-obsidian-950 p-3 rounded-lg border border-obsidian-800 leading-relaxed">
              {escrow.reason || "No adjudication performed yet."}
            </p>
          </div>

          {/* Cryptographic SHA-256 Commitments */}
          <div className="bg-obsidian-900/60 border border-obsidian-750 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
              <Hash className="w-4 h-4 text-quantum-cyan" /> Cryptographic Integrity Fingerprints
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Submitted Specification Document URL:</span>
                {escrow.spec_document_url ? (
                  <a
                    href={escrow.spec_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-quantum-cyan hover:underline flex items-center gap-1 break-all"
                  >
                    <span>{escrow.spec_document_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-500">Not submitted yet</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Expected Content SHA-256 Commitment:</span>
                <span className="text-slate-300 bg-obsidian-950 px-2 py-1 rounded block break-all border border-obsidian-800">
                  {escrow.spec_evidence_hash || "N/A"}
                </span>
              </div>

              {escrow.evidence_hash && (
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">AI Node Rendered SHA-256 Digest:</span>
                  <span className="text-emerald-300 bg-obsidian-950 px-2 py-1 rounded block break-all border border-emerald-900/30">
                    {escrow.evidence_hash}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stakeholders Info */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-obsidian-900 rounded-xl border border-obsidian-800">
              <span className="text-slate-500 block mb-1">Contracting Client</span>
              <span className="text-slate-300">{formatAddress(escrow.client)}</span>
            </div>
            <div className="p-3 bg-obsidian-900 rounded-xl border border-obsidian-800">
              <span className="text-slate-500 block mb-1">PQC Cryptographer</span>
              <span className="text-slate-300">{formatAddress(escrow.cryptographer)}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-obsidian-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 rounded-lg text-sm font-mono transition-all"
          >
            Close
          </button>

          {canAdjudicate && onAdjudicate && (
            <button
              onClick={() => onAdjudicate(escrow.escrow_id)}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-quantum-violet to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-display font-medium shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
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
