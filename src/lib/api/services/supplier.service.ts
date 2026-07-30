import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockPurchases, mockSuppliers } from "../mock/db";
import type { PurchaseRecord, Supplier } from "../../../types/models";

export const supplierService = {
  async list(): Promise<Supplier[]> {
    if (!USE_MOCK_API) return apiFetch<Supplier[]>(ENDPOINTS.suppliers.list);
    return mockDelay(mockSuppliers);
  },

  async purchases(): Promise<PurchaseRecord[]> {
    if (!USE_MOCK_API) return apiFetch<PurchaseRecord[]>(ENDPOINTS.suppliers.purchases);
    return mockDelay(mockPurchases);
  },
};
