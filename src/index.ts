/**
 * @hypermid/crosschain-widget
 *
 * Embeddable cross-chain swap widget for Hypermid. Mounts the live Hypermid
 * swap app (wallet connection, quoting, V2 execution, partner attribution) in
 * a sandboxed iframe — so it always reflects production with zero maintenance
 * on the integrator's side. This is the typed, npm-distributed counterpart of
 * the hosted `embed.js` script tag; both share the same iframe contract.
 *
 * Usage (npm):
 *   import { HypermidWidget } from "@hypermid/crosschain-widget";
 *   const widget = new HypermidWidget({
 *     containerId: "swap-widget",
 *     apiKey: "pk_live_…",      // optional — attributes swaps to your account
 *     theme: "dark",
 *     defaultFromChain: 8453,   // Base
 *     defaultToChain: 369,      // PulseChain
 *   });
 *   widget.mount();
 *
 * Usage (script tag / UMD):
 *   <div id="hypermid-widget"></div>
 *   <script src="https://unpkg.com/@hypermid/crosschain-widget"></script>
 *   <script>HypermidWidget.init({ containerId: "hypermid-widget", apiKey: "pk_live_…" });</script>
 */

const APP_BASE = "https://app.hypermid.io";
const ALLOWED_ORIGINS = [APP_BASE, "https://hypermid.io"];

export interface HypermidWidgetConfig {
  /** DOM element id to mount into. Required. */
  containerId: string;
  /**
   * Your Hypermid API key. Optional — when set, swaps are attributed to your
   * partner account (fees accrue to you) via `X-API-Key`. Omit for a keyless,
   * organic widget. Publishable (`pk_live_…`) keys are intended for client use.
   */
  apiKey?: string;
  /** @deprecated Use `apiKey`. Kept for backward compatibility only. */
  partnerId?: string;

  theme?: "dark" | "light";
  mode?: "swap" | "gas" | "fund";

  defaultFromChain?: number;
  defaultToChain?: number;
  defaultFromToken?: string;
  defaultToToken?: string;
  defaultFromAmount?: string;
  walletAddress?: string;

  lockFromChain?: boolean;
  lockToChain?: boolean;
  hideOnramp?: boolean;
  hidePoweredBy?: boolean;

  /** Layout. Height is a floor — the widget grows to fit taller content. */
  width?: string;
  height?: string;
  borderRadius?: string;

  /** Theming overrides (hex, with or without `#`). */
  accentColor?: string;
  accentHoverColor?: string;
  secondaryColor?: string;
  errorColor?: string;
  bgPrimary?: string;
  bgCard?: string;
  bgCardInner?: string;
  bgInput?: string;
  textPrimary?: string;
  textSecondary?: string;
  borderColor?: string;
  buttonRadius?: string | number;
  fontFamily?: string;
  shadow?: string;

  /** Event callbacks. */
  onQuote?: (payload: unknown) => void;
  onExecute?: (payload: unknown) => void;
  onStatusChange?: (payload: unknown) => void;
  onError?: (payload: unknown) => void;
  onReady?: () => void;
}

const hex = (c: string) => encodeURIComponent(c.replace("#", ""));

function buildUrl(config: HypermidWidgetConfig): string {
  const p: string[] = [];
  if (config.apiKey) p.push("apiKey=" + encodeURIComponent(config.apiKey));
  if (config.partnerId) p.push("partnerId=" + encodeURIComponent(config.partnerId));
  if (config.theme) p.push("theme=" + encodeURIComponent(config.theme));
  if (config.mode) p.push("mode=" + encodeURIComponent(config.mode));
  if (config.defaultFromChain) p.push("fromChain=" + config.defaultFromChain);
  if (config.defaultToChain) p.push("toChain=" + config.defaultToChain);
  if (config.defaultFromToken) p.push("fromToken=" + encodeURIComponent(config.defaultFromToken));
  if (config.defaultToToken) p.push("toToken=" + encodeURIComponent(config.defaultToToken));
  if (config.defaultFromAmount) p.push("fromAmount=" + encodeURIComponent(config.defaultFromAmount));
  if (config.walletAddress) p.push("wallet=" + encodeURIComponent(config.walletAddress));
  if (config.lockFromChain) p.push("lockFromChain=1");
  if (config.lockToChain) p.push("lockToChain=1");
  if (config.hideOnramp) p.push("hideOnramp=1");
  if (config.hidePoweredBy) p.push("hidePoweredBy=1");

  if (config.accentColor) p.push("accent=" + hex(config.accentColor));
  if (config.accentHoverColor) p.push("accentHover=" + hex(config.accentHoverColor));
  if (config.secondaryColor) p.push("secondary=" + hex(config.secondaryColor));
  if (config.errorColor) p.push("error=" + hex(config.errorColor));
  if (config.bgPrimary) p.push("bgPrimary=" + hex(config.bgPrimary));
  if (config.bgCard) p.push("bgCard=" + hex(config.bgCard));
  if (config.bgCardInner) p.push("bgCardInner=" + hex(config.bgCardInner));
  if (config.bgInput) p.push("bgInput=" + hex(config.bgInput));
  if (config.textPrimary) p.push("textPrimary=" + hex(config.textPrimary));
  if (config.textSecondary) p.push("textSecondary=" + hex(config.textSecondary));
  if (config.borderColor) p.push("borderColor=" + encodeURIComponent(config.borderColor));
  if (config.borderRadius) p.push("borderRadius=" + config.borderRadius);
  if (config.buttonRadius) p.push("buttonRadius=" + config.buttonRadius);
  if (config.fontFamily) p.push("fontFamily=" + encodeURIComponent(config.fontFamily));
  if (config.shadow) p.push("shadow=" + encodeURIComponent(config.shadow));

  p.push("embed=1");
  return APP_BASE + "/widget?" + p.join("&");
}

