# @hypermid/crosschain-widget

Embeddable cross-chain swap widget for Hypermid. Drop it into any site with an npm import or a single `<script>` tag and your users can swap across 90+ chains (EVM + Solana + Bitcoin + Sui + Near Intents) without leaving your page.

The widget mounts the **live Hypermid swap app** in a sandboxed iframe — so wallet connection, quoting, cross-chain execution, status tracking and partner attribution all come built-in and stay current automatically. Zero runtime dependencies (~2 KB gzipped).

## Install

```bash
npm install @hypermid/crosschain-widget
```

```ts
import { HypermidWidget } from "@hypermid/crosschain-widget";

const widget = new HypermidWidget({
  containerId: "swap-widget",
  apiKey: "pk_live_…",      // optional — attributes swaps to your account
  theme: "dark",
  defaultFromChain: 8453,   // Base
  defaultToChain: 369,      // PulseChain
});

widget.mount();
// widget.destroy(); // when unmounting (e.g. React useEffect cleanup)
```

### Script tag (no build step)

```html
<div id="hypermid-widget"></div>
<script src="https://unpkg.com/@hypermid/crosschain-widget"></script>
<script>
  HypermidWidget.init({
    containerId: "hypermid-widget",
    apiKey: "pk_live_…",
    theme: "dark",
  });
</script>
```

Or fully declarative (auto-init):

```html
<div id="hypermid-widget" data-hypermid-widget data-api-key="pk_live_…" data-theme="dark"></div>
<script src="https://unpkg.com/@hypermid/crosschain-widget"></script>
```

> Already using the hosted script? `https://hypermid.io/widget/v1/embed.js` is the same widget — this package is just the typed, npm-distributed version of it.

## Attribution (`apiKey`)

`apiKey` is **optional**. With a key, swaps are attributed to your partner account (fees accrue to you) — the widget sends it as `X-API-Key` on the underlying calls. Without one, the widget works exactly the same, just as organic/unattributed traffic. Use a **publishable** key (`pk_live_…`); it ships in client code by design.

## Config

| Option | Type | Default | Description |
|---|---|---|---|
| `containerId` | `string` | *required* | DOM element id to mount into |
| `apiKey` | `string` | — | Publishable key for partner attribution (optional) |
| `theme` | `"dark" \| "light"` | `"dark"` | Color theme |
| `mode` | `"swap" \| "gas" \| "fund"` | `"swap"` | Opening tab (`fund` = Buy with card) |
| `defaultFromChain` / `defaultToChain` | `number` | — | Preset chain IDs |
| `defaultFromToken` / `defaultToToken` | `string` | — | Preset token addresses |
| `defaultFromAmount` | `string` | — | Preset input amount |
| `lockFromChain` / `lockToChain` | `boolean` | `false` | Prevent the user changing a chain |
| `hideOnramp` | `boolean` | `false` | Hide the Buy-with-card tab |
| `hidePoweredBy` | `boolean` | `false` | Hide the footer (subject to agreement) |
| `width` | `string` | `"420px"` | Widget width |
| `height` | `string` | `"640px"` | **Floor** height — the widget grows to fit taller content |
| `borderRadius` | `string` | `"16px"` | Outer radius |
| `accentColor`, `secondaryColor`, `errorColor`, `bgCard`, `bgInput`, `textPrimary`, … | `string` | app theme | Hex theming overrides (with or without `#`) |
| `fontFamily` | `string` | `"Sora"` | Google-font family name |

## Events

```ts
const widget = new HypermidWidget({
  containerId: "swap-widget",
  onReady:        ()        => console.log("widget loaded"),
  onQuote:        (q)       => console.log("quote", q),
  onExecute:      (r)       => console.log("swap submitted", r),
  onStatusChange: (s)       => console.log("status", s),
  onError:        (e)       => console.error("error", e),
});
widget.mount();
```

## Methods

```ts
widget.mount();                                   // create + insert the iframe
widget.update({ theme: "light" });                // merge config + reload
widget.setSwap({ fromChain: 8453, toChain: 369 }); // change params without reload
widget.setTheme("light");                          // switch theme without reload
widget.destroy();                                  // remove iframe + listeners
```

## Notes

- **Isolation:** the widget is an iframe, so there are no CSS/JS conflicts with your page.
- **Local testing:** open your page over `http://localhost` (e.g. `npx serve .`), not `file://` — browsers block iframes on `file://`. See https://docs.hypermid.io/widget/overview#testing-locally.
- **Multiple widgets** per page are supported; each instance tracks its own iframe.

## License

MIT
