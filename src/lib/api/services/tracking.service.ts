import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { orderService } from "./order.service";
import type { ID, Order, OrderTracking, TrackingStage } from "../../../types/models";

/**
 * Delivery tracking service.
 *
 * The mock branch derives a deterministic, per-order tracking payload from the
 * order itself. When the backend is ready it must return the exact same
 * `OrderTracking` shape (order id, rider, live status, ETA, coordinates and
 * timeline) — no UI change is required.
 */

const RIDERS = [
  { id: "r-1", name: "Rahul Verma", phone: "+91 98450 11221", rating: 4.9, vehicle: "Electric scooter" },
  { id: "r-2", name: "Anjali Nair", phone: "+91 98450 33440", rating: 4.8, vehicle: "Bike • DL 4C 1188" },
  { id: "r-3", name: "Imran Sheikh", phone: "+91 98450 77009", rating: 4.7, vehicle: "Bike • KA 05 AJ 2210" },
];

const STAGE_ORDER: TrackingStage[] = ["confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];

const STAGE_LABEL: Record<TrackingStage, string> = {
  confirmed: "Order confirmed",
  packed: "Packed at hub",
  dispatched: "Dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return h;
}

function reachedIndex(order: Order): number {
  switch (order.status) {
    case "cancelled":
      return 0;
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
}

function buildTracking(order: Order): OrderTracking {
  const seed = hash(order.id);
  const rider = RIDERS[seed % RIDERS.length];
  const reached = reachedIndex(order);
  const baseMinutes = 9 * 60 + (seed % 45);

  const timeline = STAGE_ORDER.map((stage, i) => {
    const minutes = baseMinutes + i * (18 + (seed % 11));
    const hh = Math.floor(minutes / 60) % 24;
    const mm = minutes % 60;
    const ampm = hh >= 12 ? "PM" : "AM";
    const label12 = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${ampm}`;
    return {
      stage,
      label: STAGE_LABEL[stage],
      at: label12,
      done: i <= reached,
      active: i === reached && order.status !== "delivered" && order.status !== "cancelled",
    };
  });

  const etaMinutes = order.status === "delivered" ? 0 : 18 + (seed % 30);

  return {
    orderId: order.id,
    reference: order.reference,
    status: order.status,
    stage: STAGE_ORDER[reached],
    etaMinutes,
    etaLabel:
      order.status === "delivered"
        ? "Delivered"
        : order.status === "cancelled"
          ? "Cancelled"
          : `${etaMinutes} min`,
    rider:
      order.status === "shipped" || order.status === "delivered"
        ? rider
        : null,
    destination: order.shippingAddress,
    coordinates: {
      hub: { lat: 12.9611 + (seed % 20) / 1000, lng: 77.6387 - (seed % 15) / 1000 },
      rider: { lat: 12.9711 + (seed % 12) / 1000, lng: 77.6287 + (seed % 9) / 1000 },
      destination: { lat: 12.9821 + (seed % 17) / 1000, lng: 77.6187 + (seed % 13) / 1000 },
    },
    timeline,
  };
}

export const trackingService = {
  /** Tracking for a single order. `userId` scopes access to the owner. */
  async forOrder(orderId: ID, userId?: ID): Promise<OrderTracking | null> {
    if (!USE_MOCK_API) return apiFetch<OrderTracking>(ENDPOINTS.tracking.detail(orderId));
    const order = await orderService.get(orderId);
    if (!order) return null;
    if (userId && order.userId !== userId) return null;
    return mockDelay(buildTracking(order), 250);
  },

  /** All tracking records for the signed-in customer's own orders. */
  async listMine(userId: ID): Promise<OrderTracking[]> {
    if (!USE_MOCK_API) return apiFetch<OrderTracking[]>(ENDPOINTS.tracking.mine);
    const orders = await orderService.listMine(userId);
    return mockDelay(orders.map(buildTracking), 250);
  },
};
