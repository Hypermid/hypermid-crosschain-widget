/**
 * Hypermid Widget Embed Script
 *
 * Embeds the Hypermid swap app as an iframe widget.
 * Partners drop this single script tag into their site.
 *
 * Usage:
 *   <div id="hypermid-widget"></div>
 *   <script src="https://widget.hypermid.io/v1/embed.js"></script>
 *   <script>
 *     HypermidWidget.init({
 *       containerId: "hypermid-widget",
 *       partnerId: "your-partner-id",
 *       theme: "dark",
 *       defaultFromChain: 1,
 *       defaultToChain: 42161,
 *     });
 *   </script>
 */
(function () {
  "use strict";

  var APP_BASE = "https://hypermid.io";

  /**
   * Build the iframe URL with query params from config
   */
  function buildUrl(config) {
    var params = [];

    if (config.partnerId) params.push("partnerId=" + encodeURIComponent(config.partnerId));
    if (config.theme) params.push("theme=" + encodeURIComponent(config.theme));
    if (config.defaultFromChain) params.push("fromChain=" + config.defaultFromChain);
    if (config.defaultToChain) params.push("toChain=" + config.defaultToChain);
    if (config.defaultFromToken) params.push("fromToken=" + encodeURIComponent(config.defaultFromToken));
    if (config.defaultToToken) params.push("toToken=" + encodeURIComponent(config.defaultToToken));
    if (config.defaultFromAmount) params.push("fromAmount=" + encodeURIComponent(config.defaultFromAmount));
    if (config.accentColor) params.push("accent=" + encodeURIComponent(config.accentColor.replace("#", "")));
    if (config.hideOnramp) params.push("hideOnramp=1");
    if (config.hidePoweredBy) params.push("hidePoweredBy=1");
    if (config.lockFromChain) params.push("lockFromChain=1");
    if (config.lockToChain) params.push("lockToChain=1");
    if (config.walletAddress) params.push("wallet=" + encodeURIComponent(config.walletAddress));

    params.push("embed=1");

    var url = APP_BASE + "/widget";
    if (params.length > 0) url += "?" + params.join("&");
    return url;
  }

  /**
   * Create the iframe element
   */
  function createIframe(config) {
    var iframe = document.createElement("iframe");
    iframe.src = buildUrl(config);
    iframe.id = "hypermid-widget-iframe";
    iframe.allow = "clipboard-write; payment; web-share";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation");

    // Styling
    var width = config.width || "420px";
    var height = config.height || "600px";
    var borderRadius = config.borderRadius || "16px";

    iframe.style.cssText = [
      "width:" + width,
      "height:" + height,
      "max-width:100%",
      "border:none",
      "border-radius:" + borderRadius,
      "box-shadow:0 4px 24px rgba(0,0,0,0.15)",
      "display:block",
      "margin:0 auto",
      "color-scheme:normal",
    ].join(";");

    return iframe;
  }

  /**
   * Listen for messages from the iframe (events from the app)
   */
  function setupMessageListener(config) {
    window.addEventListener("message", function (event) {
      // Only accept messages from our app
      if (event.origin !== APP_BASE) return;

      var data = event.data;
      if (!data || !data.type || data.type.indexOf("hypermid:") !== 0) return;

      var eventType = data.type.replace("hypermid:", "");

      switch (eventType) {
        case "quote":
          if (config.onQuote) config.onQuote(data.payload);
          break;
        case "execute":
          if (config.onExecute) config.onExecute(data.payload);
          break;
        case "status":
          if (config.onStatusChange) config.onStatusChange(data.payload);
          break;
        case "error":
          if (config.onError) config.onError(data.payload);
          break;
        case "resize":
          // Auto-resize iframe height if app requests it
          var iframe = document.getElementById("hypermid-widget-iframe");
          if (iframe && data.payload && data.payload.height) {
            iframe.style.height = data.payload.height + "px";
          }
          break;
        case "ready":
          if (config.onReady) config.onReady();
          break;
      }
    });
  }

  /**
   * HypermidWidget — public API
   */
  var HypermidWidget = {
    _iframe: null,
    _container: null,
    _config: null,

    /**
     * Initialize and mount the widget
     *
     * @param {Object} config
     * @param {string} config.containerId - DOM element ID to mount into
     * @param {string} [config.partnerId] - Your partner ID for fee tracking
     * @param {string} [config.theme] - "dark" | "light" (default: "dark")
     * @param {number} [config.defaultFromChain] - Default source chain ID
     * @param {number} [config.defaultToChain] - Default destination chain ID
     * @param {string} [config.defaultFromToken] - Default source token address
     * @param {string} [config.defaultToToken] - Default destination token address
     * @param {string} [config.defaultFromAmount] - Default input amount
     * @param {string} [config.accentColor] - Accent color hex (e.g. "#44E1AA")
     * @param {string} [config.width] - Widget width (default: "420px")
     * @param {string} [config.height] - Widget height (default: "600px")
     * @param {string} [config.borderRadius] - Border radius (default: "16px")
     * @param {boolean} [config.hideOnramp] - Hide "Buy with card" button
     * @param {boolean} [config.hidePoweredBy] - Hide "Powered by Hypermid"
     * @param {boolean} [config.lockFromChain] - Prevent changing source chain
     * @param {boolean} [config.lockToChain] - Prevent changing destination chain
     * @param {string} [config.walletAddress] - Pre-fill wallet address
     * @param {Function} [config.onQuote] - Called when a quote is received
     * @param {Function} [config.onExecute] - Called when a swap is executed
     * @param {Function} [config.onStatusChange] - Called on status updates
     * @param {Function} [config.onError] - Called on errors
     * @param {Function} [config.onReady] - Called when widget is loaded
     */
    init: function (config) {
      if (!config || !config.containerId) {
        console.error("[HypermidWidget] containerId is required");
        return;
      }

      var container = document.getElementById(config.containerId);
      if (!container) {
        console.error("[HypermidWidget] Element #" + config.containerId + " not found");
        return;
      }

      // Defaults
      config.theme = config.theme || "dark";

      // Store references
      this._config = config;
      this._container = container;

      // Setup event listener
      setupMessageListener(config);

      // Create and mount iframe
      this._iframe = createIframe(config);
      container.innerHTML = "";
      container.appendChild(this._iframe);

      return this;
    },

    /**
     * Update widget configuration (rebuilds iframe URL)
     */
    update: function (newConfig) {
      if (!this._iframe || !this._config) {
        console.error("[HypermidWidget] Widget not initialized. Call init() first.");
        return;
      }

      // Merge configs
      for (var key in newConfig) {
        if (newConfig.hasOwnProperty(key)) {
          this._config[key] = newConfig[key];
        }
      }

      // Update iframe src
      this._iframe.src = buildUrl(this._config);
    },

    /**
     * Remove the widget from the DOM
     */
    destroy: function () {
      if (this._container) {
        this._container.innerHTML = "";
      }
      this._iframe = null;
      this._container = null;
      this._config = null;
    },

    /**
     * Send a message to the widget iframe
     */
    postMessage: function (type, payload) {
      if (this._iframe && this._iframe.contentWindow) {
        this._iframe.contentWindow.postMessage(
          { type: "hypermid:" + type, payload: payload },
          APP_BASE
        );
      }
    },

    /**
     * Programmatically set the swap parameters
     */
    setSwap: function (params) {
      this.postMessage("setSwap", params);
    },
  };

  // Expose globally
  if (typeof window !== "undefined") {
    window.HypermidWidget = HypermidWidget;
  }

  // Auto-init if data attributes present
  document.addEventListener("DOMContentLoaded", function () {
    var autoInit = document.querySelector("[data-hypermid-widget]");
    if (autoInit) {
      HypermidWidget.init({
        containerId: autoInit.id || "hypermid-widget",
        partnerId: autoInit.getAttribute("data-partner-id") || undefined,
        theme: autoInit.getAttribute("data-theme") || "dark",
        defaultFromChain: parseInt(autoInit.getAttribute("data-from-chain")) || undefined,
        defaultToChain: parseInt(autoInit.getAttribute("data-to-chain")) || undefined,
      });
    }
  });
})();
