import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, DataTable, StatusBadge } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { inventoryService } from "../lib/api";

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

function AdminInventory() {
  const batches = useQuery({ queryKey: ["admin", "batches"], queryFn: () => inventoryService.batches() });
  const movements = useQuery({ queryKey: ["admin", "movements"], queryFn: () => inventoryService.movements() });

  return (
    <div>
      <AdminPageHeader title="Inventory management" subtitle="Stock levels, batch numbers, reorder levels and expiry tracking." />
      <AsyncBoundary isLoading={batches.isLoading} error={batches.error} data={batches.data} onRetry={() => batches.refetch()}>
        {(list) => (
          <DataTable headers={["Product", "Batch", "Quantity", "Reorder level", "Mfg", "Expiry", "Location", "Status"]}>
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
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>

      <h2 className="font-semibold mt-8 mb-3">Inventory history</h2>
      <AsyncBoundary isLoading={movements.isLoading} error={movements.error} data={movements.data} onRetry={() => movements.refetch()}>
        {(list) => (
          <DataTable headers={["Date", "Product", "Batch", "Type", "Quantity", "Note"]}>
            {list.map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-muted-foreground">{m.createdAt}</td>
                <td className="px-4 py-3 font-medium">{m.productName}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.batchNumber}</td>
                <td className="px-4 py-3"><StatusBadge label={m.type} tone={m.type === "in" ? "green" : m.type === "expired" ? "red" : "blue"} /></td>
                <td className="px-4 py-3 tabular-nums">{m.quantity}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.note}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>
    </div>
  );
}
