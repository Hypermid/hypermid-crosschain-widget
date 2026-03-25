/**
 * All widget CSS as template literal strings.
 * Injected into the Shadow DOM for complete style isolation.
 */

export interface ThemeVars {
  bg: string;
  card: string;
  cardHover: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBg: string;
  accent: string;
  accentHover: string;
  accentText: string;
  error: string;
  success: string;
  shadow: string;
}

export const DARK_THEME: ThemeVars = {
  bg: "#1a1b23",
  card: "#252633",
  cardHover: "#2e2f40",
  text: "#ffffff",
  textSecondary: "#a1a1b5",
  textMuted: "#6b6b80",
  border: "#33344a",
  inputBg: "#1e1f2e",
  accent: "#7B3FE4",
  accentHover: "#8f56ef",
  accentText: "#ffffff",
  error: "#ef4444",
  success: "#22c55e",
  shadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
};

export const LIGHT_THEME: ThemeVars = {
  bg: "#f5f5f7",
  card: "#ffffff",
  cardHover: "#f0f0f4",
  text: "#1a1a2e",
  textSecondary: "#64648c",
  textMuted: "#9e9eb8",
  border: "#e0e0ea",
  inputBg: "#f5f5f9",
  accent: "#7B3FE4",
  accentHover: "#6a30d1",
  accentText: "#ffffff",
  error: "#dc2626",
  success: "#16a34a",
  shadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
};

