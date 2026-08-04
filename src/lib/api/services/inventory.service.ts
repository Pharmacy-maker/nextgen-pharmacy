import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockBatches, mockMovements } from "../mock/db";
import type { ID, InventoryBatch, InventoryMovement } from "../../../types/models";

/** Mutable overlay so admin edits persist for the session against mock data. */
let batches: InventoryBatch[] = [...mockBatches];

export const inventoryService = {
  async batches(): Promise<InventoryBatch[]> {
    if (!USE_MOCK_API) return apiFetch<InventoryBatch[]>(ENDPOINTS.inventory.batches);
    return mockDelay(batches);
  },

  async updateBatch(id: ID, input: Partial<InventoryBatch>): Promise<InventoryBatch> {
    if (!USE_MOCK_API)
      return apiFetch<InventoryBatch>(ENDPOINTS.inventory.batch(id), { method: "PATCH", body: input });
    batches = batches.map((b) => (b.id === id ? { ...b, ...input } : b));
    return mockDelay(batches.find((b) => b.id === id)!, 300);
  },

  async removeBatch(id: ID): Promise<void> {
    if (!USE_MOCK_API) {
      await apiFetch<void>(ENDPOINTS.inventory.batch(id), { method: "DELETE" });
      return;
    }
    batches = batches.filter((b) => b.id !== id);
    await mockDelay(null, 250);
  },

  async movements(): Promise<InventoryMovement[]> {
    if (!USE_MOCK_API) return apiFetch<InventoryMovement[]>(ENDPOINTS.inventory.movements);
    return mockDelay(mockMovements);
  },
};
