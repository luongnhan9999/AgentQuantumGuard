import React, { useState } from 'react';
import { X, Gavel, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';
import { PQCEscrowRecord } from '../config/genlayer';
import { formatGen } from '../utils/formatters';

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrow: PQCEscrowRecord | null;
  onSubmit: (escrowId: string, reason: string, supplementalUrl: string, bondGen: string) => Promise<void>;
  loading: boolean;
}

const ACCREDITED_DOMAINS = [
  "csrc.nist.gov",
  "nist.gov",
  "openquantumsafe.org",
  "eprint.iacr.org",
  "github.com/open-quantum-safe",
  "pq-crystals.org",
  "sphincs.org",
];

export const AppealModal: React.FC<AppealModalProps> = ({
  isOpen,
  onClose,
  escrow,
  onSubmit,
  loading
}) => {
  const [reason, setReason] = useState("");
  const [supplementalUrl, setSupplementalUrl] = useState("https://openquantumsafe.org/benchmarks/formal_audit.txt");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !escrow) return null;

  // Calculate required 10% dispute bond
  const escrowAmountWei = BigInt(escrow.escrow_amount || "0");
  const requiredBondWei = escrowAmountWei / BigInt(10);
  const requiredBondGen = formatGen(requiredBondWei.toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanReason = reason.trim();
    if (cleanReason.length < 10) {
      setError("Please provide a detailed dispute reason (at least 10 characters).");
      return;
    }

    const cleanUrl = supplementalUrl.trim().toLowerCase();
    const isAccredited = ACCREDITED_DOMAINS.some(d => cleanUrl.includes(d));
    if (!isAccredited) {
      setError(`Supplemental evidence must originate strictly from accredited cryptographic authorities (${ACCREDITED_DOMAINS.slice(0, 3).join(", ")}, etc.)`);
      return;
    }

    try {
      await onSubmit(escrow.escrow_id, cleanReason, supplementalUrl.trim(), requiredBondGen);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to file appeal on StudioNet.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-obsidian-850 border border-obsidian-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">Supreme Appellate Tribunal</h3>
              <p className="text-xs text-slate-400 font-mono">24-Block Cooling-Off Challenge Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-500/50 rounded-xl flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Dispute Notice */}
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl flex items-start gap-2.5 text-xs text-purple-200">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Mandatory 10% Dispute Bond</span>
              <span>
                Filing an appeal requires staking a 10% bond ({requiredBondGen} GEN). The bond is fully refunded if your appeal is upheld, or forfeited to the counterparty if dismissed.
              </span>
            </div>
          </div>

          {/* Current Verdict Info */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-3 text-xs font-mono">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Challenged Escrow:</span>
              <span className="text-white font-semibold">#{escrow.escrow_id}</span>
            </div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Current Verdict:</span>
              <span className="text-quantum-amber font-semibold">{escrow.verdict}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Required 10% Bond:</span>
              <span className="text-purple-300 font-semibold">{requiredBondGen} GEN</span>
            </div>
          </div>

          {/* Dispute Reason */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Dispute Justification & Mathematical Grounds
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the initial verdict diverges from NIST FIPS 203/204 parameters..."
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>

          {/* Supplemental Evidence URL */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Accredited Supplemental Audit URL
            </label>
            <input
              type="url"
              required
              value={supplementalUrl}
              onChange={(e) => setSupplementalUrl(e.target.value)}
              placeholder="https://openquantumsafe.org/..."
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500 font-mono">
              Must originate strictly from accredited domains: NIST, IACR, OpenQuantumSafe.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 rounded-lg text-sm font-mono transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-display font-medium shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Filing Appeal...</span>
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  <span>Stake {requiredBondGen} GEN & Appeal</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
