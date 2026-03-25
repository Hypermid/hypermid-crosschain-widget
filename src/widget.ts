import type { WidgetConfig, WidgetState, ChainMeta, TokenMeta, WidgetView } from "./types";
import { WidgetStore } from "./state";
import { WidgetApi } from "./api";
import { CHAIN_LIST, getChainById, DEFAULT_FROM_CHAIN, DEFAULT_TO_CHAIN } from "./chains";
import { getTokensForChain, findToken } from "./tokens";
import { buildCss, DARK_THEME, LIGHT_THEME, type ThemeVars } from "./styles";
import { formatAmount, parseAmount, formatUsd, formatTime, formatFeeBps, debounce } from "./utils";

/**
 * HyperMid Cross-Chain Swap Widget.
 * Renders inside a Shadow DOM for complete style isolation.
 */
export class HyperMidSwapWidget {
  private config: WidgetConfig;
  private store: WidgetStore;
  private api: WidgetApi;
  private theme: ThemeVars;
  private shadowRoot: ShadowRoot | null = null;
  private container: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(config: WidgetConfig) {
    this.config = {
      theme: "dark",
      width: "420px",
      borderRadius: "16px",
      accentColor: "#7B3FE4",
      ...config,
    };

    // Build theme with custom accent
    const baseTheme = this.config.theme === "light" ? { ...LIGHT_THEME } : { ...DARK_THEME };
    if (this.config.accentColor) {
      baseTheme.accent = this.config.accentColor;
      baseTheme.accentHover = this.adjustColor(this.config.accentColor, this.config.theme === "light" ? -15 : 15);
    }
    this.theme = baseTheme;

    // Resolve default chains
    const fromChain = this.config.defaultFromChain
      ? getChainById(this.config.defaultFromChain) || DEFAULT_FROM_CHAIN
      : DEFAULT_FROM_CHAIN;
    const toChain = this.config.defaultToChain
      ? getChainById(this.config.defaultToChain) || DEFAULT_TO_CHAIN
      : DEFAULT_TO_CHAIN;

    // Resolve default tokens
    const fromToken = this.config.defaultFromToken
      ? findToken(fromChain.id, this.config.defaultFromToken, fromChain.nativeSymbol) || null
      : getTokensForChain(fromChain.id, fromChain.nativeSymbol)[0] || null;
    const toToken = this.config.defaultToToken
      ? findToken(toChain.id, this.config.defaultToToken, toChain.nativeSymbol) || null
      : getTokensForChain(toChain.id, toChain.nativeSymbol)[0] || null;

    this.store = new WidgetStore({
      fromChain,
      toChain,
      fromToken,
      toToken,
    });

    this.api = new WidgetApi({
      apiKey: this.config.apiKey,
      baseUrl: this.config.baseUrl,
    });
  }

  /** Mount the widget into the configured container */
  mount(): void {
    const hostEl = document.getElementById(this.config.containerId);
    if (!hostEl) {
      console.error(`[HyperMidWidget] Container #${this.config.containerId} not found`);
      return;
    }

    // Create shadow DOM host
    const widgetHost = document.createElement("div");
    widgetHost.style.width = this.config.width || "420px";
    widgetHost.style.maxWidth = "100%";
    widgetHost.style.minWidth = "320px";
    hostEl.appendChild(widgetHost);

    this.shadowRoot = widgetHost.attachShadow({ mode: "open" });
    this.container = widgetHost;

    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.textContent = buildCss(this.theme, this.config.borderRadius || "16px");
    this.shadowRoot.appendChild(styleEl);

    // Render initial UI
    const wrapper = document.createElement("div");
    wrapper.className = "hm-widget";
    this.shadowRoot.appendChild(wrapper);

    this.renderState(this.store.getState());

    // Subscribe to state changes
    this.unsubscribe = this.store.subscribe((state) => {
      this.renderState(state);
    });
  }

  /** Remove the widget and clean up */
  destroy(): void {
    this.unsubscribe?.();
    this.store.destroy();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.shadowRoot = null;
  }

  // ─── Rendering ──────────────────────────────────────────────────────

