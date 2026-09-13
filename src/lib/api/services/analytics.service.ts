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
  const prescriptions = prescriptionsResult.data ?? [];
  const users = usersResult.data ?? [];
  const LOW_STOCK_THRESHOLD = 50;
  const stats: AdminStats = {
    totalRevenue: orders.reduce(
      (sum, o) => sum + Number(o.total ?? 0),
      0
    ),

    totalOrders: orders.length,

    activeUsers: users.length,

    totalProducts: products.length,

  

lowStock: products.filter(
  (p) => {
    const stock = Number(p.stock ?? 0);
    return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  }
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
  usersResult,
] = await Promise.all([
  supabase.from("products").select("*"),
  supabase.from("orders").select("*"),
  supabase.from("order_items").select("*"),
  supabase.from("users").select("*"),
]);

    const products = productsResult.data ?? [];
    
    const orders = ordersResult.data ?? [];
    const orderItems = orderItemsResult.data ?? [];
    
    const users = usersResult.data ?? [];

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

    const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const salesTrend = MONTHS.map((month) => ({
  label: month,
  value: monthlyOrders.get(month) || 0,
}));

const revenueTrend = MONTHS.map((month) => ({
  label: month,
  value: Math.round(
    monthlyRevenue.get(month) || 0
  ),
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
  products.find((p) => p.id === item.product_id)?.name ||
  item.product_name ||
  "Unknown Product";
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
console.log("ORDER ITEM:", item);
console.log("PRODUCT NAME USED:", name);
      productSales.set(name, existing);
    });

  const topProducts = [...productSales.entries()]
  .sort((a, b) => b[1].quantity - a[1].quantity)
  .slice(0, 5)
  .map(([name, stats]) => ({
    label: name,
    value: stats.quantity,
  }));
  // CATEGORY SALES
const categoryMap = new Map<string, number>();

products.forEach((p) => {
  const category = p.category || "Other";

  categoryMap.set(
    category,
    (categoryMap.get(category) || 0) + Number(p.stock || 0)
  );
});
const categorySales = Array.from(
  categoryMap.entries()
)
  .map(([label, value]) => ({
    label,
    value,
  }))
  .sort((a, b) => b.value - a.value);
// CUSTOMER GROWTH
const customerMap = new Map<string, number>();

users.forEach((u) => {
  if (!u.created_at) return;

  const month = new Date(u.created_at)
    .toLocaleString("default", {
      month: "short",
    });

  customerMap.set(
    month,
    (customerMap.get(month) || 0) + 1
  );
});

let runningCustomers = 0;

const customerGrowth = MONTHS.map((month) => {
  runningCustomers += customerMap.get(month) || 0;

  return {
    label: month,
    value: runningCustomers,
  };
});

// INVENTORY REPORT
let inStock = 0;
let lowStock = 0;
let outOfStock = 0;

products.forEach((product) => {
  const stock = Number(product.stock || 0);

  if (stock <= 0) {
    outOfStock++;
  } else if (stock <= 20) {
    lowStock++;
  } else {
    inStock++;
  }
});

const inventoryReport = [
  { label: "In Stock", value: inStock },
  { label: "Low Stock", value: lowStock },
  { label: "Out Of Stock", value: outOfStock },
];

return {
  salesTrend,
  revenueTrend,
  topProducts,
  categorySales,
  customerGrowth,
  inventoryReport,
};
},
}