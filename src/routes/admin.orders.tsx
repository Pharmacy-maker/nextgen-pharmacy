import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, DataTable, StatusBadge, inr } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { orderService } from "../lib/api";
import type { OrderStatus } from "../types/models";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

function AdminOrders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: () => orderService.list(filter === "all" ? {} : { status: filter }),
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderService.updateStatus(id, status),
    onSuccess: () => { toast.success("Order status updated"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader title="Orders management" subtitle="Track pending, confirmed, cancelled and delivered orders with payment status." />
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-sm ${filter === f.value ? "bg-grad-hero text-white font-semibold" : "glass hover:bg-white/15"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <AsyncBoundary isLoading={isLoading} error={error} data={data} onRetry={() => refetch()}>
        {(list) => (
          <DataTable headers={["Order", "Customer", "Items", "Total", "Payment", "Status", "Placed", "Update"]}>
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{o.reference}</td>
                <td className="px-4 py-3">
                  <div>{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                </td>
                <td className="px-4 py-3 tabular-nums">{o.items.length}</td>
                <td className="px-4 py-3 tabular-nums">{inr(o.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={o.paymentStatus} tone={o.paymentStatus === "paid" ? "green" : o.paymentStatus === "refunded" ? "blue" : "amber"} />
                  <div className="text-[11px] text-muted-foreground mt-1 uppercase">{o.paymentMethod}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge label={o.status} tone={o.status === "delivered" ? "green" : o.status === "cancelled" ? "red" : "amber"} /></td>
                <td className="px-4 py-3 text-muted-foreground">{o.placedAt}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Update status for ${o.reference}`}
                    value={o.status}
                    onChange={(e) => update.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
                  >
                    {FILTERS.filter((f) => f.value !== "all").map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>
    </div>
  );
}