export class HypermidWidget {
  private config: HypermidWidgetConfig;
  private container: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private onMessage: ((e: MessageEvent) => void) | null = null;

  constructor(config: HypermidWidgetConfig) {
    this.config = { theme: "dark", ...config };
  }

  /** Construct + mount in one call (mirrors the script-tag `HypermidWidget.init`). */
  static init(config: HypermidWidgetConfig): HypermidWidget {
    const w = new HypermidWidget(config);
    w.mount();
    return w;
  }

  mount(): this {
    if (typeof document === "undefined") return this; // SSR no-op
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.error("[HypermidWidget] Element #" + this.config.containerId + " not found");
      return this;
    }
    this.container = container;

    const iframe = document.createElement("iframe");
    iframe.src = buildUrl(this.config);
    iframe.title = "Hypermid Swap";
    iframe.allow = "clipboard-write; payment; web-share";
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation",
    );
    const width = this.config.width || "420px";
    const height = this.config.height || "640px";
    const radius = this.config.borderRadius || "16px";
    iframe.style.cssText = [
      "width:" + width,
      "height:" + height,
      "max-width:100%",
      "border:none",
      "border-radius:" + radius,
      "box-shadow:0 4px 24px rgba(0,0,0,0.15)",
      "display:block",
      "margin:0 auto",
      "color-scheme:normal",
    ].join(";");

    this.iframe = iframe;
    container.innerHTML = "";
    container.appendChild(iframe);
    this.listen();
    return this;
  }

  private listen(): void {
    const floor = parseInt(String(this.config.height), 10) || 640;
    this.onMessage = (event: MessageEvent) => {
      // Route only messages from THIS widget's iframe (supports many per page).
      if (ALLOWED_ORIGINS.indexOf(event.origin) === -1) return;
      if (!this.iframe || event.source !== this.iframe.contentWindow) return;
      const data = event.data as { type?: string; payload?: any };
      if (!data || typeof data.type !== "string" || data.type.indexOf("hypermid:") !== 0) return;

      switch (data.type.slice("hypermid:".length)) {
        case "quote": this.config.onQuote?.(data.payload); break;
        case "execute": this.config.onExecute?.(data.payload); break;
        case "status": this.config.onStatusChange?.(data.payload); break;
        case "error": this.config.onError?.(data.payload); break;
        case "ready": this.config.onReady?.(); break;
        case "resize":
          // Grow-only: never shrink below the configured/default height, so a
          // transient small measurement can't collapse the embed.
          if (this.iframe && data.payload && typeof data.payload.height === "number") {
            this.iframe.style.height = Math.max(data.payload.height, floor) + "px";
          }
          break;
      }
    };
    window.addEventListener("message", this.onMessage);
  }

  /** Merge new config and reload the iframe URL. */
  update(partial: Partial<HypermidWidgetConfig>): void {
    this.config = { ...this.config, ...partial };
    if (this.iframe) this.iframe.src = buildUrl(this.config);
  }

  /** Post a message into the widget iframe. */
  postMessage(type: string, payload?: unknown): void {
    this.iframe?.contentWindow?.postMessage({ type: "hypermid:" + type, payload }, APP_BASE);
  }

  /** Programmatically set swap params without reloading. */
  setSwap(params: {
    fromChain?: number; toChain?: number;
    fromToken?: string; toToken?: string; fromAmount?: string;
  }): void {
    this.postMessage("setSwap", params);
  }

  /** Switch theme without reloading. */
  setTheme(theme: "dark" | "light"): void {
    this.config.theme = theme;
    this.postMessage("setTheme", { theme });
  }

  /** Remove the widget + its listener. */
  destroy(): void {
    if (this.onMessage) window.removeEventListener("message", this.onMessage);
    if (this.container) this.container.innerHTML = "";
    this.onMessage = null;
    this.iframe = null;
    this.container = null;
  }
}

export default HypermidWidget;

// Script-tag (UMD) convenience: expose globally + auto-init from data attributes.
if (typeof window !== "undefined") {
  (window as any).HypermidWidget = HypermidWidget;
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      const el = document.querySelector("[data-hypermid-widget]") as HTMLElement | null;
      if (!el) return;
      HypermidWidget.init({
        containerId: el.id || "hypermid-widget",
        apiKey: el.getAttribute("data-api-key") || undefined,
        partnerId: el.getAttribute("data-partner-id") || undefined,
        theme: (el.getAttribute("data-theme") as "dark" | "light") || "dark",
        defaultFromChain: parseInt(el.getAttribute("data-from-chain") || "", 10) || undefined,
        defaultToChain: parseInt(el.getAttribute("data-to-chain") || "", 10) || undefined,
      });
    });
  }
}
