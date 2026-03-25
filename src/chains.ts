import type { ChainMeta } from "./types";

/**
 * Popular chains with display metadata.
 * Icons use Unicode/emoji for zero-dependency rendering.
 */
export const CHAIN_LIST: ChainMeta[] = [
  { id: 1, name: "Ethereum", icon: "\u039E", nativeSymbol: "ETH" },
  { id: 10, name: "Optimism", icon: "\u26A1", nativeSymbol: "ETH" },
  { id: 56, name: "BNB Chain", icon: "\u25C6", nativeSymbol: "BNB" },
  { id: 100, name: "Gnosis", icon: "\u26C4", nativeSymbol: "xDAI" },
  { id: 137, name: "Polygon", icon: "\u25B2", nativeSymbol: "MATIC" },
  { id: 196, name: "X Layer", icon: "\u2726", nativeSymbol: "OKB" },
  { id: 8453, name: "Base", icon: "\u25CF", nativeSymbol: "ETH" },
  { id: 42161, name: "Arbitrum", icon: "\u25B6", nativeSymbol: "ETH" },
  { id: 43114, name: "Avalanche", icon: "\u25B3", nativeSymbol: "AVAX" },
  { id: 1012, name: "Plasma", icon: "\u2B23", nativeSymbol: "PLAS" },
  { id: 80094, name: "Berachain", icon: "\u25A0", nativeSymbol: "BERA" },
  { id: 10143, name: "Monad", icon: "\u25CE", nativeSymbol: "MON" },
  { id: 1151111081099710, name: "Solana", icon: "\u2600", nativeSymbol: "SOL" },
  { id: 20000000000001, name: "Bitcoin", icon: "\u20BF", nativeSymbol: "BTC" },
  { id: 9270000000000000, name: "Sui", icon: "\u223C", nativeSymbol: "SUI" },
  { id: 900000001, name: "NEAR", icon: "\u2B1A", nativeSymbol: "NEAR" },
  { id: 900000002, name: "TON", icon: "\u25C8", nativeSymbol: "TON" },
  { id: 900000003, name: "Tron", icon: "\u2742", nativeSymbol: "TRX" },
  { id: 900000004, name: "XRP Ledger", icon: "\u2718", nativeSymbol: "XRP" },
  { id: 900000005, name: "Dogecoin", icon: "\u0110", nativeSymbol: "DOGE" },
  { id: 900000006, name: "Litecoin", icon: "\u0141", nativeSymbol: "LTC" },
  { id: 900000008, name: "Stellar", icon: "\u2605", nativeSymbol: "XLM" },
  { id: 900000009, name: "Cardano", icon: "\u2660", nativeSymbol: "ADA" },
  { id: 900000010, name: "Aptos", icon: "\u2248", nativeSymbol: "APT" },
];

/** Lookup chain by ID */
export function getChainById(id: number): ChainMeta | undefined {
  return CHAIN_LIST.find((c) => c.id === id);
}

/** Default chains for widget initialization */
export const DEFAULT_FROM_CHAIN = CHAIN_LIST[0]; // Ethereum
export const DEFAULT_TO_CHAIN = CHAIN_LIST[7]; // Arbitrum
