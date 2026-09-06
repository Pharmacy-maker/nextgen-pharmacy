import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Heart, MapPin, Package, User } from "lucide-react";

import { RoleGuard } from "../components/auth/RoleGuard";
import { PageShell, Section } from "../components/site/Section";
import { AsyncBoundary, EmptyState } from "../components/site/AsyncState";
import { DataTable, StatCard, StatusBadge, inr } from "../components/admin/AdminUI";
import { ProductImage } from "../components/site/ProductImage";

import {
  orderService,
  prescriptionService,
  userService,
  productService,
} from "../lib/api";

import { useAuth, useCart, useWishlist } from "../lib/store";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
  head: () => ({
    meta: [
      { title: "My Dashboard — Rays Pharmacy" },
      { name: "description", content: "Track your Rays Pharmacy orders, prescriptions, wishlist, addresses and profile in one place." },
      { property: "og:title", content: "My Dashboard — Rays Pharmacy" },
      { property: "og:description", content: "Your orders, prescriptions, wishlist and saved addresses." },
    ],
  }),
});

function DashboardRoute() {
  return (
    <RoleGuard role="user">
      <CustomerDashboard />
    </RoleGuard>
  );
}

function CustomerDashboard() {
  const { user } = useAuth();
  const { count, subtotal } = useCart();
  const { ids } = useWishlist();

  const userId = user?.id ?? "";

  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.list(),
  });

  const orders = useQuery({
    queryKey: ["me", "orders", userId],
    queryFn: () => orderService.listMine(userId),
    enabled: !!userId,
  });

  const rxs = useQuery({
    queryKey: ["me", "prescriptions", userId],
    queryFn: () => prescriptionService.listMine(userId),
    enabled: !!userId,
  });

  const addresses = useQuery({
    queryKey: ["me", "addresses", userId],
    queryFn: () => userService.addresses(userId),
    enabled: !!userId,
  });

  const wishlist =
    products.data?.filter((p: any) => ids.includes(p.id)) ?? [];

  console.log("WISHLIST IDS", ids);
  console.log("PRODUCTS", products.data);
  console.log("WISHLIST PRODUCTS", wishlist);

  return (
    <PageShell>
      <Section
        eyebrow="My account"
        title={`Welcome back, ${user?.name ?? ""}`}
        subtitle="Your orders, prescriptions, wishlist and saved addresses."
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Orders"
            value={orders.data?.length ?? 0}
            icon={<Package className="h-4 w-4 text-cyan" />}
            tone="cool"
          />

          <StatCard
            label="Cart items"
            value={count}
            hint={inr(subtotal)}
            icon={<Package className="h-4 w-4 text-emerald" />}
            tone="neon"
          />

          <StatCard
            label="Wishlist"
            value={wishlist.length}
            icon={<Heart className="h-4 w-4 text-pink" />}
            tone="warm"
          />

          <StatCard
            label="Prescriptions"
            value={rxs.data?.length ?? 0}
            icon={<FileText className="h-4 w-4 text-purple" />}
            tone="hero"
          />
        </div>
      </Section>

      {/* Your existing Orders section */}

      {/* Your existing Prescriptions section */}

      <Section eyebrow="Saved" title="My Wishlist">
        {wishlist.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            hint="Tap the heart on any product to save it here."
            action={
              <Link
                to="/products"
                className="rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold"
              >
                Explore medicines
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlist.map((p: any) => (
              <Link
                key={p.id}
                to="/products"
                search={{ q: p.name }}
                className="glass rounded-2xl p-4 hover:bg-white/10"
              >
                <ProductImage
                  src={p.image}
                  seed={p.id}
                  alt={p.name}
                  className="h-28 w-full object-cover rounded-xl"
                />

                <div className="mt-3 font-semibold text-sm">
                  {p.name}
                </div>

                <div className="text-xs text-muted-foreground">
                  {p.category}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Keep your existing Addresses section */}

      {/* Keep your existing Profile section */}
    </PageShell>
  );
}