export function buildCss(theme: ThemeVars, borderRadius: string): string {
  return `
    :host {
      all: initial;
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: ${theme.text};
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .hm-widget {
      background: ${theme.bg};
      border-radius: ${borderRadius};
      overflow: hidden;
      box-shadow: ${theme.shadow};
      border: 1px solid ${theme.border};
    }

    /* ─── Header ────────────────────────────────────────────────── */

    .hm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
    }

    .hm-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: ${theme.text};
    }

    .hm-header-icon {
      font-size: 18px;
      color: ${theme.accent};
    }

    /* ─── Token Section ─────────────────────────────────────────── */

    .hm-section {
      padding: 0 16px;
      margin-bottom: 4px;
    }

    .hm-section-label {
      font-size: 12px;
      font-weight: 500;
      color: ${theme.textSecondary};
      margin-bottom: 8px;
      padding-left: 4px;
    }

    .hm-card {
      background: ${theme.card};
      border-radius: calc(${borderRadius} - 4px);
      border: 1px solid ${theme.border};
      padding: 14px 16px;
      transition: border-color 0.2s ease;
    }

    .hm-card:focus-within {
      border-color: ${theme.accent};
    }

    .hm-selectors {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }

    .hm-select-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: ${theme.inputBg};
      border: 1px solid ${theme.border};
      border-radius: 10px;
      color: ${theme.text};
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
      white-space: nowrap;
    }

    .hm-select-btn:hover {
      background: ${theme.cardHover};
      border-color: ${theme.accent};
    }

    .hm-select-btn .hm-chain-icon {
      font-size: 15px;
      width: 20px;
      text-align: center;
    }

    .hm-select-btn .hm-arrow {
      font-size: 10px;
      color: ${theme.textMuted};
      margin-left: 2px;
    }

    .hm-amount-input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: ${theme.text};
      font-size: 24px;
      font-weight: 600;
      font-family: inherit;
      padding: 0;
    }

    .hm-amount-input::placeholder {
      color: ${theme.textMuted};
    }

    .hm-amount-usd {
      font-size: 12px;
      color: ${theme.textMuted};
      margin-top: 4px;
    }

    .hm-estimated-amount {
      font-size: 24px;
      font-weight: 600;
      color: ${theme.text};
      opacity: 0.85;
    }

    /* ─── Swap Direction Button ──────────────────────────────────── */

    .hm-swap-direction {
      display: flex;
      justify-content: center;
      padding: 2px 0;
      position: relative;
      z-index: 1;
    }

    .hm-swap-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: ${theme.card};
      border: 2px solid ${theme.border};
      color: ${theme.textSecondary};
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .hm-swap-btn:hover {
      background: ${theme.accent};
      border-color: ${theme.accent};
      color: ${theme.accentText};
      transform: rotate(180deg);
    }

    /* ─── Quote Info ─────────────────────────────────────────────── */

    .hm-quote-info {
      padding: 8px 20px;
      font-size: 12px;
      color: ${theme.textSecondary};
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
    }

    .hm-quote-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .hm-quote-item-label {
      color: ${theme.textMuted};
    }

    /* ─── Buttons ───────────────────────────────────────────────── */

    .hm-actions {
      padding: 12px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .hm-btn {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .hm-btn-primary {
      background: ${theme.accent};
      color: ${theme.accentText};
    }

    .hm-btn-primary:hover:not(:disabled) {
      background: ${theme.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px ${theme.accent}40;
    }

    .hm-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .hm-btn-secondary {
      background: ${theme.card};
      color: ${theme.textSecondary};
      border: 1px solid ${theme.border};
    }

    .hm-btn-secondary:hover {
      background: ${theme.cardHover};
      color: ${theme.text};
    }

    /* ─── Footer ────────────────────────────────────────────────── */

    .hm-footer {
      text-align: center;
      padding: 8px 16px 12px;
      font-size: 11px;
      color: ${theme.textMuted};
    }

    .hm-footer a {
      color: ${theme.textSecondary};
      text-decoration: none;
    }

    .hm-footer a:hover {
      color: ${theme.accent};
    }

    /* ─── Error ──────────────────────────────────────────────────── */

    .hm-error {
      padding: 8px 20px;
      color: ${theme.error};
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ─── Loading Spinner ────────────────────────────────────────── */

    .hm-spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid ${theme.accentText};
      border-right-color: transparent;
      border-radius: 50%;
      animation: hm-spin 0.6s linear infinite;
    }

    @keyframes hm-spin {
      to { transform: rotate(360deg); }
    }

    /* ─── Selector Panel (Chain / Token picker) ──────────────────── */

    .hm-panel {
      padding: 16px;
    }

    .hm-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .hm-panel-title {
      font-size: 15px;
      font-weight: 600;
      color: ${theme.text};
    }

    .hm-panel-close {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: ${theme.inputBg};
      border: 1px solid ${theme.border};
      color: ${theme.textSecondary};
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .hm-panel-close:hover {
      background: ${theme.cardHover};
      color: ${theme.text};
    }

    .hm-search-input {
      width: 100%;
      padding: 10px 12px;
      background: ${theme.inputBg};
      border: 1px solid ${theme.border};
      border-radius: 10px;
      color: ${theme.text};
      font-size: 13px;
      outline: none;
      margin-bottom: 12px;
      font-family: inherit;
      transition: border-color 0.2s ease;
    }

    .hm-search-input:focus {
      border-color: ${theme.accent};
    }

    .hm-search-input::placeholder {
      color: ${theme.textMuted};
    }

    .hm-option-list {
      max-height: 280px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hm-option-list::-webkit-scrollbar {
      width: 4px;
    }

    .hm-option-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .hm-option-list::-webkit-scrollbar-thumb {
      background: ${theme.border};
      border-radius: 4px;
    }

    .hm-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s ease;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-family: inherit;
      color: ${theme.text};
    }

    .hm-option:hover {
      background: ${theme.cardHover};
    }

    .hm-option-icon {
      font-size: 18px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${theme.inputBg};
      border-radius: 8px;
      flex-shrink: 0;
    }

    .hm-option-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .hm-option-name {
      font-size: 13px;
      font-weight: 500;
      color: ${theme.text};
    }

    .hm-option-detail {
      font-size: 11px;
      color: ${theme.textMuted};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .hm-option.selected {
      background: ${theme.accent}15;
      border: 1px solid ${theme.accent}30;
    }

    /* ─── Responsive ─────────────────────────────────────────────── */

    @media (max-width: 380px) {
      .hm-amount-input, .hm-estimated-amount {
        font-size: 20px;
      }

      .hm-selectors {
        flex-wrap: wrap;
      }
    }
  `;
}
