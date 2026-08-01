import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, DataTable, StatusBadge } from "../components/admin/AdminUI";
import { AsyncBoundary, EmptyState } from "../components/site/AsyncState";
import { productService } from "../lib/api";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => productService.categories(),
  });
  const products = useQuery({
    queryKey: ["admin", "products", "for-categories"],
    queryFn: () => productService.list(),
  });

  const counts = new Map<string, number>();
  for (const p of products.data ?? []) {
    counts.set(p.category.toLowerCase(), (counts.get(p.category.toLowerCase()) ?? 0) + 1);
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle="Catalogue taxonomy served by the API — counts update automatically as products change."
      />
      <AsyncBoundary
        isLoading={categories.isLoading}
        error={categories.error}
        data={categories.data}
        onRetry={() => categories.refetch()}
        loadingLabel="Loading categories…"
        empty={<EmptyState title="No categories yet" hint="Categories appear as soon as products are added." />}
      >
        {(list) => (
          <DataTable headers={["Category", "Slug", "Description", "Products", "Status"]}>
            {list.map((c) => {
              const count = counts.get(c.name.toLowerCase()) ?? c.productCount ?? 0;
              return (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{c.description ?? "—"}</td>
                  <td className="px-4 py-3">{count}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={count > 0 ? "active" : "empty"} tone={count > 0 ? "green" : "gray"} />
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </AsyncBoundary>
    </div>
  );
}
