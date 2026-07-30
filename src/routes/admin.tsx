import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Package, Boxes, Truck, Users, ShoppingBag, FileText,
  BarChart3, Settings, LogOut, Menu, X, Pill, Store,
} from "lucide-react";
import { RoleGuard } from "../components/auth/RoleGuard";
import { useAuth } from "../lib/store";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin Console — Rays Pharmacy" },
      { name: "description", content: "Manage products, inventory, orders, prescriptions and analytics for Rays Pharmacy." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Console — Rays Pharmacy" },
      { property: "og:description", content: "Internal administration console for Rays Pharmacy." },
    ],
  }),
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/suppliers", label: "Suppliers", icon: Truck },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/prescriptions", label: "Prescriptions", icon: FileText },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  return (
    <RoleGuard role="admin">
      <AdminShell />
    </RoleGuard>
  );
}

function AdminShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 h-[500px] w-[500px] rounded-full bg-purple/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-cyan/15 blur-3xl" />
      </div>

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 p-3 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="glass-strong rounded-2xl h-full flex flex-col p-3">
          <Link to="/admin" className="flex items-center gap-2 px-2 py-3">
            <div className="h-9 w-9 rounded-xl bg-grad-hero grid place-items-center glow">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold leading-tight">Rays Admin</div>
              <div className="text-[11px] text-muted-foreground">Control centre</div>
            </div>
          </Link>
          <nav className="mt-2 flex-1 overflow-y-auto space-y-1">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to as "/admin"}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                    active ? "bg-white/10 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 pt-3 mt-2 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5">
              <Store className="h-4 w-4" /> View storefront
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 p-3">
          <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="text-sm text-muted-foreground">Administrator console</div>
            <div className="flex-1" />
            <div className="text-right">
              <div className="text-sm font-semibold leading-tight">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground">{user?.email}</div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-grad-cool grid place-items-center text-white font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>
        <main className="p-3 md:p-6 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
