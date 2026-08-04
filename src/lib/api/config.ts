/**
 * API configuration.
 *
 * Set VITE_API_BASE_URL in `.env` to point the frontend at your backend.
 * While VITE_USE_MOCK_API is "true" (or no base URL is configured) the service
 * layer serves local mock data with the exact same shapes the API must return.
 */

const env = import.meta.env as Record<string, string | undefined>;

export const API_BASE_URL = (env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const USE_MOCK_API =
  env.VITE_USE_MOCK_API === "true" || API_BASE_URL === "";

export const API_TIMEOUT_MS = Number(env.VITE_API_TIMEOUT_MS ?? 15000);

export const AUTH_TOKEN_KEY = "rays:token";

/** Central endpoint registry — swap paths here when the backend is ready. */
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    me: "/auth/me",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  products: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
    create: "/products",
    update: (id: string) => `/products/${id}`,
    remove: (id: string) => `/products/${id}`,
    categories: "/categories",
    categoryCreate: "/categories",
    categoryUpdate: (id: string) => `/categories/${id}`,
    categoryRemove: (id: string) => `/categories/${id}`,
  },
  inventory: {
    batches: "/inventory/batches",
    movements: "/inventory/movements",
    batch: (id: string) => `/inventory/batches/${id}`,
  },
  suppliers: {
    list: "/suppliers",
    detail: (id: string) => `/suppliers/${id}`,
    purchases: "/suppliers/purchases",
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    addresses: (id: string) => `/users/${id}/addresses`,
    address: (id: string, addressId: string) => `/users/${id}/addresses/${addressId}`,
  },
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    create: "/orders",
    mine: "/orders/me",
    updateStatus: (id: string) => `/orders/${id}/status`,
  },
  tracking: {
    mine: "/tracking/me",
    detail: (id: string) => `/tracking/orders/${id}`,
  },
  prescriptions: {
    list: "/prescriptions",
    mine: "/prescriptions/me",
    upload: "/prescriptions",
    review: (id: string) => `/prescriptions/${id}/review`,
  },
  payments: {
    create: "/payments/orders",
    verify: "/payments/verify",
    status: (id: string) => `/payments/${id}/status`,
  },
  analytics: {
    stats: "/analytics/stats",
    bundle: "/analytics",
  },
  settings: {
    site: "/settings/site",
    roles: "/settings/roles",
    notifications: "/settings/notifications",
    notification: (id: string) => `/settings/notifications/${id}`,
    profile: "/settings/profile",
  },
} as const;
