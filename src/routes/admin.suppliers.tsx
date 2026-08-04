import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, DataTable, EditPanel, RowActions, StatusBadge, inr } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { supplierService } from "../lib/api";
import type { Supplier } from "../types/models";

export const Route = createFileRoute("/admin/suppliers")({ component: AdminSuppliers });

function AdminSuppliers() {
  const qc = useQueryClient();
  const suppliers = useQuery({ queryKey: ["admin", "suppliers"], queryFn: () => supplierService.list() });
  const [editing, setEditing] = useState<Supplier | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "suppliers"] });

  const update = useMutation({
    mutationFn: (input: { id: string; patch: Partial<Supplier> }) => supplierService.update(input.id, input.patch),
    onSuccess: () => { toast.success("Supplier updated"); setEditing(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => { toast.success("Supplier deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const purchases = useQuery({ queryKey: ["admin", "purchases"], queryFn: () => supplierService.purchases() });

  return (
    <div>
      <AdminPageHeader title="Supplier management" subtitle="Supplier details, contacts, purchase records and supply status." />
      {editing && (
        <EditPanel
          title={`Edit supplier • ${editing.name}`}
          saving={update.isPending}
          value={{
            name: editing.name,
            contactPerson: editing.contactPerson,
            email: editing.email,
            phone: editing.phone,
            address: editing.address,
            status: editing.status,
          }}
          fields={[
            { key: "name", label: "Supplier" },
            { key: "contactPerson", label: "Contact person" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "address", label: "Address" },
            { key: "status", label: "Status", type: "select", options: [
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "inactive", label: "Inactive" },
            ] },
          ]}
          onCancel={() => setEditing(null)}
          onSave={(next) => update.mutate({ id: editing.id, patch: next as unknown as Partial<Supplier> })}
        />
      )}
      <AsyncBoundary isLoading={suppliers.isLoading} error={suppliers.error} data={suppliers.data} onRetry={() => suppliers.refetch()}>
        {(list) => (
          <DataTable headers={["Supplier", "Contact person", "Email", "Phone", "Address", "Products", "Status", "Actions"]}>
            {list.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.contactPerson}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.address}</td>
                <td className="px-4 py-3 tabular-nums">{s.productsSupplied}</td>
                <td className="px-4 py-3"><StatusBadge label={s.status} tone={s.status === "active" ? "green" : s.status === "pending" ? "amber" : "red"} /></td>
                <td className="px-4 py-3">
                  <RowActions
                    label={s.name}
                    disabled={remove.isPending}
                    onEdit={() => setEditing(s)}
                    onDelete={() => remove.mutate(s.id)}
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>

      <h2 className="font-semibold mt-8 mb-3">Purchase records</h2>
      <AsyncBoundary isLoading={purchases.isLoading} error={purchases.error} data={purchases.data} onRetry={() => purchases.refetch()}>
        {(list) => (
          <DataTable headers={["Reference", "Supplier", "Items", "Amount", "Status", "Date"]}>
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{p.reference}</td>
                <td className="px-4 py-3">{p.supplierName}</td>
                <td className="px-4 py-3 tabular-nums">{p.items}</td>
                <td className="px-4 py-3 tabular-nums">{inr(p.amount)}</td>
                <td className="px-4 py-3"><StatusBadge label={p.status} tone={p.status === "received" ? "green" : p.status === "cancelled" ? "red" : "amber"} /></td>
                <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>
    </div>
  );
}
