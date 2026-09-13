import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, DataTable, EditPanel, RowActions, StatusBadge } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { inventoryService } from "../lib/api";
import type { InventoryBatch } from "../types/models";

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

function AdminInventory() {
  const qc = useQueryClient();
  const batches = useQuery({
  queryKey: ["admin", "batches"],
  queryFn: async () => {
    const data = await inventoryService.batches();
    console.log("BATCHES DATA:", data);
    return data;
  }
});
  const [editing, setEditing] = useState<InventoryBatch | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "batches"] });

  const update = useMutation({
    mutationFn: (input: { id: string; patch: Partial<InventoryBatch> }) =>
      inventoryService.updateBatch(input.id, input.patch),
    onSuccess: () => { toast.success("Batch updated"); setEditing(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.removeBatch(id),
    onSuccess: () => { toast.success("Batch deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  

  return (
    <div>
      <AdminPageHeader title="Inventory management" subtitle="Stock levels, batch numbers, reorder levels and expiry tracking." />
      {editing && (
        <EditPanel
          title={`Edit batch • ${editing.productName}`}
          saving={update.isPending}
          value={{
  batchNumber: editing.batchNumber,
  quantity: editing.quantity,
  mfg: editing.mfg,
  exp: editing.exp,
  location: editing.location ?? "",
}}
          fields={[
  { key: "batchNumber", label: "Batch number" },
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "mfg", label: "Mfg date", type: "date" },
  { key: "exp", label: "Expiry date", type: "date" },
  { key: "location", label: "Location" },
]}
          onCancel={() => setEditing(null)}
          onSave={(next) =>
  update.mutate({
    id: editing.id,
    patch: {
      ...(next as Partial<InventoryBatch>),
      reorderLevel: 10,
    },
  })
}
        />
      )}
      <AsyncBoundary isLoading={batches.isLoading} error={batches.error} data={batches.data} onRetry={() => batches.refetch()}>
        {(list) => (
          <DataTable headers={["Product", "Batch", "Quantity", "Reorder level", "Mfg", "Expiry", "Location", "Status", "Actions"]}>
            {list.map((b) => (
              <tr key={b.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{b.productName}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.batchNumber}</td>
                <td className="px-4 py-3 tabular-nums">{b.quantity}</td>
                <td className="px-4 py-3 tabular-nums">{b.reorderLevel}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.mfg}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.exp}</td>
                <td className="px-4 py-3">{b.location}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={b.quantity === 0 ? "out of stock" : b.quantity <= b.reorderLevel ? "reorder" : "healthy"} tone={b.quantity === 0 ? "red" : b.quantity <= b.reorderLevel ? "amber" : "green"} />
                </td>
                <td className="px-4 py-3">
                  <RowActions
                  label={`batch ${b.batchNumber}`}
                  onEdit={() => setEditing(b)}
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>
    
    </div>
  );
}
