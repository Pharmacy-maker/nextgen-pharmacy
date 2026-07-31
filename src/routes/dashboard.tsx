import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Heart, MapPin, Package, User } from "lucide-react";
import { RoleGuard } from "../components/auth/RoleGuard";
import { PageShell, Section } from "../components/site/Section";
import { AsyncBoundary, EmptyState } from "../components/site/AsyncState";
import { DataTable, StatCard, StatusBadge, inr } from "../components/admin/AdminUI";
import { orderService, prescriptionService, userService } from "../lib/api";
import { useAuth, useCart, useWishlist } from "../lib/store";
import { findProduct } from "../lib/products";
import { ProductImage } from "../components/site/ProductImage";

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

  const orders = useQuery({ queryKey: ["me", "orders", userId], queryFn: () => orderService.listMine(userId), enabled: !!userId });
  const rxs = useQuery({ queryKey: ["me", "prescriptions", userId], queryFn: () => prescriptionService.listMine(userId), enabled: !!userId });
  const addresses = useQuery({ queryKey: ["me", "addresses", userId], queryFn: () => userService.addresses(userId), enabled: !!userId });

  const wishlist = ids.map(findProduct).filter(Boolean);

  return (
    <PageShell>
      <Section eyebrow="My account" title={`Welcome back, | ${user?.name ?? ""} |`} subtitle="Your orders, prescriptions, wishlist and saved addresses.">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Orders" value={orders.data?.length ?? 0} icon={<Package className="h-4 w-4 text-cyan" />} tone="cool" />
          <StatCard label="Cart items" value={count} hint={inr(subtotal)} icon={<Package className="h-4 w-4 text-emerald" />} tone="neon" />
          <StatCard label="Wishlist" value={wishlist.length} icon={<Heart className="h-4 w-4 text-pink" />} tone="warm" />
          <StatCard label="Prescriptions" value={rxs.data?.length ?? 0} icon={<FileText className="h-4 w-4 text-purple" />} tone="hero" />
        </div>
      </Section>

      <Section eyebrow="History" title="My | Orders |">
        <AsyncBoundary
          isLoading={orders.isLoading}
          error={orders.error}
          data={orders.data}
          onRetry={() => orders.refetch()}
          empty={<EmptyState title="No orders yet" hint="Your placed orders will show up here." action={<Link to="/products" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold">Browse products</Link>} />}
        >
          {(list) => (
            <DataTable headers={["Order", "Items", "Total", "Status", "Payment", "Placed"]}>
              {list.map((o) => (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{o.reference}</td>
                  <td className="px-4 py-3">{o.items.map((i) => i.productName).join(", ")}</td>
                  <td className="px-4 py-3 tabular-nums">{inr(o.total)}</td>
                  <td className="px-4 py-3"><StatusBadge label={o.status} tone={o.status === "delivered" ? "green" : o.status === "cancelled" ? "red" : "amber"} /></td>
                  <td className="px-4 py-3"><StatusBadge label={o.paymentStatus} tone={o.paymentStatus === "paid" ? "green" : "gray"} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.placedAt}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </AsyncBoundary>
      </Section>

      <Section eyebrow="AI Vision" title="My | Prescriptions |">
        <AsyncBoundary
          isLoading={rxs.isLoading}
          error={rxs.error}
          data={rxs.data}
          onRetry={() => rxs.refetch()}
          empty={<EmptyState title="No prescriptions uploaded" hint="Upload a prescription and our team will review it." action={<Link to="/prescription" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold">Upload prescription</Link>} />}
        >
          {(list) => (
            <DataTable headers={["File", "Uploaded", "Status", "Note"]}>
              {list.map((rx) => (
                <tr key={rx.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{rx.fileName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rx.uploadedAt}</td>
                  <td className="px-4 py-3"><StatusBadge label={rx.status} tone={rx.status === "approved" ? "green" : rx.status === "rejected" ? "red" : "amber"} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{rx.note ?? "—"}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </AsyncBoundary>
      </Section>

      <Section eyebrow="Saved" title="My | Wishlist |">
        {wishlist.length === 0 ? (
          <EmptyState title="Your wishlist is empty" hint="Tap the heart on any product to save it here." action={<Link to="/products" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold">Explore medicines</Link>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlist.map((p) => (
              <Link key={p!.id} to="/products" search={{ q: p!.name }} className="glass rounded-2xl p-4 hover:bg-white/10">
                <ProductImage src={p!.image} seed={p!.id} alt={p!.name} className="h-28 w-full object-cover rounded-xl" />
                <div className="mt-3 font-semibold text-sm">{p!.name}</div>
                <div className="text-xs text-muted-foreground">{p!.category}</div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section eyebrow="Delivery" title="My | Addresses |">
        <AsyncBoundary
          isLoading={addresses.isLoading}
          error={addresses.error}
          data={addresses.data}
          onRetry={() => addresses.refetch()}
          empty={<EmptyState title="No saved addresses" hint="Addresses you use at checkout will appear here." />}
        >
          {(list) => (
            <div className="grid sm:grid-cols-2 gap-4">
              {list.map((a) => (
                <div key={a.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-cyan" /> {a.label}
                    {a.isDefault && <StatusBadge label="default" tone="green" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{a.line1}, {a.city} {a.state ? `, ${a.state}` : ""} — {a.pincode}</p>
                  <p className="text-sm text-muted-foreground">{a.phone}</p>
                </div>
              ))}
            </div>
          )}
        </AsyncBoundary>
      </Section>

      <Section eyebrow="Account" title="My | Profile |">
        <div className="glass rounded-3xl p-6 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-grad-hero grid place-items-center text-white font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> {user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <dl className="mt-5 text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{user?.phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Account type</dt><dd><StatusBadge label="customer" tone="blue" /></dd></div>
          </dl>
        </div>
      </Section>
    </PageShell>
  );
}