  private renderState(state: WidgetState): void {
    if (!this.shadowRoot) return;

    const wrapper = this.shadowRoot.querySelector(".hm-widget");
    if (!wrapper) return;

    switch (state.view) {
      case "swap":
        wrapper.innerHTML = this.renderSwapView(state);
        this.bindSwapEvents();
        break;
      case "selectFromChain":
        wrapper.innerHTML = this.renderChainSelector("From Chain", state.fromChain);
        this.bindChainSelectorEvents("from");
        break;
      case "selectToChain":
        wrapper.innerHTML = this.renderChainSelector("To Chain", state.toChain);
        this.bindChainSelectorEvents("to");
        break;
      case "selectFromToken":
        wrapper.innerHTML = this.renderTokenSelector("From Token", state.fromChain, state.fromToken);
        this.bindTokenSelectorEvents("from");
        break;
      case "selectToToken":
        wrapper.innerHTML = this.renderTokenSelector("To Token", state.toChain, state.toToken);
        this.bindTokenSelectorEvents("to");
        break;
    }
  }

  private renderSwapView(state: WidgetState): string {
    const { fromChain, toChain, fromToken, toToken, fromAmount, toAmount, rate, fee, estimatedTime, loading, error } = state;

    const fromAmountUsd = fromToken?.priceUSD && fromAmount
      ? formatUsd(parseFloat(fromAmount) * parseFloat(fromToken.priceUSD))
      : "";

    const hasQuoteInfo = rate || fee || estimatedTime;
    const canGetQuote = fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0;

    return `
      <!-- Header -->
      <div class="hm-header">
        <div class="hm-header-title">
          <span class="hm-header-icon">\u26A1</span>
          HyperMid Swap
        </div>
      </div>

      <!-- From Section -->
      <div class="hm-section">
        <div class="hm-section-label">From</div>
        <div class="hm-card">
          <div class="hm-selectors">
            <button class="hm-select-btn" data-action="selectFromChain">
              <span class="hm-chain-icon">${fromChain.icon}</span>
              ${fromChain.name}
              <span class="hm-arrow">\u25BC</span>
            </button>
            <button class="hm-select-btn" data-action="selectFromToken">
              ${fromToken ? fromToken.symbol : "Select Token"}
              <span class="hm-arrow">\u25BC</span>
            </button>
          </div>
          <input
            type="text"
            class="hm-amount-input"
            data-input="fromAmount"
            placeholder="0.00"
            value="${this.escapeHtml(fromAmount)}"
            inputmode="decimal"
            autocomplete="off"
          />
          ${fromAmountUsd ? `<div class="hm-amount-usd">\u2248 ${fromAmountUsd}</div>` : ""}
        </div>
      </div>

      <!-- Swap Direction -->
      <div class="hm-swap-direction">
        <button class="hm-swap-btn" data-action="swapDirection" title="Swap direction">\u2195</button>
      </div>

      <!-- To Section -->
      <div class="hm-section">
        <div class="hm-section-label">To</div>
        <div class="hm-card">
          <div class="hm-selectors">
            <button class="hm-select-btn" data-action="selectToChain">
              <span class="hm-chain-icon">${toChain.icon}</span>
              ${toChain.name}
              <span class="hm-arrow">\u25BC</span>
            </button>
            <button class="hm-select-btn" data-action="selectToToken">
              ${toToken ? toToken.symbol : "Select Token"}
              <span class="hm-arrow">\u25BC</span>
            </button>
          </div>
          <div class="hm-estimated-amount">${toAmount ? `Estimated: ${toAmount}` : "Estimated: 0.00"}</div>
        </div>
      </div>

      <!-- Quote Info -->
      ${hasQuoteInfo ? `
        <div class="hm-quote-info">
          ${rate ? `<span class="hm-quote-item"><span class="hm-quote-item-label">Rate:</span> ${rate}</span>` : ""}
          ${fee ? `<span class="hm-quote-item"><span class="hm-quote-item-label">Fee:</span> ${fee}</span>` : ""}
          ${estimatedTime ? `<span class="hm-quote-item">${estimatedTime}</span>` : ""}
        </div>
      ` : ""}

      <!-- Error -->
      ${error ? `<div class="hm-error">\u26A0 ${this.escapeHtml(error)}</div>` : ""}

      <!-- Actions -->
      <div class="hm-actions">
        <button
          class="hm-btn hm-btn-primary"
          data-action="getQuote"
          ${!canGetQuote || loading ? "disabled" : ""}
        >
          ${loading ? '<span class="hm-spinner"></span> Getting Quote...' : "Get Quote"}
        </button>
        ${!this.config.hideOnramp ? `
          <button class="hm-btn hm-btn-secondary" data-action="buyWithCard">
            \uD83D\uDCB3 Buy with Card
          </button>
        ` : ""}
      </div>

      <!-- Footer -->
      ${!this.config.hidePoweredBy ? `
        <div class="hm-footer">
          Powered by <a href="https://hypermid.io" target="_blank" rel="noopener">HyperMid</a>
        </div>
      ` : ""}
    `;
  }

