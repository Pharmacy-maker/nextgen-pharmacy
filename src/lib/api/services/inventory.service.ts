import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockBatches, mockMovements } from "../mock/db";
import { supabase } from "../../supabase";
import type { ID, InventoryBatch, InventoryMovement } from "../../../types/models";

/** Mutable overlay so admin edits persist for the session against mock data. */
let batches: InventoryBatch[] = [...mockBatches];

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  mfg: string | null;
  exp: string | null;
  category: string | null;
  price: number | null;
}

export const inventoryService = {
  async batches() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      stock,
      mfg,
      exp
    `)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    productId: row.id,
    productName: row.name,
    batchNumber: "N/A",
    quantity: row.stock ?? 0,
    reorderLevel: 10,
    mfg: row.mfg,
    exp: row.exp,
    location: "Main Store",
  }));
},

  async updateBatch(id: ID, input: Partial<InventoryBatch>): Promise<InventoryBatch> {
  const { data, error } = await supabase
    .from("products")
    .update({
      stock: input.quantity,
      mfg: input.mfg,
      exp: input.exp,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    productId: data.id,
    productName: data.name,
    batchNumber: "N/A",
    quantity: data.stock ?? 0,
    reorderLevel: input.reorderLevel ?? 10,
    mfg: data.mfg,
    exp: data.exp,
    location: "Main Store",
  };
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
