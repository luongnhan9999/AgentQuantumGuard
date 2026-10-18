import React from 'react';
import { Shield, Send, Scale, Gavel, CheckCircle2, AlertCircle, Eye, ArrowRight, Clock } from 'lucide-react';
import { PQCEscrowRecord } from '../config/genlayer';
import { formatAddress, formatGen, formatTimestamp, getStatusInfo, getCategoryLabel } from '../utils/formatters';

interface EscrowCardProps {
  escrow: PQCEscrowRecord;
  account: string | null;
  onOpenSubmitModal: (escrow: PQCEscrowRecord) => void;
  onOpenInspectModal: (escrow: PQCEscrowRecord) => void;
  onOpenAppealModal: (escrow: PQCEscrowRecord) => void;
  onAdjudicate: (escrowId: string) => Promise<void>;
  onAdjudicateAppeal: (escrowId: string) => Promise<void>;
  onFinalize: (escrowId: string) => Promise<void>;
  onReclaim: (escrowId: string) => Promise<void>;
  loadingAction: string | null;
}

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  account,
  onOpenSubmitModal,
  onOpenInspectModal,
  onOpenAppealModal,
  onAdjudicate,
  onAdjudicateAppeal,
  onFinalize,
  onReclaim,
  loadingAction,
}) => {
  const statusInfo = getStatusInfo(escrow.status);
  const isClient = account && account.toLowerCase() === escrow.client.toLowerCase();
  const isCryptographer = account && account.toLowerCase() === escrow.cryptographer.toLowerCase();

  const isActionLoading = (actionName: string) => loadingAction === `${escrow.escrow_id}-${actionName}`;

  return (
    <div className="bg-obsidian-850/90 border border-obsidian-700/80 hover:border-quantum-violet/40 rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden group">
      
      {/* Top Banner: ID & Status */}
      <div className="flex items-center justify-between pb-3.5 border-b border-obsidian-750 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-white text-base">
            Escrow #{escrow.escrow_id}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-obsidian-900 border border-obsidian-700 text-slate-300">
            {getCategoryLabel(escrow.min_security_category)}
          </span>
        </div>

        <span className={`px-2.5 py-0.5 text-[11px] font-mono rounded-full border font-semibold tracking-wide ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Target Suite & Amount */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-mono text-slate-400 mb-0.5">Algorithm Suite</div>
          <div className="font-mono text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-quantum-violet shrink-0" />
            <span>{escrow.target_algorithm_suite}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono text-slate-400 mb-0.5">Escrow Capital</div>
          <div className="font-display text-lg font-bold text-quantum-violet">
            {formatGen(escrow.escrow_amount)} <span className="text-xs font-mono">GEN</span>
          </div>
        </div>
      </div>

      {/* Progress & Scores Bar (If audited or in progress) */}
      {escrow.compliance_score > 0 ? (
        <div className="mt-4 p-3 bg-obsidian-900/80 border border-obsidian-750 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">NIST Compliance Score:</span>
            <span className="text-quantum-emerald font-semibold">{escrow.compliance_score}%</span>
          </div>
          <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden border border-obsidian-800">
            <div
              className="bg-quantum-emerald h-full rounded-full transition-all duration-300"
              style={{ width: `${escrow.compliance_score}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Entropy Assurance: {escrow.entropy_assurance_score}%</span>
            <span>Verdict: <strong className="text-slate-200">{escrow.verdict}</strong></span>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-obsidian-900/50 border border-obsidian-800 rounded-xl text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>AI Tribunal Verification:</span>
          <span className="text-quantum-cyan">
            {escrow.status === 0 ? "Awaiting PQC Spec Submission" : "Ready for Adjudication"}
          </span>
        </div>
      )}

      {/* Stakeholders & Timestamps */}
      <div className="mt-4 pt-3 border-t border-obsidian-750/80 grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Enterprise Client</span>
          <span className="text-slate-300">{formatAddress(escrow.client)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">PQC Cryptographer</span>
          <span className="text-slate-300">{formatAddress(escrow.cryptographer)}</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-5 pt-3 border-t border-obsidian-750 flex flex-wrap items-center justify-between gap-2">
        
        {/* Always visible: Inspect button */}
        <button
          onClick={() => onOpenInspectModal(escrow)}
          className="px-3 py-1.5 bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-all flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-quantum-cyan" />
          <span>Inspect Rubric</span>
        </button>

        {/* Dynamic Context Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Status 0: Submit Deliverable (Cryptographer) */}
          {escrow.status === 0 && (
            <button
              onClick={() => onOpenSubmitModal(escrow)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-quantum-cyan to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-cyan-950 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Deliverable</span>
            </button>
          )}

          {/* Status 1 or 8: Adjudicate Compliance */}
          {(escrow.status === 1 || escrow.status === 8) && (
            <button
              onClick={() => onAdjudicate(escrow.escrow_id)}
              disabled={isActionLoading('adjudicate')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-quantum-violet to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-purple-950 transition-all flex items-center gap-1.5"
            >
              {isActionLoading('adjudicate') ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Scale className="w-3.5 h-3.5" />
              )}
              <span>{escrow.status === 8 ? "Retry Adjudication" : "Adjudicate PQC"}</span>
            </button>
          )}

          {/* Status 2: Awaiting Payout (Cooling-off challenge window) */}
          {escrow.status === 2 && (
            <>
              <button
                onClick={() => onOpenAppealModal(escrow)}
                className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-mono transition-all flex items-center gap-1"
                title="Challenge verdict with 10% staked dispute bond"
              >
                <Gavel className="w-3.5 h-3.5 text-purple-400" />
                <span>Appeal (10% Bond)</span>
              </button>

              <button
                onClick={() => onFinalize(escrow.escrow_id)}
                disabled={isActionLoading('finalize')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-quantum-emerald to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-emerald-950 transition-all flex items-center gap-1.5"
              >
                {isActionLoading('finalize') ? (
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Finalize Payout</span>
              </button>
            </>
          )}

          {/* Status 6: Disputed (Appellate Court) */}
          {escrow.status === 6 && (
            <button
              onClick={() => onAdjudicateAppeal(escrow.escrow_id)}
              disabled={isActionLoading('appeal')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-medium shadow-md shadow-purple-950 transition-all flex items-center gap-1.5"
            >
              {isActionLoading('appeal') ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Gavel className="w-3.5 h-3.5" />
              )}
              <span>Adjudicate Appeal</span>
            </button>
          )}

          {/* Status 0 or 8 & past deadline: Reclaim */}
          {(escrow.status === 0 || escrow.status === 8) && isClient && (
            <button
              onClick={() => onReclaim(escrow.escrow_id)}
              disabled={isActionLoading('reclaim')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
              title="Reclaim expired or stalled migration escrow"
            >
              Reclaim
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
