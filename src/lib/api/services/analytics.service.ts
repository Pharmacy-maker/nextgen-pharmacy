import { supabase } from "../../supabase";
import type { AdminStats, AnalyticsBundle } from "../../../types/models";

export const analyticsService = {
  async stats(): Promise<AdminStats> {
  const [
    productsResult,
    ordersResult,
    prescriptionsResult,
    usersResult,
  ] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("orders").select("*"),
    supabase.from("prescriptions").select("*"),
    supabase.from("users").select("*"),
  ]);

  const products = productsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  console.log(
  "ORDER STATUS:",
  orders.map((o) => o.status)
);
  const prescriptions = prescriptionsResult.data ?? [];
  const users = usersResult.data ?? [];

  const stats: AdminStats = {
    totalRevenue: orders.reduce(
      (sum, o) => sum + Number(o.total ?? 0),
      0
    ),

    totalOrders: orders.length,

    activeUsers: users.length,

    totalProducts: products.length,

    lowStock: products.filter(
      (p) => Number(p.stock ?? 0) <= 10
    ).length,

    outOfStock: products.filter(
      (p) => Number(p.stock ?? 0) === 0
    ).length,

    pendingPrescriptions: prescriptions.filter(
      (p) => p.status === "Pending"
    ).length,

    pendingDeliveries: orders.filter(
      (o) =>
        ["pending", "processing", "shipped"].includes(
          String(o.status).toLowerCase()
       )
    ).length,
  };

  return stats;
},

  async bundle(): Promise<AnalyticsBundle> {
    const [
      productsResult,
      ordersResult,
      orderItemsResult,
    ] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("orders").select("*"),
      supabase.from("order_items").select("*"),
    ]);

    const products = productsResult.data ?? [];
    console.log("FIRST PRODUCT:", products[0]);
console.log(
  "STOCK SAMPLE:",
  products.slice(0, 5).map((p) => ({
    name: p.name,
    stock: p.stock,
  }))
);
    const orders = ordersResult.data ?? [];
    const orderItems = orderItemsResult.data ?? [];

    // Sales trend
    const monthlyOrders = new Map<string, number>();
    const monthlyRevenue = new Map<string, number>();

    orders.forEach((order) => {
      const date = new Date(
        order.created_at || order.placed_at
      );

      const month = date.toLocaleString("default", {
        month: "short",
      });

      monthlyOrders.set(
        month,
        (monthlyOrders.get(month) || 0) + 1
      );

      monthlyRevenue.set(
        month,
        (monthlyRevenue.get(month) || 0) +
          Number(order.total || 0)
      );
    });

    const salesTrend = Array.from(
      monthlyOrders.entries()
    ).map(([label, value]) => ({
      label,
      value,
    }));

    const revenueTrend = Array.from(
      monthlyRevenue.entries()
    ).map(([label, value]) => ({
      label,
      value,
    }));

    // Top products
    const productSales = new Map<
      string,
      {
        quantity: number;
        revenue: number;
      }
    >();

    orderItems.forEach((item) => {
      const name =
        item.product_name || "Unknown Product";

      const existing =
        productSales.get(name) || {
          quantity: 0,
          revenue: 0,
        };

      existing.quantity += Number(
        item.quantity || 0
      );

      existing.revenue += Number(
        item.total || 0
      );

      productSales.set(name, existing);
    });

    const topProducts = Array.from(
  productSales.entries()
)
  .map(([label, data]) => ({
    label,
    value: data.quantity,
  }))
  .sort(
    (a, b) => b.value - a.value
  )
  .slice(0, 5);

   return {
  salesTrend,
  revenueTrend,
  topProducts,
  categorySales: [],
  customerGrowth: [],
  inventoryReport: [],
};
  },
};