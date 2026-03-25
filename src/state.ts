import type { WidgetState, ChainMeta, TokenMeta } from "./types";
import { DEFAULT_FROM_CHAIN, DEFAULT_TO_CHAIN } from "./chains";

export type StateListener = (state: WidgetState) => void;

/**
 * Simple reactive state management for the widget.
 * Subscribers are notified on every state change.
 */
export class WidgetStore {
  private state: WidgetState;
  private listeners: Set<StateListener> = new Set();

  constructor(initialOverrides?: Partial<WidgetState>) {
    this.state = {
      view: "swap",
      fromChain: DEFAULT_FROM_CHAIN,
      toChain: DEFAULT_TO_CHAIN,
      fromToken: null,
      toToken: null,
      fromAmount: "",
      toAmount: "",
      toAmountUsd: "",
      fromAmountUsd: "",
      rate: "",
      fee: "",
      estimatedTime: "",
      loading: false,
      error: null,
      quoteData: null,
      ...initialOverrides,
    };
  }

  /** Get current state (immutable snapshot) */
  getState(): Readonly<WidgetState> {
    return this.state;
  }

  /** Update one or more state fields and notify listeners */
  setState(partial: Partial<WidgetState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  /** Subscribe to state changes. Returns unsubscribe function. */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notify all listeners of current state */
  private notify(): void {
    const snapshot = this.state;
    this.listeners.forEach((fn) => fn(snapshot));
  }

  // ─── Convenience mutations ─────────────────────────────────────────

  setFromChain(chain: ChainMeta): void {
    this.setState({ fromChain: chain, fromToken: null, quoteData: null, toAmount: "", rate: "", fee: "", estimatedTime: "" });
  }

  setToChain(chain: ChainMeta): void {
    this.setState({ toChain: chain, toToken: null, quoteData: null, toAmount: "", rate: "", fee: "", estimatedTime: "" });
  }

  setFromToken(token: TokenMeta): void {
    this.setState({ fromToken: token, quoteData: null, toAmount: "", rate: "", fee: "", estimatedTime: "" });
  }

  setToToken(token: TokenMeta): void {
    this.setState({ toToken: token, quoteData: null, toAmount: "", rate: "", fee: "", estimatedTime: "" });
  }

  setFromAmount(amount: string): void {
    this.setState({ fromAmount: amount, quoteData: null, toAmount: "", rate: "", fee: "", estimatedTime: "" });
  }

  swapDirection(): void {
    const { fromChain, toChain, fromToken, toToken } = this.state;
    this.setState({
      fromChain: toChain,
      toChain: fromChain,
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: "",
      toAmount: "",
      quoteData: null,
      rate: "",
      fee: "",
      estimatedTime: "",
    });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  setError(error: string | null): void {
    this.setState({ error, loading: false });
  }

  clearQuote(): void {
    this.setState({ quoteData: null, toAmount: "", rate: "", fee: "", estimatedTime: "" });
  }

  /** Destroy the store and remove all listeners */
  destroy(): void {
    this.listeners.clear();
  }
}
