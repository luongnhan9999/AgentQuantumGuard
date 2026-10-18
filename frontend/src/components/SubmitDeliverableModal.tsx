import React, { useState } from 'react';
import { X, Send, KeyRound, AlertCircle, FileCode, Check } from 'lucide-react';

interface SubmitDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowId: string;
  targetSuite: string;
  onSubmit: (escrowId: string, specUrl: string, specHash: string) => Promise<void>;
  loading: boolean;
}

export const SubmitDeliverableModal: React.FC<SubmitDeliverableModalProps> = ({
  isOpen,
  onClose,
  escrowId,
  targetSuite,
  onSubmit,
  loading
}) => {
  const [specUrl, setSpecUrl] = useState("https://csrc.nist.gov/publications/detail/fips/203/final");
  const [specHash, setSpecHash] = useState("");
  const [pastePayload, setPastePayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hashCalculated, setHashCalculated] = useState(false);

  if (!isOpen) return null;

  const handleComputeHash = async () => {
    if (!pastePayload.trim()) return;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(pastePayload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setSpecHash(hashHex);
      setHashCalculated(true);
      setTimeout(() => setHashCalculated(false), 3000);
    } catch (err: any) {
      setError("Failed to calculate SHA-256 in browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUrl = specUrl.trim();
    const cleanHash = specHash.trim().toLowerCase();

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      setError("Public PQC deliverable URL must begin with http:// or https://");
      return;
    }

    if (cleanHash.length !== 64 || !/^[0-9a-f]{64}$/.test(cleanHash)) {
      setError("Content commitment must be a genuine 64-character lowercase hexadecimal SHA-256 hash.");
      return;
    }

    try {
      await onSubmit(escrowId, cleanUrl, cleanHash);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to submit deliverable on StudioNet.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-obsidian-850 border border-obsidian-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-quantum-cyan/20 border border-quantum-cyan/30 rounded-lg text-quantum-cyan">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">Submit PQC Deliverable</h3>
              <p className="text-xs text-slate-400 font-mono">Escrow #{escrowId} • {targetSuite}</p>
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
          
          {/* Deliverable Document URL */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Public PQC Specification / Keypair URL
            </label>
            <input
              type="url"
              required
              value={specUrl}
              onChange={(e) => setSpecUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-quantum-cyan font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500 font-mono">
              AI Tribunal will fetch and render this URL via gl.nondet.web.render during consensus.
            </p>
          </div>

          {/* Quick SHA-256 Calculator helper */}
          <div className="bg-obsidian-900/60 border border-obsidian-700/60 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-quantum-cyan flex items-center gap-1 font-semibold">
                <FileCode className="w-3.5 h-3.5" /> Payload SHA-256 Generator
              </span>
              <button
                type="button"
                onClick={handleComputeHash}
                className="text-[11px] font-mono bg-quantum-cyan/20 hover:bg-quantum-cyan/30 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 transition-all flex items-center gap-1"
              >
                {hashCalculated ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                Compute SHA-256
              </button>
            </div>
            <textarea
              rows={2}
              value={pastePayload}
              onChange={(e) => setPastePayload(e.target.value)}
              placeholder="Paste raw text payload here to calculate genuine hash commitment..."
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-quantum-cyan"
            />
          </div>

          {/* SHA-256 Commitment Hash */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Deliverable Content SHA-256 Commitment
            </label>
            <input
              type="text"
              required
              value={specHash}
              onChange={(e) => setSpecHash(e.target.value)}
              placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-quantum-cyan font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500 font-mono">
              Tamper-resistance: Validator aborts to UNRESOLVED if web document SHA-256 diverges.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 rounded-lg text-sm font-medium font-mono transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-quantum-cyan to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium font-display shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Deliverable</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
