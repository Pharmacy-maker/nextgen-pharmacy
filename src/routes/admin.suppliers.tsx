import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, DataTable, StatusBadge, inr } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { supplierService } from "../lib/api";

export const Route = createFileRoute("/admin/suppliers")({ component: AdminSuppliers });

function AdminSuppliers() {
  const suppliers = useQuery({ queryKey: ["admin", "suppliers"], queryFn: () => supplierService.list() });
  const purchases = useQuery({ queryKey: ["admin", "purchases"], queryFn: () => supplierService.purchases() });

  return (
    <div>
      <AdminPageHeader title="Supplier management" subtitle="Supplier details, contacts, purchase records and supply status." />
      <AsyncBoundary isLoading={suppliers.isLoading} error={suppliers.error} data={suppliers.data} onRetry={() => suppliers.refetch()}>
        {(list) => (
          <DataTable headers={["Supplier", "Contact person", "Email", "Phone", "Address", "Products", "Status"]}>
            {list.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.contactPerson}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.address}</td>
                <td className="px-4 py-3 tabular-nums">{s.productsSupplied}</td>
                <td className="px-4 py-3"><StatusBadge label={s.status} tone={s.status === "active" ? "green" : s.status === "pending" ? "amber" : "red"} /></td>
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
