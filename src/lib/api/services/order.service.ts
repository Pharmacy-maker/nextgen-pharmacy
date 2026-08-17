import { apiFetch, mockDelay } from "../client";
import { supabase } from "../../supabase";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockOrders } from "../mock/db";
import { products } from "../../products";
import type { CreateOrderInput, ID, Order, OrderStatus } from "../../../types/models";

let orders: Order[] = [...mockOrders];

export const orderService = {
  async list(params: { status?: OrderStatus } = {}): Promise<Order[]> {
    if (!USE_MOCK_API) return apiFetch<Order[]>(ENDPOINTS.orders.list, { query: params });
    return mockDelay(params.status ? orders.filter((o) => o.status === params.status) : orders);
  },

  async listMine(userId: ID): Promise<Order[]> {
  if (!USE_MOCK_API) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("placed_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      reference: row.reference,
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      subtotal: Number(row.subtotal ?? 0),
      discount: Number(row.discount ?? 0),
      deliveryFee: Number(row.delivery_fee ?? 0),
      total: Number(row.total ?? 0),
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      shippingAddress: row.shipping_address,
      placedAt: row.placed_at,
      deliveredAt: row.delivered_at,
      items: [],
    }));
  }

  return mockDelay(orders.filter((o) => o.userId === userId));
},

  async get(id: ID): Promise<Order | null> {
    if (!USE_MOCK_API) return apiFetch<Order>(ENDPOINTS.orders.detail(id));
    return mockDelay(orders.find((o) => o.id === id) ?? null);
  },

  async create(input: CreateOrderInput): Promise<Order> {
    if (!USE_MOCK_API) return apiFetch<Order>(ENDPOINTS.orders.create, { method: "POST", body: input });
    const id = `o-${Date.now()}`;
    const items = input.items.map((it, i) => {
      const p = products.find((x) => x.id === it.productId);
      const unitPrice = p ? Math.round(p.price * (1 - p.discount / 100)) : 0;
      return {
        id: `oi-${id}-${i}`,
        orderId: id,
        productId: it.productId,
        productName: p?.name ?? it.productId,
        quantity: it.quantity,
        unitPrice,
        total: unitPrice * it.quantity,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const deliveryFee = subtotal > 499 ? 0 : 40;
    const order: Order = {
      id,
      reference: `RP-${Math.floor(10000 + Math.random() * 89999)}`,
      userId: input.userId,
      customerName: "You",
      customerEmail: "",
      items,
      subtotal,
      discount: 0,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: "pending",
      paymentStatus: input.paymentMethod === "cod" ? "unpaid" : "paid",
      paymentMethod: input.paymentMethod,
      shippingAddress: input.shippingAddress,
      placedAt: new Date().toISOString().slice(0, 10),
    };
    orders = [order, ...orders];
    return mockDelay(order, 500);
  },

  async updateStatus(id: ID, status: OrderStatus): Promise<Order> {
    if (!USE_MOCK_API)
      return apiFetch<Order>(ENDPOINTS.orders.updateStatus(id), { method: "PATCH", body: { status } });
    orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
    return mockDelay(orders.find((o) => o.id === id)!, 300);
  },
};
