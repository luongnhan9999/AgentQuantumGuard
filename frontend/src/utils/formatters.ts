export function formatAddress(addr: string): string {
  if (!addr || addr === "0x0000000000000000000000000000000000000000") return "Unassigned";
  const clean = addr.trim();
  if (clean.length <= 12) return clean;
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
}

export function formatGen(weiStr: string | number): string {
  try {
    const val = BigInt(weiStr || "0");
    const num = Number(val) / 1e18;
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } catch {
    return "0.00";
  }
}

export function formatTimestamp(tsStr: string | number): string {
  try {
    const ts = Number(tsStr);
    if (!ts || ts <= 0) return "N/A";
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  } catch {
    return "Invalid Date";
  }
}

export function getStatusInfo(status: number): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 0:
      return { label: "ESCROW OPEN", color: "text-quantum-violet", bg: "bg-quantum-violet/10", border: "border-quantum-violet/30" };
    case 1:
      return { label: "SPEC DELIVERED", color: "text-quantum-cyan", bg: "bg-quantum-cyan/10", border: "border-quantum-cyan/30" };
    case 2:
      return { label: "AWAITING PAYOUT (COOLING)", color: "text-quantum-amber", bg: "bg-quantum-amber/10", border: "border-quantum-amber/30" };
    case 3:
      return { label: "APPROVED & SETTLED (100%)", color: "text-quantum-emerald", bg: "bg-quantum-emerald/10", border: "border-quantum-emerald/30" };
    case 4:
      return { label: "PARTIAL SETTLED (40/60)", color: "text-quantum-amber", bg: "bg-quantum-amber/10", border: "border-quantum-amber/30" };
    case 5:
      return { label: "INSECURE REJECTED (100% REFUND)", color: "text-quantum-rose", bg: "bg-quantum-rose/10", border: "border-quantum-rose/30" };
    case 6:
      return { label: "APPEAL DISPUTED (COURT)", color: "text-purple-400", bg: "bg-purple-900/30", border: "border-purple-500/40" };
    case 7:
      return { label: "EXPIRED RECLAIMED", color: "text-slate-400", bg: "bg-slate-800/40", border: "border-slate-700" };
    case 8:
      return { label: "UNRESOLVED FAIL-SAFE", color: "text-red-400", bg: "bg-red-950/40", border: "border-red-800/50" };
    default:
      return { label: "UNKNOWN", color: "text-slate-400", bg: "bg-slate-800", border: "border-slate-700" };
  }
}

export function getCategoryLabel(cat: number): string {
  switch (cat) {
    case 1:
      return "Category 1 (AES-128 Equivalent)";
    case 3:
      return "Category 3 (AES-192 Equivalent)";
    case 5:
      return "Category 5 (AES-256 Military Grade)";
    default:
      return `Category ${cat}`;
  }
}
