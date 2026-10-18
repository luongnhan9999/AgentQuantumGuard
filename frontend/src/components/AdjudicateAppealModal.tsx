import React from 'react';
import { X, Gavel, Scale, ExternalLink, ShieldAlert, Cpu, AlertCircle } from 'lucide-react';
import { PQCEscrowRecord } from '../config/genlayer';
import { formatAddress, formatGen } from '../utils/formatters';

interface AdjudicateAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrow: PQCEscrowRecord | null;
  onAdjudicateAppeal: (escrowId: string) => Promise<void>;
  loading: boolean;
}

export const AdjudicateAppealModal: React.FC<AdjudicateAppealModalProps> = ({
  isOpen,
  onClose,
  escrow,
  onAdjudicateAppeal,
  loading
}) => {
  if (!isOpen || !escrow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-obsidian-850 border border-obsidian-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">Supreme Appellate Adjudication</h3>
              <p className="text-xs text-slate-400 font-mono">Escrow #{escrow.escrow_id} • On-Chain Judicial Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          
          {/* Dispute Context */}
          <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Appellant Address:</span>
              <span className="text-white font-semibold">{formatAddress(escrow.dispute_initiator)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Staked Dispute Bond:</span>
              <span className="text-purple-300 font-bold">{formatGen(escrow.dispute_bond)} GEN</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Challenged Prior Verdict:</span>
              <span className="text-quantum-amber font-semibold">{escrow.appeal_prior_verdict || escrow.verdict}</span>
            </div>
          </div>

          {/* Bound Evidence Telemetry */}
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-xl p-3.5 text-xs font-mono">
            <span className="text-slate-400 block mb-1">Bound Supplemental Cryptanalysis Audit:</span>
            {escrow.supplemental_evidence_url ? (
              <a
                href={escrow.supplemental_evidence_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-quantum-cyan hover:underline flex items-center gap-1.5 break-all"
              >
                <span>{escrow.supplemental_evidence_url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            ) : (
              <span className="text-slate-500">None registered</span>
            )}
            <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
              Consensus validators will execute gl.nondet.web.render against this accredited endpoint and perform comparative cross-examination under gl.vm.run_nondet.
            </p>
          </div>

          {/* Appellate Decision Outcomes */}
          <div className="bg-obsidian-900/60 border border-obsidian-800 rounded-xl p-3 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 mb-1">Binding Economic Distribution:</div>
            <div>• <strong className="text-emerald-400">APPEAL_UPHELD_APPROVED</strong>: 100% Payout to Cryptographer + 100% Bond Refund.</div>
            <div>• <strong className="text-amber-400">APPEAL_UPHELD_PARTIAL</strong>: 40% Payout, 60% Refund + 100% Bond Refund.</div>
            <div>• <strong className="text-rose-400">APPEAL_UPHELD_REJECTED</strong>: 100% Refund to Client + 100% Bond Refund.</div>
            <div>• <strong className="text-purple-400">APPEAL_DISMISSED</strong>: Prior verdict upheld; 10% bond forfeited to counterparty.</div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-obsidian-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
          >
            Cancel
          </button>

          <button
            onClick={() => onAdjudicateAppeal(escrow.escrow_id)}
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-display font-semibold shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Convening Supreme Court...</span>
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4" />
                <span>Execute Appellate Consensus</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
