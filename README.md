# @hypermid/crosschain-widget

Embeddable cross-chain swap widget for HyperMid. Drop into any website with a single `<script>` tag or npm import. Supports 90+ chains via LI.FI and Near Intents.

## Quick Start

### Script Tag (CDN)

```html
<div id="hypermid-widget"></div>
<script src="https://cdn.hypermid.io/widget.js"></script>
<script>
  HyperMidWidget.init({
    containerId: "hypermid-widget",
    theme: "dark",
    defaultFromChain: 1,       // Ethereum
    defaultToChain: 42161,     // Arbitrum
    accentColor: "#7B3FE4",
  });
</script>
```

### npm / ESM

```bash
npm install @hypermid/crosschain-widget
```

```typescript
import { HyperMidWidget } from "@hypermid/crosschain-widget";

const widget = new HyperMidWidget({
  containerId: "swap-widget",
  apiKey: "your-api-key",  // optional
  theme: "dark",
});

widget.mount();

// Later, to clean up:
widget.destroy();
```

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `containerId` | `string` | *required* | DOM element ID to mount the widget into |
| `apiKey` | `string` | `undefined` | API key for authenticated access (higher rate limits) |
| `baseUrl` | `string` | `https://api.hypermid.io` | API base URL override |
| `theme` | `"dark" \| "light"` | `"dark"` | Color theme |
| `defaultFromChain` | `number` | `1` (Ethereum) | Default source chain ID |
| `defaultToChain` | `number` | `42161` (Arbitrum) | Default destination chain ID |
| `defaultFromToken` | `string` | Native token | Default source token address |
| `defaultToToken` | `string` | Native token | Default destination token address |
| `accentColor` | `string` | `"#7B3FE4"` | Brand accent color (hex) |
| `width` | `string` | `"420px"` | Widget width (any CSS value) |
| `borderRadius` | `string` | `"16px"` | Widget border radius |
| `hideOnramp` | `boolean` | `false` | Hide "Buy with Card" button |
| `hidePoweredBy` | `boolean` | `false` | Hide "Powered by HyperMid" footer |

## Callbacks

```typescript
HyperMidWidget.init({
  containerId: "hypermid-widget",

  // Called when a quote is received
  onQuote: (quote) => {
    console.log("Quote:", quote);
  },

  // Called when an execution result is received
  onExecute: (result) => {
    console.log("Execute:", result);
  },

  // Called when swap status changes
  onStatusChange: (status) => {
    console.log("Status:", status);
  },

  // Called on any error
  onError: (error) => {
    console.error("Error:", error.code, error.message);
  },
});
```

## Theming

The widget ships with built-in dark and light themes. Set the `theme` option to switch:

```typescript
// Dark theme (default)
HyperMidWidget.init({ containerId: "widget", theme: "dark" });

// Light theme
HyperMidWidget.init({ containerId: "widget", theme: "light" });
```

### Custom Accent Color

Override the accent color to match your brand:

```typescript
HyperMidWidget.init({
  containerId: "widget",
  accentColor: "#FF6B00",  // your brand color
});
```

### Dark Theme Colors

- Background: `#1a1b23`
- Card: `#252633`
- Text: `#ffffff`
- Accent: configurable (default `#7B3FE4`)

### Light Theme Colors

- Background: `#f5f5f7`
- Card: `#ffffff`
- Text: `#1a1a2e`
- Accent: configurable (default `#7B3FE4`)

## Style Isolation

The widget renders inside a **Shadow DOM**, ensuring zero CSS conflicts with the host page. No styles leak in or out.

## Supported Chains

EVM chains: Ethereum, Optimism, BNB Chain, Gnosis, Polygon, X Layer, Arbitrum, Avalanche, Base, Plasma, Berachain, Monad.

Non-EVM: Solana, Bitcoin, Sui.

Near Intents: NEAR, TON, Tron, XRP, Dogecoin, Litecoin, Stellar, Cardano, Aptos, and more.

## Build

```bash
npm install
npm run build
```

Output:
- `dist/widget.js` - UMD bundle (for script tags)
- `dist/widget.esm.js` - ESM module (for bundlers)

## Development

```bash
npm run dev
```

Opens the demo page at `http://localhost:5173` with hot reload.

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). No Internet Explorer support.

## License

MIT
