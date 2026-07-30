import { products } from "../../products";
import type {
  Address,
  AnalyticsBundle,
  Category,
  InventoryBatch,
  InventoryMovement,
  NotificationSetting,
  Order,
  Prescription,
  PurchaseRecord,
  RolePermission,
  SiteSettings,
  Supplier,
  User,
} from "../../../types/models";

/**
 * Mock database. Mirrors the relational tables the backend will expose.
 * Delete this file once every service points at real endpoints.
 */

export const mockUsers: User[] = [
  { id: "u-1", name: "Admin", email: "admin@rayspharmacy.com", phone: "9876500001", role: "admin", status: "active", createdAt: "2026-01-04" },
  { id: "u-2", name: "Ananya Rao", email: "ananya@example.com", phone: "9876500002", role: "user", status: "active", createdAt: "2026-02-11" },
  { id: "u-3", name: "Karthik Menon", email: "karthik@example.com", phone: "9876500003", role: "user", status: "active", createdAt: "2026-03-02" },
  { id: "u-4", name: "Divya Sharma", email: "divya@example.com", phone: "9876500004", role: "user", status: "inactive", createdAt: "2026-03-20" },
  { id: "u-5", name: "Rahul Verma", email: "rahul@example.com", phone: "9876500005", role: "user", status: "blocked", createdAt: "2026-04-08" },
  { id: "u-6", name: "Meera Iyer", email: "meera@example.com", phone: "9876500006", role: "user", status: "active", createdAt: "2026-05-15" },
];

export const mockAddresses: Address[] = [
  { id: "a-1", userId: "u-2", label: "Home", line1: "12 Lotus Residency, MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", phone: "9876500002", isDefault: true },
  { id: "a-2", userId: "u-2", label: "Office", line1: "4th Floor, Orion Tech Park", city: "Bengaluru", state: "Karnataka", pincode: "560103", phone: "9876500002", isDefault: false },
];

export const mockCategories: Category[] = Array.from(
  new Set(products.map((p) => p.category)),
).map((name, i) => ({
  id: `c-${i + 1}`,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  productCount: products.filter((p) => p.category === name).length,
  imageUrl: products.find((p) => p.category === name)?.image,
}));

export const mockSuppliers: Supplier[] = [
  { id: "s-1", name: "MediWave Distributors", contactPerson: "Nikhil Jain", email: "nikhil@mediwave.com", phone: "9811100011", address: "Plot 21, Industrial Estate, Pune", status: "active", productsSupplied: 4 },
  { id: "s-2", name: "PharmaOne Supplies", contactPerson: "Sonia Kapoor", email: "sonia@pharmaone.com", phone: "9811100022", address: "88 Ring Road, Delhi", status: "active", productsSupplied: 3 },
  { id: "s-3", name: "VitaCore Labs", contactPerson: "Arjun Nair", email: "arjun@vitacore.com", phone: "9811100033", address: "5 Marine Drive, Kochi", status: "pending", productsSupplied: 2 },
  { id: "s-4", name: "GlowCo Health", contactPerson: "Priya Das", email: "priya@glowco.com", phone: "9811100044", address: "17 Salt Lake, Kolkata", status: "suspended", productsSupplied: 3 },
];

export const mockPurchases: PurchaseRecord[] = [
  { id: "pr-1", supplierId: "s-1", supplierName: "MediWave Distributors", reference: "PO-2041", amount: 128400, items: 320, status: "received", date: "2026-06-12" },
  { id: "pr-2", supplierId: "s-2", supplierName: "PharmaOne Supplies", reference: "PO-2042", amount: 94500, items: 210, status: "ordered", date: "2026-07-02" },
  { id: "pr-3", supplierId: "s-3", supplierName: "VitaCore Labs", reference: "PO-2043", amount: 61200, items: 150, status: "received", date: "2026-07-14" },
  { id: "pr-4", supplierId: "s-4", supplierName: "GlowCo Health", reference: "PO-2044", amount: 38900, items: 90, status: "cancelled", date: "2026-07-21" },
];

export const mockBatches: InventoryBatch[] = products.map((p, i) => ({
  id: `b-${i + 1}`,
  productId: p.id,
  productName: p.name,
  batchNumber: `BN-${2026}${String(i + 1).padStart(3, "0")}`,
  quantity: p.stock,
  reorderLevel: 60,
  mfg: p.mfg,
  exp: p.exp,
  location: i % 2 === 0 ? "Warehouse A" : "Warehouse B",
}));

export const mockMovements: InventoryMovement[] = mockBatches.slice(0, 8).map((b, i) => ({
  id: `m-${i + 1}`,
  productId: b.productId,
  productName: b.productName,
  batchNumber: b.batchNumber,
  type: (["in", "out", "adjust", "expired"] as const)[i % 4],
  quantity: 10 + i * 5,
  note: i % 2 === 0 ? "Supplier restock" : "Customer orders",
  createdAt: `2026-07-${String(10 + i).padStart(2, "0")}`,
}));

const orderSeed: {
  id: string;
  userId: string;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  paymentMethod: Order["paymentMethod"];
  date: string;
  picks: number[];
}[] = [
  { id: "o-1", userId: "u-2", status: "delivered", paymentStatus: "paid", paymentMethod: "upi", date: "2026-07-02", picks: [0, 3] },
  { id: "o-2", userId: "u-3", status: "pending", paymentStatus: "unpaid", paymentMethod: "cod", date: "2026-07-18", picks: [1] },
  { id: "o-3", userId: "u-2", status: "confirmed", paymentStatus: "paid", paymentMethod: "card", date: "2026-07-22", picks: [2, 4, 5] },
  { id: "o-4", userId: "u-4", status: "cancelled", paymentStatus: "refunded", paymentMethod: "card", date: "2026-07-24", picks: [6] },
  { id: "o-5", userId: "u-6", status: "shipped", paymentStatus: "paid", paymentMethod: "netbanking", date: "2026-07-27", picks: [7, 8] },
  { id: "o-6", userId: "u-3", status: "delivered", paymentStatus: "paid", paymentMethod: "upi", date: "2026-07-29", picks: [9, 10] },
];

