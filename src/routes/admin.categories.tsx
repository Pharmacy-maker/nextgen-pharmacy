import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  DataTable,
  EditPanel,
  RowActions,
} from "../components/admin/AdminUI";
import { AsyncBoundary, EmptyState } from "../components/site/AsyncState";
import { productService } from "../lib/api";
import type { Category } from "../types/models";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();

  const [editing, setEditing] = useState<Category | null>(null);
 const [creating, setCreating] = useState(false);

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: ["admin", "categories"],
    });

    const create = useMutation({
  mutationFn: (input: {
    name: string;
    slug: string;
    description?: string;
  }) => productService.createCategory(input),

  onSuccess: () => {
    toast.success("Category created");
    setCreating(false);
    invalidate();
  },

  onError: (e: Error) => toast.error(e.message),
});

  const update = useMutation({
    mutationFn: (input: {
      id: string;
      patch: Partial<Category>;
    }) => productService.updateCategory(input.id, input.patch),

    onSuccess: () => {
      toast.success("Category updated");
      setEditing(null);
      invalidate();
    },

    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productService.removeCategory(id),

    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },

    onError: (e: Error) => toast.error(e.message),
  });

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
    counts.set(
      p.category.toLowerCase(),
      (counts.get(p.category.toLowerCase()) ?? 0) + 1
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <AdminPageHeader
  title="Categories"
  subtitle="Manage product categories"
  action={
    <button
      type="button"
      onClick={() => setCreating(true)}
      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white"
    >
      Add Category
    </button>
  }
/>

      </div>


      {editing && (
        <EditPanel
          title={`Edit category • ${editing.name}`}
          saving={update.isPending}
          value={{
            name: editing.name,
            slug: editing.slug,
            description: editing.description ?? "",
          }}
          fields={[
            { key: "name", label: "Category" },
            { key: "slug", label: "Slug" },
            { key: "description", label: "Description" },
          ]}
          onCancel={() => setEditing(null)}
          onSave={(next) =>
            update.mutate({
              id: editing.id,
              patch: next as Partial<Category>,
            })
          }
        />
      )}
      {creating && (
  <EditPanel
    title="Add Category"
    saving={create.isPending}
    value={{
      name: "",
      slug: "",
      description: "",
    }}
    fields={[
      { key: "name", label: "Category" },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description" },
    ]}
    onCancel={() => setCreating(false)}
    onSave={(next) =>
      create.mutate({
        name: String(next.name),
        slug: String(next.slug),
        description: String(next.description ?? ""),
      })
    }
  />
)}
      <AsyncBoundary
        isLoading={categories.isLoading}
        error={categories.error}
        data={categories.data}
        onRetry={() => categories.refetch()}
        loadingLabel="Loading categories…"
        empty={
          <EmptyState
            title="No categories yet"
            hint="Create your first category."
          />
        }
      >
        {(list) => (
          <DataTable
            headers={[
              "Category",
              "Slug",
              "Description",
              "Products",
              "Actions",
            ]}
          >
            {list.map((c) => {
              const count =
                counts.get(c.name.toLowerCase()) ??
                c.productCount ??
                0;

              return (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">
                    {c.name}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {c.slug}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {c.description ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {count}
                  </td>

                  <td className="px-4 py-3">
                    <RowActions
                      label={c.name}
                      disabled={
                        update.isPending ||
                        remove.isPending
                      }
                      onEdit={() => setEditing(c)}
                      onDelete={() => remove.mutate(c.id)}
                    />
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