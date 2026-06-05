/**
 * @hypermid/crosschain-widget
 *
 * Embeddable cross-chain swap widget for Hypermid.
 * Drop into any website with a single <script> tag or npm import.
 *
 * Usage (script tag):
 *   <div id="hypermid-widget"></div>
 *   <script src="https://cdn.hypermid.io/widget.js"></script>
 *   <script>
 *     HypermidWidget.init({ containerId: "hypermid-widget", theme: "dark" });
 *   </script>
 *
 * Usage (npm):
 *   import { HypermidWidget } from "@hypermid/crosschain-widget";
 *   const widget = new HypermidWidget({ containerId: "swap-widget" });
 *   widget.mount();
 */

import { HypermidSwapWidget } from "./widget";
import type { WidgetConfig } from "./types";

export type { WidgetConfig } from "./types";
export type { QuoteResponse, ExecuteResponse, StatusResponse, HypermidError } from "./types";

/**
 * Main entry point for the Hypermid cross-chain swap widget.
 */
export class HypermidWidget {
  private widget: HypermidSwapWidget;

  constructor(config: WidgetConfig) {
    this.widget = new HypermidSwapWidget(config);
  }

  /** Mount the widget into the DOM */
  mount(): void {
    this.widget.mount();
  }

  /** Remove the widget and clean up all resources */
  destroy(): void {
    this.widget.destroy();
  }

  /**
   * Static factory for script-tag usage.
   * Creates, mounts, and returns a widget instance.
   */
  static init(config: WidgetConfig): HypermidWidget {
    const instance = new HypermidWidget(config);
    instance.mount();
    return instance;
  }
}

// Auto-expose to window for UMD/script-tag usage
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).HypermidWidget = HypermidWidget;
}
