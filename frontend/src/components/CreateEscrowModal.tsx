import React, { useState } from 'react';
import { X, ShieldPlus, AlertCircle, HelpCircle } from 'lucide-react';

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (suite: string, category: number, blocks: number, depositGen: string) => Promise<void>;
  loading: boolean;
}

const PRESET_SUITES = [
  { name: "ML-KEM-768 (NIST FIPS 203 - Lattice KEM)", cat: 3 },
  { name: "ML-KEM-1024 (NIST FIPS 203 - Category 5 KEM)", cat: 5 },
  { name: "ML-DSA-65 (NIST FIPS 204 - Dilithium Signature)", cat: 3 },
  { name: "ML-DSA-87 (NIST FIPS 204 - Category 5 Signature)", cat: 5 },
  { name: "SLH-DSA-128 (NIST FIPS 205 - SPHINCS+ Hash Signature)", cat: 1 },
];

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const [suite, setSuite] = useState(PRESET_SUITES[0].name);
  const [customSuite, setCustomSuite] = useState("");
  const [category, setCategory] = useState<number>(3);
  const [blocks, setBlocks] = useState<number>(6000);
  const [deposit, setDeposit] = useState<string>("0.5");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalSuite = suite === "CUSTOM" ? customSuite.trim() : suite;
    if (!finalSuite || finalSuite.length < 4) {
      setError("Please specify a valid PQC algorithm suite.");
      return;
    }

    const numDeposit = parseFloat(deposit);
    if (isNaN(numDeposit) || numDeposit <= 0) {
      setError("Deposit amount must be greater than 0 GEN.");
      return;
    }

    try {
      await onSubmit(finalSuite, category, blocks, deposit);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to initialize PQC Escrow on StudioNet.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-obsidian-850 border border-obsidian-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-quantum-violet/20 border border-quantum-violet/30 rounded-lg text-quantum-violet">
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">Initiate PQC Migration Escrow</h3>
              <p className="text-xs text-slate-400 font-mono">Contracting Enterprise / DAO Deposit</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Target Algorithm Suite */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Target PQC Algorithm Suite (NIST Standard)
            </label>
            <select
              value={suite}
              onChange={(e) => {
                const val = e.target.value;
                setSuite(val);
                const found = PRESET_SUITES.find(p => p.name === val);
                if (found) setCategory(found.cat);
              }}
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-quantum-violet font-mono"
            >
              {PRESET_SUITES.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
              <option value="CUSTOM">Custom Post-Quantum Algorithm Suite...</option>
            </select>
          </div>

          {suite === "CUSTOM" && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Custom Specification Identifier
              </label>
              <input
                type="text"
                value={customSuite}
                onChange={(e) => setCustomSuite(e.target.value)}
                placeholder="e.g. ML-KEM-512 / FrodoKEM-640"
                className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-quantum-violet font-mono"
              />
            </div>
          )}

          {/* NIST Security Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Minimum NIST Security Category
              </label>
              <span className="text-[11px] text-quantum-cyan font-mono flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> FIPS 203/204
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { cat: 1, label: "Cat 1", desc: "AES-128" },
                { cat: 3, label: "Cat 3", desc: "AES-192" },
                { cat: 5, label: "Cat 5", desc: "AES-256" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.cat}
                  onClick={() => setCategory(item.cat)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    category === item.cat
                      ? 'bg-quantum-violet/20 border-quantum-violet text-white shadow-md shadow-purple-950'
                      : 'bg-obsidian-900/60 border-obsidian-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold font-display text-sm">{item.label}</div>
                  <div className="text-[10px] font-mono text-slate-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Amount in GEN */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Escrow Capital Deposit (GEN)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.001"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="0.5"
                className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg pl-3 pr-16 py-2.5 text-sm text-white focus:outline-none focus:border-quantum-violet font-mono font-medium"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-quantum-violet font-semibold">
                GEN
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-mono">
              Collateral locked in GenLayer consensus storage until mathematical NIST validation.
            </p>
          </div>

          {/* Duration Blocks */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Contract Migration Window (Blocks)
            </label>
            <input
              type="number"
              min="100"
              value={blocks}
              onChange={(e) => setBlocks(parseInt(e.target.value) || 6000)}
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-quantum-violet font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500 font-mono">
              {blocks} blocks ≈ {Math.round((blocks * 3) / 3600 * 10) / 10} hours on StudioNet (3s block time).
            </p>
          </div>

          {/* Submit Buttons */}
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
              className="px-5 py-2 bg-gradient-to-r from-quantum-violet to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium font-display shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Locking Escrow...</span>
                </>
              ) : (
                <span>Deposit & Open Escrow</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
