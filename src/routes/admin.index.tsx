import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, DollarSign, FileText, PackageX, ShoppingBag, Truck, Users } from "lucide-react";
import { AdminPageHeader, AreaTrend, ChartCard, DataTable, StatCard, StatusBadge, inr } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { analyticsService, orderService } from "../lib/api";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: () => analyticsService.stats() });
  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: () => analyticsService.bundle() });
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: () => orderService.list() });

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="Live snapshot of store performance and operations." />

      <AsyncBoundary isLoading={stats.isLoading} error={stats.error} data={stats.data} onRetry={() => stats.refetch()}>
        {(s) => (
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total revenue" value={inr(s.totalRevenue)} hint="Paid orders" tone="neon" icon={<DollarSign className="h-4 w-4 text-emerald" />} />
            <StatCard label="Total orders" value={s.totalOrders} hint="All time" tone="cool" icon={<ShoppingBag className="h-4 w-4 text-cyan" />} />
            <StatCard label="Active users" value={s.activeUsers} hint="Customers" tone="hero" icon={<Users className="h-4 w-4 text-purple" />} />
            <StatCard label="Total products" value={s.totalProducts} hint="In catalog" tone="warm" icon={<Boxes className="h-4 w-4 text-orange" />} />
            <StatCard label="Low stock alerts" value={s.lowStock} hint="At or below reorder level" tone="warm" icon={<AlertTriangle className="h-4 w-4 text-orange" />} />
            <StatCard label="Out of stock" value={s.outOfStock} hint="Needs restock" tone="warm" icon={<PackageX className="h-4 w-4 text-pink" />} />
            <StatCard label="Pending prescriptions" value={s.pendingPrescriptions} hint="Awaiting review" tone="hero" icon={<FileText className="h-4 w-4 text-cyan" />} />
            <StatCard label="Pending deliveries" value={s.pendingDeliveries} hint="In fulfilment" tone="cool" icon={<Truck className="h-4 w-4 text-emerald" />} />
          </div>
        )}
      </AsyncBoundary>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <ChartCard title="Sales trend" subtitle="Orders per month">
          <AsyncBoundary isLoading={analytics.isLoading} error={analytics.error} data={analytics.data} onRetry={() => analytics.refetch()}>
            {(a) => <AreaTrend data={a.salesTrend} />}
          </AsyncBoundary>
        </ChartCard>
        <ChartCard title="Revenue trend" subtitle="Monthly revenue (₹)">
          <AsyncBoundary isLoading={analytics.isLoading} error={analytics.error} data={analytics.data} onRetry={() => analytics.refetch()}>
            {(a) => <AreaTrend data={a.revenueTrend} />}
          </AsyncBoundary>
        </ChartCard>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-cyan hover:underline">View all</Link>
        </div>
        <AsyncBoundary isLoading={orders.isLoading} error={orders.error} data={orders.data} onRetry={() => orders.refetch()}>
          {(list) => (
            <DataTable headers={["Order", "Customer", "Total", "Status", "Payment", "Date"]}>
              {list.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{o.reference}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3 tabular-nums">{inr(o.total)}</td>
                  <td className="px-4 py-3"><StatusBadge label={o.status} tone={o.status === "delivered" ? "green" : o.status === "cancelled" ? "red" : "amber"} /></td>
                  <td className="px-4 py-3"><StatusBadge label={o.paymentStatus} tone={o.paymentStatus === "paid" ? "green" : "gray"} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.placedAt}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </AsyncBoundary>
      </div>
    </div>
  );
}
