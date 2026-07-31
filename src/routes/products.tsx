import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Filter, Search as SearchIcon } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { ProductCard } from "../components/site/ProductCard";
import { AsyncBoundary } from "../components/site/AsyncState";
import { productService } from "../lib/api";
import type { Product } from "../types/models";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  tag: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

/** Cards rendered per page — keeps large catalogues fast. */
const PAGE_SIZE = 12;

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

type SortKey = "popular" | "priceAsc" | "priceDesc" | "rating";

function applyFilters(
  list: Product[],
  opts: { q: string; tag: string; category: string; sort: SortKey },
): Product[] {
  let out = [...list];
  const s = opts.q.trim().toLowerCase();
  if (s)
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.manufacturer.toLowerCase().includes(s),
    );
  if (opts.tag) out = out.filter((p) => p.tags?.includes(opts.tag));
  if (opts.category) out = out.filter((p) => p.category.toLowerCase() === opts.category.toLowerCase());
  if (opts.sort === "priceAsc") out.sort((a, b) => a.price - b.price);
  if (opts.sort === "priceDesc") out.sort((a, b) => b.price - a.price);
  if (opts.sort === "rating") out.sort((a, b) => b.rating - a.rating);
  return out;
}

function ProductsPage() {
  const { q, tag, category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [localQ, setLocalQ] = useState(q);
  const [sort, setSort] = useState<SortKey>("popular");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.list(),
  });

  const filtered = useMemo(
    () => applyFilters(data ?? [], { q: localQ, tag, category, sort }),
    [data, localQ, tag, category, sort],
  );

  useEffect(() => setVisible(PAGE_SIZE), [localQ, tag, category, sort]);

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
              aria-label="Search products"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
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
                onClick={() => navigate({ search: (prev: { q: string; tag: string; category: string }) => ({ ...prev, tag: "" }), replace: true })}
                className="glass px-3 py-1 rounded-full"
              >
                Tag: {tag} ✕
              </button>
            )}
            {category && (
              <button
                onClick={() => navigate({ search: (prev: { q: string; tag: string; category: string }) => ({ ...prev, category: "" }), replace: true })}
                className="glass px-3 py-1 rounded-full"
              >
                Category: {category} ✕
              </button>
            )}
          </div>
        )}

        <AsyncBoundary
          isLoading={isLoading}
          error={error}
          data={data}
          onRetry={() => refetch()}
          loadingLabel="Loading products…"
        >
          {() =>
            filtered.length === 0 ? (
              <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
                No products match your filters. Try clearing them.
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.slice(0, visible).map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
                {visible < filtered.length && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="glass px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-white/15 transition"
                    >
                      Load more ({filtered.length - visible} left)
                    </button>
                  </div>
                )}
              </>
            )
          }
        </AsyncBoundary>
      </Section>
    </PageShell>
  );
}
