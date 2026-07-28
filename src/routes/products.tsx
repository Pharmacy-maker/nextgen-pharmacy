import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Filter, Search as SearchIcon } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { ProductCard } from "../components/site/ProductCard";
import { products } from "../lib/products";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  tag: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(searchSchema),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Products — Rays Pharmacy" },
      { name: "description", content: "Browse and search medicines, wellness and healthcare products." },
      { property: "og:title", content: "Products — Rays Pharmacy" },
      { property: "og:description", content: "Browse and search our full catalogue of medicines and wellness products." },
    ],
  }),
});

function ProductsPage() {
  const { q, tag, category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [localQ, setLocalQ] = useState(q);
  const [sort, setSort] = useState<"popular" | "priceAsc" | "priceDesc" | "rating">("popular");

  const filtered = useMemo(() => {
    let list = [...products];
    const s = localQ.trim().toLowerCase();
    if (s)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.manufacturer.toLowerCase().includes(s),
      );
    if (tag) list = list.filter((p) => p.tags?.includes(tag));
    if (category) list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [localQ, tag, category, sort]);

  return (
    <PageShell>
      <Section
        eyebrow="Catalogue"
        title="All | Products |"
        subtitle="Search, filter, and discover the right medicines and wellness products for you."
      >
        <div className="glass rounded-3xl p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={localQ}
              onChange={(e) => {
                setLocalQ(e.target.value);
                navigate({ search: (prev: { q: string; tag: string; category: string }) => ({ ...prev, q: e.target.value }), replace: true });
              }}
              placeholder="Search medicines, brands, categories…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              <option value="popular">Most popular</option>
              <option value="priceAsc">Price: Low → High</option>
              <option value="priceDesc">Price: High → Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>
        {(tag || category) && (
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {tag && (
              <button
                onClick={() => navigate({ search: (p: { q: string; tag: string; category: string }) => ({ ...p, tag: "" }) })}
                className="glass px-3 py-1 rounded-full"
              >
                Tag: {tag} ✕
              </button>
            )}
            {category && (
              <button
                onClick={() => navigate({ search: (p: { q: string; tag: string; category: string }) => ({ ...p, category: "" }) })}
                className="glass px-3 py-1 rounded-full"
              >
                Category: {category} ✕
              </button>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
            No products match your filters. Try clearing them.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  );
}
