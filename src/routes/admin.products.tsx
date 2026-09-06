import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, DataTable, StatusBadge, inr } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { productService } from "../lib/api";
import type { Product } from "../types/models";
import { ProductImage } from "../components/site/ProductImage";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const EMPTY = {
  name: "", category: "", supplier: "", manufacturer: "", mfg: "", exp: "",
  stock: 0, price: 0, discount: 0, grad: "var(--grad-cool)", image: "", tags: [] as string[],
};
function validateProduct(form: typeof EMPTY) {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) {
  errors.name = "Product name is required";
} else if (!/[A-Za-z]/.test(form.name)) {
  errors.name = "Product name must contain at least one letter";
}

  
  if (!form.category.trim()) {
  errors.category = "Category is required";
} else if (!/^[A-Za-z\s]+$/.test(form.category.trim())) {
  errors.category = "Category must contain only letters";
}

  if (!form.manufacturer.trim()) {
  errors.manufacturer = "Manufacturer is required";
} else if (!/^[A-Za-z\s]+$/.test(form.manufacturer.trim())) {
  errors.manufacturer = "Manufacturer must contain only letters";
}
  
  if (!form.supplier.trim()) {
  errors.supplier = "Supplier is required";
} else if (!/^[A-Za-z\s]+$/.test(form.supplier.trim())) {
  errors.supplier = "Supplier must contain only letters";
}

  if (form.price <= 0) {
    errors.price = "Price must be greater than 0";
  }

  if (form.stock < 0) {
    errors.stock = "Stock cannot be negative";
  }

  if (form.discount < 0 || form.discount > 100) {
    errors.discount = "Discount must be between 0 and 100";
  }
  
  
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

const today = new Date();

let mfgDate: Date | null = null;
let expDate: Date | null = null;

if (!form.mfg.trim()) {

  errors.mfg = "Manufacture date is required";

} else if (!dateRegex.test(form.mfg)) {
  errors.mfg = "Use DD/MM/YYYY format";
} else {

  const [mfgDay, mfgMonth, mfgYear] = form.mfg.split("/");

  mfgDate = new Date(
  Number(mfgYear),
  Number(mfgMonth) - 1,
  Number(mfgDay)
);

  if (mfgDate > today) {

    errors.mfg = "Manufacture date cannot be in the future";

  }

}

if (!form.exp.trim()) {

  errors.exp = "Expiry date is required";

} else if (!dateRegex.test(form.exp)) {
  errors.exp = "Use DD/MM/YYYY format";
}else {

  const [expDay, expMonth, expYear] = form.exp.split("/");

  expDate = new Date(
  Number(expYear),
  Number(expMonth) - 1,
  Number(expDay)
);



  if (expDate <= today) {

    errors.exp = "Expiry date must be in the future";

  }

}

if (

  mfgDate &&

  expDate &&

  expDate <= mfgDate

) {

  errors.exp = "Expiry date must be after manufacture date";
}

return errors;
}


