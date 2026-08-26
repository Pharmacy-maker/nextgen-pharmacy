import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockBatches, mockMovements } from "../mock/db";
import { supabase } from "../../supabase";
import type { ID, InventoryBatch, InventoryMovement } from "../../../types/models";

/** Mutable overlay so admin edits persist for the session against mock data. */
let batches: InventoryBatch[] = [...mockBatches];

export const inventoryService = {
  async batches() {
  const { data, error } = await supabase
  .from("inventory_batches")
  .select(`
    *,
    products(*)
  `);

  

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
  id: row.id,
  productId: row.product_id,
  productName: row.products?.name ?? "",
  batchNumber: row.batch_number,
  quantity: row.quantity,
  reorderLevel: row.reorder_level,
  mfg: row.mfg,
  exp: row.exp,
  location: row.location,
}));
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
  const { data, error } = await supabase
    .from("inventory_movements")
    .select(`
      *,
      products(name)
    `)
    .order("created_at", { ascending: false });

  console.log("MOVEMENTS DATA", data);
  console.log("MOVEMENTS ERROR", error);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? "",
    batchNumber: row.batch_number,
    type: row.type,
    quantity: row.quantity,
    note: row.note,
    createdAt: row.created_at,
  }));
},
};
