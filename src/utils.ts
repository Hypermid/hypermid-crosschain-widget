/**
 * Formatting helpers for amounts, addresses, and display values.
 */

/** Format a token amount from raw units to human-readable string */
export function formatAmount(rawAmount: string, decimals: number, maxDecimals = 6): string {
  if (!rawAmount || rawAmount === "0") return "0";

  const padded = rawAmount.padStart(decimals + 1, "0");
  const integerPart = padded.slice(0, padded.length - decimals) || "0";
  const decimalPart = padded.slice(padded.length - decimals);

  const trimmedDecimal = decimalPart.slice(0, maxDecimals).replace(/0+$/, "");
  if (!trimmedDecimal) return addThousandsSeparator(integerPart);
  return `${addThousandsSeparator(integerPart)}.${trimmedDecimal}`;
}

/** Parse a human-readable amount to raw units string */
export function parseAmount(amount: string, decimals: number): string {
  if (!amount || amount === "0") return "0";

  const [intPart, decPart = ""] = amount.split(".");
  const paddedDec = decPart.padEnd(decimals, "0").slice(0, decimals);
  const raw = (intPart + paddedDec).replace(/^0+/, "") || "0";
  return raw;
}

/** Add thousands separators to integer string */
function addThousandsSeparator(numStr: string): string {
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Format USD value */
export function formatUsd(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return "$0.00";
  if (num < 0.01) return "<$0.01";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Truncate an address for display: 0x1234...abcd */
export function truncateAddress(address: string, prefixLen = 6, suffixLen = 4): string {
  if (address.length <= prefixLen + suffixLen + 3) return address;
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

/** Format estimated time in seconds to human-readable */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `~${seconds}s`;
  const mins = Math.round(seconds / 60);
  return `~${mins}m`;
}

/** Format fee basis points to percentage string */
export function formatFeeBps(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

/** Debounce a function call */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delayMs: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  }) as T;
}
