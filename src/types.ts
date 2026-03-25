// ─── SDK re-exports for widget consumers ────────────────────────────────

export interface QuoteResponse {
  quote: unknown;
  provider: "lifi" | "near-intents";
  feeBps: number;
  isDryQuote: boolean;
}

export interface ExecuteResponse {
  provider: "lifi" | "near-intents";
  feeBps: number;
  depositMode?: "wallet" | "manual";
  transactionRequest?: TransactionRequest;
  depositAddress?: string;
  depositMemo?: string;
  expectedOutput?: string;
  expectedOutputUsd?: number;
  minAmountOut?: string;
  timeEstimate?: number;
  correlationId?: string;
  quote?: {
    fromToken: Token;
    toToken: Token;
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    estimatedTime: number;
    gasCosts: unknown[];
    feeCosts: unknown[];
  };
  instructions?: Record<string, string>;
}

export interface TransactionRequest {
  to: string;
  data: string;
  value: string;
  from: string;
  chainId: number;
  gasLimit?: string;
  gasPrice?: string;
  [key: string]: unknown;
}

export interface StatusResponse {
  provider: "lifi" | "near-intents";
  status?: string;
  [key: string]: unknown;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
  priceUSD?: string;
  [key: string]: unknown;
}

export interface Chain {
  id: number;
  key: string;
  name: string;
  chainType: string;
  nativeToken: {
    symbol: string;
    name: string;
    decimals: number;
  };
  [key: string]: unknown;
}

export interface HyperMidError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

// ─── Widget Config ───────────────────────────────────────────────────────

export interface WidgetConfig {
  /** DOM element ID to mount the widget into */
  containerId: string;
  /** API key for authenticated access (optional) */
  apiKey?: string;
  /** API base URL override (default: https://api.hypermid.io) */
  baseUrl?: string;
  /** Color theme */
  theme?: "dark" | "light";
  /** Default source chain ID */
  defaultFromChain?: number;
  /** Default destination chain ID */
  defaultToChain?: number;
  /** Default source token address */
  defaultFromToken?: string;
  /** Default destination token address */
  defaultToToken?: string;
  /** Brand accent color (hex) */
  accentColor?: string;
  /** Widget width (CSS value, default: "420px") */
  width?: string;
  /** Widget border radius (CSS value, default: "16px") */
  borderRadius?: string;
  /** Hide the "Buy with Card" on-ramp button */
  hideOnramp?: boolean;
  /** Hide the "Powered by HyperMid" footer */
  hidePoweredBy?: boolean;

  // ─── Callbacks ─────────────────────────────────────────────────────
  /** Called when a quote is received */
  onQuote?: (quote: QuoteResponse) => void;
  /** Called when an execution result is received */
  onExecute?: (result: ExecuteResponse) => void;
  /** Called when swap status changes */
  onStatusChange?: (status: StatusResponse) => void;
  /** Called on any error */
  onError?: (error: HyperMidError) => void;
}

// ─── Internal Widget State ───────────────────────────────────────────────

export interface ChainMeta {
  id: number;
  name: string;
  icon: string;
  nativeSymbol: string;
}

export interface TokenMeta {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceUSD?: string;
}

export type WidgetView = "swap" | "selectFromChain" | "selectToChain" | "selectFromToken" | "selectToToken";

export interface WidgetState {
  view: WidgetView;
  fromChain: ChainMeta;
  toChain: ChainMeta;
  fromToken: TokenMeta | null;
  toToken: TokenMeta | null;
  fromAmount: string;
  toAmount: string;
  toAmountUsd: string;
  fromAmountUsd: string;
  rate: string;
  fee: string;
  estimatedTime: string;
  loading: boolean;
  error: string | null;
  quoteData: QuoteResponse | null;
}