  private renderChainSelector(title: string, currentChain: ChainMeta): string {
    return `
      <div class="hm-panel">
        <div class="hm-panel-header">
          <span class="hm-panel-title">${title}</span>
          <button class="hm-panel-close" data-action="closePanel">\u2715</button>
        </div>
        <input
          type="text"
          class="hm-search-input"
          data-input="chainSearch"
          placeholder="Search chains..."
          autocomplete="off"
        />
        <div class="hm-option-list" data-list="chains">
          ${CHAIN_LIST.map(
            (chain) => `
            <button class="hm-option ${chain.id === currentChain.id ? "selected" : ""}" data-chain-id="${chain.id}">
              <span class="hm-option-icon">${chain.icon}</span>
              <div class="hm-option-info">
                <span class="hm-option-name">${chain.name}</span>
                <span class="hm-option-detail">${chain.nativeSymbol}</span>
              </div>
            </button>
          `,
          ).join("")}
        </div>
      </div>
    `;
  }

  private renderTokenSelector(title: string, chain: ChainMeta, currentToken: TokenMeta | null): string {
    const tokens = getTokensForChain(chain.id, chain.nativeSymbol);

    return `
      <div class="hm-panel">
        <div class="hm-panel-header">
          <span class="hm-panel-title">${title}</span>
          <button class="hm-panel-close" data-action="closePanel">\u2715</button>
        </div>
        <input
          type="text"
          class="hm-search-input"
          data-input="tokenSearch"
          placeholder="Search tokens..."
          autocomplete="off"
        />
        <div class="hm-option-list" data-list="tokens">
          ${tokens.map(
            (token) => `
            <button class="hm-option ${currentToken?.address === token.address ? "selected" : ""}" data-token-address="${token.address}">
              <span class="hm-option-icon">${token.symbol.charAt(0)}</span>
              <div class="hm-option-info">
                <span class="hm-option-name">${token.symbol}</span>
                <span class="hm-option-detail">${token.name}</span>
              </div>
            </button>
          `,
          ).join("")}
        </div>
      </div>
    `;
  }

  // ─── Event Binding ──────────────────────────────────────────────────

