import { API_BASE_URL, API_TIMEOUT_MS, AUTH_TOKEN_KEY } from "./config";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 0, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    else window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/** Thin fetch wrapper: auth header, JSON encoding, timeouts, typed errors. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, headers } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort());

  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const res = await fetch(buildUrl(path, query), {
      method,
      signal: controller.signal,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });

    const text = await res.text();
    const payload = text ? safeJson(text) : null;

    if (!res.ok) {
      const message =
        (payload as { message?: string } | null)?.message ?? `Request failed (${res.status})`;
      throw new ApiError(message, res.status, payload);
    }
    // Supports both bare payloads and { data: ... } envelopes.
    if (payload && typeof payload === "object" && "data" in (payload as object)) {
      return (payload as { data: T }).data;
    }
    return payload as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error)?.name === "AbortError") throw new ApiError("Request timed out", 408);
    throw new ApiError((err as Error)?.message ?? "Network error", 0);
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Simulated latency for mock responses so loading states are exercised. */
export function mockDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredCloneSafe(value)), ms));
}

function structuredCloneSafe<T>(value: T): T {
  try {
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}
