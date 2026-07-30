import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockAnalytics, mockOrders, mockPrescriptions, mockUsers } from "../mock/db";
import { products } from "../../products";
import type { AdminStats, AnalyticsBundle } from "../../../types/models";

export const analyticsService = {
  async stats(): Promise<AdminStats> {
    if (!USE_MOCK_API) return apiFetch<AdminStats>(ENDPOINTS.analytics.stats);
    const stats: AdminStats = {
      totalRevenue: mockOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((s, o) => s + o.total, 0),
      totalOrders: mockOrders.length,
      activeUsers: mockUsers.filter((u) => u.status === "active" && u.role === "user").length,
      totalProducts: products.length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 60).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      pendingPrescriptions: mockPrescriptions.filter((p) => p.status === "pending").length,
      pendingDeliveries: mockOrders.filter((o) => o.status === "pending" || o.status === "shipped").length,
    };
    return mockDelay(stats);
  },

  async bundle(): Promise<AnalyticsBundle> {
    if (!USE_MOCK_API) return apiFetch<AnalyticsBundle>(ENDPOINTS.analytics.bundle);
    return mockDelay(mockAnalytics);
  },
};