  private bindSwapEvents(): void {
    if (!this.shadowRoot) return;

    // Action buttons
    this.shadowRoot.querySelectorAll<HTMLElement>("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        switch (action) {
          case "selectFromChain":
            this.store.setState({ view: "selectFromChain" });
            break;
          case "selectToChain":
            this.store.setState({ view: "selectToChain" });
            break;
          case "selectFromToken":
            this.store.setState({ view: "selectFromToken" });
            break;
          case "selectToToken":
            this.store.setState({ view: "selectToToken" });
            break;
          case "swapDirection":
            this.store.swapDirection();
            break;
          case "getQuote":
            this.handleGetQuote();
            break;
          case "buyWithCard":
            this.handleBuyWithCard();
            break;
        }
      });
    });

    // Amount input
    const amountInput = this.shadowRoot.querySelector<HTMLInputElement>('[data-input="fromAmount"]');
    if (amountInput) {
      amountInput.addEventListener("input", (e) => {
        const value = (e.target as HTMLInputElement).value;
        // Allow only valid decimal numbers
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
          this.store.setFromAmount(value);
        }
      });
      // Prevent re-render from clearing cursor position during typing
      amountInput.addEventListener("focus", () => {
        amountInput.dataset.focused = "true";
      });
    }
  }

  private bindChainSelectorEvents(direction: "from" | "to"): void {
    if (!this.shadowRoot) return;

    // Close button
    this.shadowRoot.querySelector('[data-action="closePanel"]')?.addEventListener("click", () => {
      this.store.setState({ view: "swap" });
    });

    // Chain options
    this.shadowRoot.querySelectorAll<HTMLElement>("[data-chain-id]").forEach((option) => {
      option.addEventListener("click", () => {
        const chainId = parseInt(option.dataset.chainId!, 10);
        const chain = getChainById(chainId);
        if (chain) {
          if (direction === "from") {
            this.store.setFromChain(chain);
          } else {
            this.store.setToChain(chain);
          }
          this.store.setState({ view: "swap" });
        }
      });
    });

    // Search filter
    const searchInput = this.shadowRoot.querySelector<HTMLInputElement>('[data-input="chainSearch"]');
    if (searchInput) {
      searchInput.addEventListener("input", debounce(() => {
        const query = searchInput.value.toLowerCase();
        this.shadowRoot?.querySelectorAll<HTMLElement>("[data-chain-id]").forEach((option) => {
          const name = option.querySelector(".hm-option-name")?.textContent?.toLowerCase() || "";
          option.style.display = name.includes(query) ? "" : "none";
        });
      }, 150));
      searchInput.focus();
    }
  }

  private bindTokenSelectorEvents(direction: "from" | "to"): void {
    if (!this.shadowRoot) return;
    const state = this.store.getState();
    const chain = direction === "from" ? state.fromChain : state.toChain;

    // Close button
    this.shadowRoot.querySelector('[data-action="closePanel"]')?.addEventListener("click", () => {
      this.store.setState({ view: "swap" });
    });

    // Token options
    this.shadowRoot.querySelectorAll<HTMLElement>("[data-token-address]").forEach((option) => {
      option.addEventListener("click", () => {
        const address = option.dataset.tokenAddress!;
        const token = findToken(chain.id, address, chain.nativeSymbol);
        if (token) {
          if (direction === "from") {
            this.store.setFromToken(token);
          } else {
            this.store.setToToken(token);
          }
          this.store.setState({ view: "swap" });
        }
      });
    });

    // Search filter
    const searchInput = this.shadowRoot.querySelector<HTMLInputElement>('[data-input="tokenSearch"]');
    if (searchInput) {
      searchInput.addEventListener("input", debounce(() => {
        const query = searchInput.value.toLowerCase();
        this.shadowRoot?.querySelectorAll<HTMLElement>("[data-token-address]").forEach((option) => {
          const name = option.querySelector(".hm-option-name")?.textContent?.toLowerCase() || "";
          const detail = option.querySelector(".hm-option-detail")?.textContent?.toLowerCase() || "";
          option.style.display = name.includes(query) || detail.includes(query) ? "" : "none";
        });
      }, 150));
      searchInput.focus();
    }
  }

  // ─── Actions ────────────────────────────────────────────────────────

  private async handleGetQuote(): Promise<void> {
    const state = this.store.getState();
    const { fromChain, toChain, fromToken, toToken, fromAmount } = state;

    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      this.store.setError("Please fill in all fields");
      return;
    }

    this.store.setState({ loading: true, error: null });

    try {
      const rawAmount = parseAmount(fromAmount, fromToken.decimals);
      // Use a placeholder address for dry quotes
      const dummyAddress = "0x0000000000000000000000000000000000000001";

      const quote = await this.api.getQuote({
        fromChain: fromChain.id,
        fromToken: fromToken.address,
        fromAmount: rawAmount,
        toChain: toChain.id,
        toToken: toToken.address,
        fromAddress: dummyAddress,
        slippage: 0.5,
      });

      // Extract quote details
      const quoteData = quote.quote as Record<string, unknown>;
      let toAmountStr = "0";
      let estimatedTimeSec = 0;

      // LI.FI quote structure
      if (quoteData?.estimate) {
        const estimate = quoteData.estimate as Record<string, unknown>;
        const toAmountRaw = (estimate.toAmount as string) || "0";
        toAmountStr = formatAmount(toAmountRaw, toToken.decimals);
        estimatedTimeSec = (estimate.executionDuration as number) || 0;
      }
      // Near Intents quote structure
      else if (quoteData?.toAmount) {
        toAmountStr = formatAmount(quoteData.toAmount as string, toToken.decimals);
        estimatedTimeSec = (quoteData.timeEstimate as number) || 0;
      }

      // Build rate string
      let rateStr = "";
      if (toAmountStr !== "0" && parseFloat(fromAmount) > 0) {
        const ratio = parseFloat(toAmountStr.replace(/,/g, "")) / parseFloat(fromAmount);
        rateStr = `1 ${fromToken.symbol} = ${ratio.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${toToken.symbol}`;
      }

      this.store.setState({
        loading: false,
        quoteData: quote,
        toAmount: toAmountStr,
        rate: rateStr,
        fee: formatFeeBps(quote.feeBps),
        estimatedTime: estimatedTimeSec > 0 ? formatTime(estimatedTimeSec) : "",
        error: null,
      });

      this.config.onQuote?.(quote);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const message = errorObj?.message || "Failed to get quote";
      this.store.setError(message);
      this.config.onError?.({
        code: errorObj?.code || "QUOTE_ERROR",
        message,
      });
    }
  }

  private handleBuyWithCard(): void {
    // Open HyperMid on-ramp in a new tab
    window.open("https://hypermid.io/onramp", "_blank", "noopener");
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  private adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
    const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }
}
