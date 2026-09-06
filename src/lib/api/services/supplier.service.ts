import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockPurchases, mockSuppliers } from "../mock/db";
import { supabase } from "../../supabase";
import type { ID, PurchaseRecord, Supplier } from "../../../types/models";

let suppliers: Supplier[] = [...mockSuppliers];

export const supplierService = {
  
  async list(): Promise<Supplier[]> {
  if (!USE_MOCK_API) {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*");

    console.log("SUPPLIERS:", data?.length);
console.log("SUPPLIER ERROR:", error);
console.log("FIRST SUPPLIER:", data?.[0]);

    if (error) throw error;

    return data ?? [];
  }

  return mockDelay(suppliers);
},

  async update(
  id: ID,
  input: Partial<Supplier>
): Promise<Supplier> {
  if (!USE_MOCK_API) {
    const { data, error } = await supabase
      .from("suppliers")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    console.log("SUPPLIER UPDATE", {
      id,
      input,
      data,
      error,
    });

    if (error) throw error;

    return data;
  }

  suppliers = suppliers.map((s) =>
    s.id === id ? { ...s, ...input } : s
  );

  return mockDelay(
    suppliers.find((s) => s.id === id)!,
    300
  );
},

  async remove(id: ID): Promise<void> {
    if (!USE_MOCK_API) {
     const { error } = await supabase
  .from("suppliers")
  .delete()
  .eq("id", id);

if (error) throw error;
      return;
    }
    suppliers = suppliers.filter((s) => s.id !== id);
    await mockDelay(null, 250);
  },

  async purchases(): Promise<PurchaseRecord[]> {
  return [];
},
};
