import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockBatches, mockMovements } from "../mock/db";
import type { InventoryBatch, InventoryMovement } from "../../../types/models";

export const inventoryService = {
  async batches(): Promise<InventoryBatch[]> {
    if (!USE_MOCK_API) return apiFetch<InventoryBatch[]>(ENDPOINTS.inventory.batches);
    return mockDelay(mockBatches);
  },

  async movements(): Promise<InventoryMovement[]> {
    if (!USE_MOCK_API) return apiFetch<InventoryMovement[]>(ENDPOINTS.inventory.movements);
    return mockDelay(mockMovements);
  },
};