export const mockOrders: Order[] = orderSeed.map((seed, idx) => {
  const user = mockUsers.find((u) => u.id === seed.userId)!;
  const items = seed.picks.map((pi, i) => {
    const p = products[pi % products.length];
    const unitPrice = Math.round(p.price * (1 - p.discount / 100));
    const quantity = 1 + (i % 2);
    return {
      id: `oi-${idx + 1}-${i + 1}`,
      orderId: seed.id,
      productId: p.id,
      productName: p.name,
      quantity,
      unitPrice,
      total: unitPrice * quantity,
    };
  });
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const deliveryFee = subtotal > 499 ? 0 : 40;
  return {
    id: seed.id,
    reference: `RP-0${8420 + idx}`,
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    items,
    subtotal,
    discount: 0,
    deliveryFee,
    total: subtotal + deliveryFee,
    status: seed.status,
    paymentStatus: seed.paymentStatus,
    paymentMethod: seed.paymentMethod,
    shippingAddress: "12 Lotus Residency, MG Road, Bengaluru 560001",
    placedAt: seed.date,
    deliveredAt: seed.status === "delivered" ? seed.date : undefined,
  };
});

export const mockPrescriptions: Prescription[] = [
  { id: "rx-1", userId: "u-2", customerName: "Ananya Rao", fileName: "prescription-july.jpg", fileType: "image/jpeg", fileSize: 842000, status: "pending", uploadedAt: "2026-07-26", extractedMedicines: [{ name: "CardioGuard 40mg", dosage: "1-0-1" }, { name: "OmegaVital 1000", dosage: "0-0-1" }] },
  { id: "rx-2", userId: "u-3", customerName: "Karthik Menon", fileName: "dr-menon-scan.pdf", fileType: "application/pdf", fileSize: 1240000, status: "approved", reviewedBy: "Admin", uploadedAt: "2026-07-21", extractedMedicines: [{ name: "GlucoBalance XR", dosage: "1-0-0" }] },
  { id: "rx-3", userId: "u-6", customerName: "Meera Iyer", fileName: "skin-care-rx.png", fileType: "image/png", fileSize: 512000, status: "rejected", note: "Image unreadable", reviewedBy: "Admin", uploadedAt: "2026-07-19" },
  { id: "rx-4", userId: "u-4", customerName: "Divya Sharma", fileName: "rx-scan-04.jpg", fileType: "image/jpeg", fileSize: 690000, status: "pending", uploadedAt: "2026-07-29" },
];

export const mockAnalytics: AnalyticsBundle = {
  salesTrend: [
    { label: "Feb", value: 182 }, { label: "Mar", value: 240 }, { label: "Apr", value: 216 },
    { label: "May", value: 305 }, { label: "Jun", value: 348 }, { label: "Jul", value: 412 },
  ],
  revenueTrend: [
    { label: "Feb", value: 240000 }, { label: "Mar", value: 318000 }, { label: "Apr", value: 296000 },
    { label: "May", value: 402000 }, { label: "Jun", value: 468000 }, { label: "Jul", value: 552000 },
  ],
  topProducts: products.slice(0, 6).map((p, i) => ({ label: p.name, value: 420 - i * 48 })),
  categorySales: mockCategories.slice(0, 6).map((c, i) => ({ label: c.name, value: 320 - i * 36 })),
  customerGrowth: [
    { label: "Feb", value: 620 }, { label: "Mar", value: 810 }, { label: "Apr", value: 980 },
    { label: "May", value: 1240 }, { label: "Jun", value: 1585 }, { label: "Jul", value: 1902 },
  ],
  inventoryReport: [
    { label: "In stock", value: products.filter((p) => p.stock > 60).length },
    { label: "Low stock", value: products.filter((p) => p.stock > 0 && p.stock <= 60).length },
    { label: "Out of stock", value: products.filter((p) => p.stock === 0).length },
    { label: "Expiring soon", value: 2 },
  ],
};

export const mockSiteSettings: SiteSettings = {
  siteName: "Rays Pharmacy",
  supportEmail: "support@rayspharmacy.com",
  supportPhone: "1800 123 4567",
  deliveryFee: 40,
  freeDeliveryAbove: 499,
  maintenanceMode: false,
};

export const mockRoles: RolePermission[] = [
  { id: "r-1", role: "Admin", permissions: ["products.manage", "orders.manage", "users.manage", "settings.manage", "analytics.view"] },
  { id: "r-2", role: "Pharmacist", permissions: ["prescriptions.review", "orders.view", "inventory.manage"] },
  { id: "r-3", role: "Support", permissions: ["orders.view", "users.view"] },
  { id: "r-4", role: "Customer", permissions: ["orders.own", "prescriptions.own"] },
];

export const mockNotifications: NotificationSetting[] = [
  { id: "n-1", label: "New orders", description: "Email me whenever a customer places an order.", enabled: true },
  { id: "n-2", label: "Low stock alerts", description: "Notify when a product drops below reorder level.", enabled: true },
  { id: "n-3", label: "Prescription uploads", description: "Alert on every new prescription awaiting review.", enabled: true },
  { id: "n-4", label: "Weekly report", description: "Send a weekly revenue and sales summary.", enabled: false },
];
