import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AreaTrend, BarSeries, ChartCard, DonutSeries, StatCard, inr } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { analyticsService } from "../lib/api";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

function AdminAnalytics() {
  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: () => analyticsService.bundle() });
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: () => analyticsService.stats() });

  return (
    <div>
      <AdminPageHeader title="Analytics" subtitle="Placeholder charts wired to the API layer — connect your backend to populate them." />
      <AsyncBoundary isLoading={stats.isLoading} error={stats.error} data={stats.data} onRetry={() => stats.refetch()}>
        {(s) => (
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard label="Revenue" value={inr(s.totalRevenue)} tone="neon" />
            <StatCard label="Orders" value={s.totalOrders} tone="cool" />
            <StatCard label="Customers" value={s.activeUsers} tone="hero" />
            <StatCard label="Products" value={s.totalProducts} tone="warm" />
          </div>
        )}
      </AsyncBoundary>

      <AsyncBoundary isLoading={analytics.isLoading} error={analytics.error} data={analytics.data} onRetry={() => analytics.refetch()}>
        {(a) => (
          <div className="grid lg:grid-cols-2 gap-4">
            <ChartCard title="Sales trends" subtitle="Orders per month"><AreaTrend data={a.salesTrend} /></ChartCard>
            <ChartCard title="Revenue" subtitle="Monthly revenue (₹)"><AreaTrend data={a.revenueTrend} /></ChartCard>
            <ChartCard title="Most purchased products" subtitle="Units sold"><BarSeries data={a.topProducts} /></ChartCard>
            <ChartCard title="Category-wise sales" subtitle="Units by category"><BarSeries data={a.categorySales} /></ChartCard>
            <ChartCard title="Customer growth" subtitle="Registered customers"><AreaTrend data={a.customerGrowth} /></ChartCard>
            <ChartCard title="Inventory report" subtitle="Stock health"><DonutSeries data={a.inventoryReport} /></ChartCard>
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
