import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockPurchases, mockSuppliers } from "../mock/db";
import type { ID, PurchaseRecord, Supplier } from "../../../types/models";

let suppliers: Supplier[] = [...mockSuppliers];

export const supplierService = {
  async list(): Promise<Supplier[]> {
    if (!USE_MOCK_API) return apiFetch<Supplier[]>(ENDPOINTS.suppliers.list);
    return mockDelay(suppliers);
  },

  async update(id: ID, input: Partial<Supplier>): Promise<Supplier> {
    if (!USE_MOCK_API)
      return apiFetch<Supplier>(ENDPOINTS.suppliers.detail(id), { method: "PATCH", body: input });
    suppliers = suppliers.map((s) => (s.id === id ? { ...s, ...input } : s));
    return mockDelay(suppliers.find((s) => s.id === id)!, 300);
  },

  async remove(id: ID): Promise<void> {
    if (!USE_MOCK_API) {
      await apiFetch<void>(ENDPOINTS.suppliers.detail(id), { method: "DELETE" });
      return;
    }
    suppliers = suppliers.filter((s) => s.id !== id);
    await mockDelay(null, 250);
  },

  async purchases(): Promise<PurchaseRecord[]> {
    if (!USE_MOCK_API) return apiFetch<PurchaseRecord[]>(ENDPOINTS.suppliers.purchases);
    return mockDelay(mockPurchases);
  },
};
