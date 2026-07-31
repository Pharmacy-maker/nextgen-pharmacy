import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, ArrowRight, Baby, Dog, Droplet, Flower2, HeartPulse, Leaf, Pill, Shield, Smile, Sun, Zap,
  type LucideIcon,
} from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { AsyncBoundary } from "../components/site/AsyncState";
import { productService } from "../lib/api";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Categories — Rays Pharmacy" },
      { name: "description", content: "Explore medicine categories: cardiac, diabetes, immunity, skin care and more." },
      { property: "og:title", content: "Categories — Rays Pharmacy" },
      { property: "og:description", content: "Shop by category — from daily essentials to specialised care." },
    ],
  }),
});

/** Presentation-only styling per category name. Unknown names fall back safely,
 *  so new categories coming from the backend render without code changes. */
const STYLES: Record<string, { icon: LucideIcon; from: string; to: string }> = {
  diabetes: { icon: Droplet, from: "var(--cyan)", to: "var(--electric)" },
  cardiac: { icon: HeartPulse, from: "var(--pink)", to: "var(--purple)" },
  stomach: { icon: Activity, from: "var(--orange)", to: "var(--pink)" },
  "cancer care": { icon: Shield, from: "var(--purple)", to: "var(--electric)" },
  "pain relief": { icon: Zap, from: "var(--orange)", to: "var(--neon)" },
  kidney: { icon: Droplet, from: "var(--emerald)", to: "var(--cyan)" },
  dental: { icon: Smile, from: "var(--cyan)", to: "var(--emerald)" },
  "sexual wellness": { icon: Flower2, from: "var(--pink)", to: "var(--orange)" },
  "women care": { icon: Flower2, from: "var(--purple)", to: "var(--pink)" },
  "baby care": { icon: Baby, from: "var(--cyan)", to: "var(--purple)" },
  "pet care": { icon: Dog, from: "var(--orange)", to: "var(--emerald)" },
  energy: { icon: Zap, from: "var(--neon)", to: "var(--orange)" },
  immunity: { icon: Shield, from: "var(--emerald)", to: "var(--neon)" },
  "skin care": { icon: Sun, from: "var(--pink)", to: "var(--orange)" },
  vitamins: { icon: Leaf, from: "var(--emerald)", to: "var(--cyan)" },
  wellness: { icon: Leaf, from: "var(--neon)", to: "var(--emerald)" },
  allergy: { icon: Flower2, from: "var(--cyan)", to: "var(--pink)" },
};

const FALLBACK_PALETTE = [
  { from: "var(--electric)", to: "var(--cyan)" },
  { from: "var(--purple)", to: "var(--pink)" },
  { from: "var(--emerald)", to: "var(--neon)" },
  { from: "var(--orange)", to: "var(--pink)" },
];

function styleFor(name: string, index: number) {
  const known = STYLES[name.toLowerCase()];
  if (known) return known;
  const palette = FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
  return { icon: Pill, ...palette };
}

function CategoriesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.categories(),
  });

  return (
    <PageShell>
      <Section
        eyebrow="Shop by need"
        title="All | Categories |"
        subtitle="From daily essentials to specialised care — beautifully organised."
      >
        <AsyncBoundary
          isLoading={isLoading}
          error={error}
          data={data}
          onRetry={() => refetch()}
          loadingLabel="Loading categories…"
        >
          {(categories) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((c, i) => {
                const s = styleFor(c.name, i);
                const Icon = s.icon;
                return (
                  <Link
                    key={c.id}
                    to="/products"
                    search={{ category: c.name }}
                    className="group relative rounded-2xl p-5 glass hover-lift overflow-hidden cursor-pointer block"
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                    />
                    <div className="relative">
                      <div
                        className="h-12 w-12 rounded-xl grid place-items-center mb-3"
                        style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="font-semibold group-hover:text-white transition-colors">{c.name}</div>
                      <div className="text-xs text-muted-foreground group-hover:text-white/80 mt-1 flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </AsyncBoundary>
      </Section>
    </PageShell>
  );
}
