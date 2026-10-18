import React from 'react';
import { ArrowDownToLine, Wallet } from 'lucide-react';
import { formatGen } from '../utils/formatters';

interface PullPayoutButtonProps {
  claimableBalance: string;
  onClaim: () => Promise<void>;
  loading: boolean;
}

export const PullPayoutButton: React.FC<PullPayoutButtonProps> = ({
  claimableBalance,
  onClaim,
  loading
}) => {
  const hasClaimable = BigInt(claimableBalance || "0") > BigInt(0);

  if (!hasClaimable) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950/70 to-obsidian-850 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-emerald-950/20 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Claimable Pull-Payment Balance Available
          </div>
          <div className="text-lg font-bold font-display text-white">
            {formatGen(claimableBalance)} <span className="text-xs font-mono text-emerald-400 font-semibold">GEN</span>
          </div>
        </div>
      </div>

      <button
        onClick={onClaim}
        disabled={loading}
        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-semibold shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Claiming...</span>
          </>
        ) : (
          <>
            <ArrowDownToLine className="w-4 h-4" />
            <span>Withdraw Claimable GEN</span>
          </>
        )}
      </button>
    </div>
  );
};