function AdminProducts() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["admin", "products"], queryFn: () => productService.list() });
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const save = useMutation({
    mutationFn: async () =>
      editing ? productService.update(editing.id, form) : productService.create(form),
    onSuccess: () => { toast.success(editing ? "Product updated" : "Product added"); setOpen(false); setEditing(null); setForm({ ...EMPTY }); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => { toast.success("Product deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = (p: Product) => {
  console.log("EDIT PRODUCT:", p);

  setEditing(p);
  setForm({ ...EMPTY, ...p, tags: p.tags ?? [] });
  setOpen(true);
};

  return (
    <div>
      <AdminPageHeader
        title="Product management"
        subtitle="Add, edit and remove catalog items, pricing, discounts and expiry dates."
        action={
          <button onClick={() => { setEditing(null); setForm({ ...EMPTY }); setOpen((v) => !v); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-grad-hero text-white text-sm font-semibold glow">
            <Plus className="h-4 w-4" /> Add product
          </button>
        }
      />

      {open && (
        <form
          onSubmit={(e) => {
  e.preventDefault();

  const errors = validateProduct(form);

if (Object.keys(errors).length > 0) {
  setErrors(errors);
  return;
}

setErrors({});

  save.mutate();
}}
          className="glass rounded-2xl p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <Field
  label="Name"
  value={form.name}
  onChange={(v) => {
    setForm({ ...form, name: v });

    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  }}
  error={errors.name}
  required
/>
          <Field
  label="Category"
  value={form.category}
  onChange={(v) => {
    setForm({ ...form, category: v });

    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  }}
  error={errors.category}
  required
/>
          <Field
  label="Supplier"
  value={form.supplier}
  onChange={(v) => {
    setForm({ ...form, supplier: v });

    if (errors.supplier) {
      setErrors((prev) => ({ ...prev, supplier: "" }));
    }
  }}
  error={errors.supplier}
/>
          <Field
  label="Manufacturer"
  value={form.manufacturer}
  onChange={(v) => {
    setForm({ ...form, manufacturer: v });

    if (errors.manufacturer) {
      setErrors((prev) => ({ ...prev, manufacturer: "" }));
    }
  }}
  error={errors.manufacturer}
/>
          <Field
  label="Manufacture date (DD/MM/YYYY)"
  value={form.mfg}
  onChange={(v) => {
    setForm({ ...form, mfg: v });

    if (errors.mfg) {
      setErrors((prev) => ({ ...prev, mfg: "" }));
    }
  }}
  error={errors.mfg}
/>
          <Field
  label="Expiry date (DD/MM/YYYY)"
  value={form.exp}
  onChange={(v) => {
    setForm({ ...form, exp: v });

    if (errors.exp) {
      setErrors((prev) => ({ ...prev, exp: "" }));
    }
  }}
  error={errors.exp}
/>
         <Field
  label="Price (₹)"
  type="number"
  value={String(form.price)}
  onChange={(v) => {
    setForm({ ...form, price: Number(v) });

    if (errors.price) {
      setErrors((prev) => ({ ...prev, price: "" }));
    }
  }}
  error={errors.price}
/>
          <Field
  label="Discount (%)"
  type="number"
  min="0"
  max="100"
  value={String(form.discount)}
  onChange={(v) => {
    setForm({ ...form, discount: Number(v) });

    if (errors.discount) {
      setErrors((prev) => ({ ...prev, discount: "" }));
    }
  }}
  error={errors.discount}
/>
          <Field label="Stock" type="number" value={String(form.stock)} onChange={(v) => setForm({ ...form, stock: Number(v) })} />
          <Field label="Image URL" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
          <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
            <button type="submit" disabled={save.isPending || !form.name} className="rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold disabled:opacity-60">
              {save.isPending ? "Saving…" : editing ? "Update product" : "Create product"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="rounded-xl px-5 py-2.5 glass text-sm">Cancel</button>
          </div>
        </form>
      )}

      <AsyncBoundary isLoading={isLoading} error={error} data={data} onRetry={() => refetch()}>
        {(list) => (
          <DataTable headers={["Product", "Category", "Price", "Discount", "Stock", "Mfg", "Exp", "Actions"]}>
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage src={p.image} seed={p.id} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3 tabular-nums">{inr(p.price)}</td>
                <td className="px-4 py-3">{p.discount}%</td>
                <td className="px-4 py-3">
                  <StatusBadge label={p.stock === 0 ? "out of stock" : p.stock <= 60 ? "low" : String(p.stock)} tone={p.stock === 0 ? "red" : p.stock <= 60 ? "amber" : "green"} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.mfg}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.exp}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`} className="p-2 rounded-lg glass hover:bg-white/15"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove.mutate(p.id)} aria-label={`Delete ${p.name}`} className="p-2 rounded-lg glass hover:bg-white/15"><Trash2 className="h-4 w-4 text-pink" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  error,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>

      <input
        type={type}
        value={value}
        required={required}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 ${
          error
            ? "border border-red-500 bg-red-500/5"
            : "bg-white/5 border border-white/10"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </label>
  );
}