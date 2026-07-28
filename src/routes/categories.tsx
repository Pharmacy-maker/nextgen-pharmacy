import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, ArrowRight, Baby, Dog, Droplet, Flower2, HeartPulse, Leaf, Shield, Smile, Sun, Zap,
} from "lucide-react";
import { PageShell, Section } from "../components/site/Section";

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

const categories = [
  { name: "Diabetes", icon: Droplet, from: "var(--cyan)", to: "var(--electric)" },
  { name: "Cardiac", icon: HeartPulse, from: "var(--pink)", to: "var(--purple)" },
  { name: "Stomach", icon: Activity, from: "var(--orange)", to: "var(--pink)" },
  { name: "Cancer Care", icon: Shield, from: "var(--purple)", to: "var(--electric)" },
  { name: "Pain Relief", icon: Zap, from: "var(--orange)", to: "var(--neon)" },
  { name: "Kidney", icon: Droplet, from: "var(--emerald)", to: "var(--cyan)" },
  { name: "Dental", icon: Smile, from: "var(--cyan)", to: "var(--emerald)" },
  { name: "Sexual Wellness", icon: Flower2, from: "var(--pink)", to: "var(--orange)" },
  { name: "Women Care", icon: Flower2, from: "var(--purple)", to: "var(--pink)" },
  { name: "Baby Care", icon: Baby, from: "var(--cyan)", to: "var(--purple)" },
  { name: "Pet Care", icon: Dog, from: "var(--orange)", to: "var(--emerald)" },
  { name: "Energy", icon: Zap, from: "var(--neon)", to: "var(--orange)" },
  { name: "Immunity", icon: Shield, from: "var(--emerald)", to: "var(--neon)" },
  { name: "Skin Care", icon: Sun, from: "var(--pink)", to: "var(--orange)" },
  { name: "Vitamins", icon: Leaf, from: "var(--emerald)", to: "var(--cyan)" },
];

function CategoriesPage() {
  return (
    <PageShell>
      <Section
        eyebrow="Shop by need"
        title="All | Categories |"
        subtitle="From daily essentials to specialised care — beautifully organised."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.name}
                to="/products"
                search={{ category: c.name }}
                className="group relative rounded-2xl p-5 glass hover-lift overflow-hidden cursor-pointer block"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                />
                <div className="relative">
                  <div
                    className="h-12 w-12 rounded-xl grid place-items-center mb-3"
                    style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
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
      </Section>
    </PageShell>
  );
}
