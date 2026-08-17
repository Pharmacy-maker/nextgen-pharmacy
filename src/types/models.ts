/**
 * Database entity models.
 *
 * These types intentionally mirror a relational schema (MySQL / PostgreSQL).
 * Every entity has a primary key `id` and foreign keys use the `<entity>Id`
 * convention so API responses can be mapped 1:1 without touching the UI.
 */

export type ID = string;
export type ISODate = string; // "YYYY-MM-DD" or full ISO timestamp

/* ---------------- Auth / Users ---------------- */

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "inactive" | "blocked";

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: ISODate;
  avatarUrl?: string;
}

export interface Address {
  id: ID;
  userId: ID;
  label: string;
  line1: string;
  city: string;
  state?: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface AuthSession {
  token: string;
  user: User;
}

/* ---------------- Catalog ---------------- */

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export interface Product {
  id: ID;
  name: string;
  category: string;
  categoryId?: ID;
  supplier: string;
  supplierId?: ID;
  manufacturer: string;
  mfg: string;
  exp: string;
  stock: number;
  rating: number;
  reviews: number;
  price: number;
  discount: number;
  grad: string;
  image: string;
  description?: string;
  tags?: string[];

  /* ---- Product detail page fields (nullable until the backend supplies them) ---- */
  /** e.g. "Tablet", "Syrup", "Capsule" */
  form?: string;
  /** e.g. "Strip of 10 tablets" */
  packSize?: string;
  /** Active ingredients / composition. */
  composition?: string[];
  dosage?: string;
  usage?: string;
  warnings?: string[];
  sideEffects?: string[];
  storage?: string;
  prescriptionRequired?: boolean;
}

export type ProductInput = Omit<Product, "id" | "rating" | "reviews"> &
  Partial<Pick<Product, "rating" | "reviews">>;

/* ---------------- Inventory ---------------- */

export interface InventoryBatch {
  id: ID;
  productId: ID;
  productName: string;
  batchNumber: string;
  quantity: number;
  reorderLevel: number;
  mfg: ISODate;
  exp: ISODate;
  location?: string;
}

export type InventoryMovementType = "in" | "out" | "adjust" | "expired";

export interface InventoryMovement {
  id: ID;
  productId: ID;
  productName: string;
  batchNumber: string;
  type: InventoryMovementType;
  quantity: number;
  note?: string;
  createdAt: ISODate;
}

/* ---------------- Suppliers ---------------- */

export type SupplierStatus = "active" | "pending" | "suspended";

export interface Supplier {
  id: ID;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: SupplierStatus;
  productsSupplied: number;
}

export interface PurchaseRecord {
  id: ID;
  supplierId: ID;
  supplierName: string;
  reference: string;
  amount: number;
  items: number;
  status: "ordered" | "received" | "cancelled";
  date: ISODate;
}

/* ---------------- Orders ---------------- */

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "refunded" | "failed";
export type PaymentMethod =
  | "card"
  | "credit_card"
  | "debit_card"
  | "upi"
  | "netbanking"
  | "wallet"
  | "cod";

export type PaymentState = "processing" | "success" | "failed" | "pending";

export interface PaymentOrder {
  id: ID;
  orderId?: ID;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentState;
  gatewayRef?: string;
  createdAt: ISODate;
}

export interface PaymentVerification {
  paymentId: ID;
  status: PaymentState;
  message: string;
}

export interface OrderItem {
  id: ID;
  orderId: ID;
  productId: ID;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: ID;
  reference: string;
  userId: ID;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  placedAt: ISODate;
  deliveredAt?: ISODate;
}

export interface CreateOrderInput {
  userId: ID;
  items: { productId: ID; quantity: number }[];
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

/* ---------------- Prescriptions ---------------- */

export type PrescriptionStatus = "pending" | "approved" | "rejected";

export interface Prescription {
  id: ID;
  userId: ID;
  customerName: string;
  fileName: string;
  fileUrl?: string;
  fileType: string;
  fileSize: number;
  status: PrescriptionStatus;
  note?: string;
  reviewedBy?: string;
  uploadedAt: ISODate;
  extractedMedicines?: { name: string; dosage: string }[];
}

/**
 * OCR / AI extraction contract.
 *
 * The backend owns OCR and medicine extraction; the frontend only renders
 * whatever this shape carries, so no UI change is needed once the real
 * service is connected.
 */
export type PrescriptionScanStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "unavailable";

export interface ExtractedMedicine {
  name: string;
  dosage?: string;
  quantity?: number;
  instructions?: string;
  /** Set by the backend when it can map the line to a catalog product. */
  productId?: ID;
  /** 0–1 OCR/AI confidence. */
  confidence?: number;
}


export interface MatchedProduct {
  id: string;
  name: string;
  quantity?: number;
  dosage?: string;
  instructions?: string;
}

export interface PrescriptionScan {
  id: ID;
  prescriptionId: ID;
  status: PrescriptionScanStatus;
  progress?: number;
  medicines: ExtractedMedicine[];
  matchedProducts?: MatchedProduct[];
  rawText?: string;
  message?: string;
  completedAt?: ISODate;
}

/* ---------------- Chatbot ---------------- */

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: ID;
  role: ChatRole;
  content: string;
  createdAt: ISODate;
  /** Backend may attach product/order references for rich replies later. */
  references?: { type: "product" | "order" | "article"; id: ID; label: string }[];
}

export interface ChatReply {
  conversationId: ID;
  message: ChatMessage;
  /** Suggested follow-up prompts the backend can drive. */
  suggestions?: string[];
}

export interface ChatConversation {
  id: ID;
  userId?: ID;
  messages: ChatMessage[];
  updatedAt: ISODate;
}


/* ---------------- Analytics ---------------- */

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pendingPrescriptions: number;
  pendingDeliveries: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface AnalyticsBundle {
  salesTrend: SeriesPoint[];
  revenueTrend: SeriesPoint[];
  topProducts: SeriesPoint[];
  categorySales: SeriesPoint[];
  customerGrowth: SeriesPoint[];
  inventoryReport: SeriesPoint[];
}

/* ---------------- Settings ---------------- */

export interface SiteSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  deliveryFee: number;
  freeDeliveryAbove: number;
  maintenanceMode: boolean;
}

export interface RolePermission {
  id: ID;
  role: string;
  permissions: string[];
}

export interface NotificationSetting {
  id: ID;
  label: string;
  description: string;
  enabled: boolean;
}

/* ---------------- API envelope ---------------- */

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

/* -------------------- DELIVERY TRACKING -------------------- */

export type TrackingStage = "confirmed" | "packed" | "dispatched" | "out_for_delivery" | "delivered";

export interface Rider {
  id: ID;
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface TrackingEvent {
  stage: TrackingStage;
  label: string;
  at: string;
  done: boolean;
  active: boolean;
}

export interface OrderTracking {
  orderId: ID;
  reference: string;
  status: OrderStatus;
  stage: TrackingStage;
  etaMinutes: number;
  etaLabel: string;
  rider: Rider | null;
  destination: string;
  coordinates: { hub: GeoPoint; rider: GeoPoint; destination: GeoPoint };
  timeline: TrackingEvent[];
}
