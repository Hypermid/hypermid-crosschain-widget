import type { QuoteResponse, ExecuteResponse, StatusResponse, Token, Chain, HypermidError } from "./types";

const DEFAULT_BASE_URL = "https://api.hypermid.io";
const DEFAULT_TIMEOUT = 30_000;

interface ApiResponse<T = unknown> {
  data: T | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
  meta: { requestId: string; timestamp: number };
}

/**
 * Lightweight Hypermid API wrapper for the widget.
 * Avoids importing the full SDK to keep bundle size minimal.
 */
export class WidgetApi {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;

  constructor(options?: { apiKey?: string; baseUrl?: string; timeout?: number }) {
    this.baseUrl = (options?.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.apiKey = options?.apiKey;
    this.timeout = options?.timeout || DEFAULT_TIMEOUT;
  }

  // ─── Internal ──────────────────────────────────────────────────────

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    options?: { params?: Record<string, string | number | undefined>; body?: Record<string, unknown> },
  ): Promise<T> {
    let url = `${this.baseUrl}/v1${path}`;

    if (options?.params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(options.params)) {
        if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
      }
      const qsStr = qs.toString();
      if (qsStr) url += `?${qsStr}`;
    }

    const headers: Record<string, string> = {};
    if (this.apiKey) headers["X-API-Key"] = this.apiKey;
    if (method === "POST") headers["Content-Type"] = "application/json";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const json: ApiResponse<T> = await res.json();

      if (json.error) {
        const err: HypermidError = {
          code: json.error.code,
          message: json.error.message,
          status: res.status,
          details: json.error.details,
        };
        throw err;
      }

      return json.data as T;
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && "message" in err) {
        throw err; // Re-throw API errors
      }
      if (err instanceof DOMException && err.name === "AbortError") {
        throw { code: "TIMEOUT", message: `Request timed out after ${this.timeout}ms` } as HypermidError;
      }
      throw {
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network request failed",
      } as HypermidError;
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── Public API ────────────────────────────────────────────────────

  async getChains(): Promise<{ chains: Chain[] }> {
    return this.request("GET", "/chains");
  }

  async getTokens(params?: { chains?: string }): Promise<{ tokens: Record<string, Token[]> }> {
    return this.request("GET", "/tokens", { params });
  }

  async getQuote(params: {
    fromChain: string | number;
    fromToken: string;
    fromAmount: string;
    toChain: string | number;
    toToken: string;
    fromAddress: string;
    slippage?: number | string;
    order?: string;
  }): Promise<QuoteResponse> {
    return this.request("GET", "/quote", {
      params: {
        fromChain: String(params.fromChain),
        fromToken: params.fromToken,
        fromAmount: params.fromAmount,
        toChain: String(params.toChain),
        toToken: params.toToken,
        fromAddress: params.fromAddress,
        slippage: params.slippage !== undefined ? String(params.slippage) : undefined,
        order: params.order,
      },
    });
  }

  async execute(params: {
    fromChain: string | number;
    fromToken: string;
    fromAmount: string;
    toChain: string | number;
    toToken: string;
    fromAddress: string;
    toAddress: string;
    slippage?: number | string;
    order?: string;
  }): Promise<ExecuteResponse> {
    return this.request("POST", "/execute", {
      body: {
        fromChain: String(params.fromChain),
        fromToken: params.fromToken,
        fromAmount: params.fromAmount,
        toChain: String(params.toChain),
        toToken: params.toToken,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        ...(params.slippage !== undefined ? { slippage: params.slippage } : {}),
        ...(params.order ? { order: params.order } : {}),
      },
    });
  }

  async getStatus(params: {
    txHash?: string;
    fromChain?: string | number;
    toChain?: string | number;
    provider?: string;
    correlationId?: string;
  }): Promise<StatusResponse> {
    return this.request("GET", "/status", {
      params: {
        txHash: params.txHash,
        fromChain: params.fromChain !== undefined ? String(params.fromChain) : undefined,
        toChain: params.toChain !== undefined ? String(params.toChain) : undefined,
        provider: params.provider,
        correlationId: params.correlationId,
      },
    });
  }

  async ping(): Promise<{ status: string; version: string }> {
    return this.request("GET", "/ping");
  }
}
