import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import type {
  ID,
  PaymentMethod,
  PaymentOrder,
  PaymentVerification,
} from "../../../types/models";

/**
 * Payment service — frontend only.
 *
 * Every method mirrors the shape a real gateway integration (Razorpay, Stripe,
 * PayU…) needs, so wiring a backend later means implementing these three
 * endpoints and flipping `VITE_USE_MOCK_API` — no UI changes.
 */

export type CreatePaymentOrderInput = {
  amount: number;
  method: PaymentMethod;
  orderId?: ID;
  currency?: string;
  metadata?: Record<string, string | number>;
};

/** In-memory ledger so status polling works against mock data. */
const ledger = new Map<ID, PaymentOrder>();

function mockStatus(input: CreatePaymentOrderInput): PaymentOrder["status"] {
  if (input.amount <= 0) return "failed";
  return input.method === "cod" ? "pending" : "processing";
}

export const paymentService = {
  /** Creates a payment intent/order on the gateway via our backend. */
  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    if (!USE_MOCK_API) {
      return apiFetch<PaymentOrder>(ENDPOINTS.payments.create, { method: "POST", body: input });
    }
    const id = `pay-${Date.now()}`;
    const order: PaymentOrder = {
      id,
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency ?? "INR",
      method: input.method,
      status: mockStatus(input),
      gatewayRef: `mock_${id}`,
      createdAt: new Date().toISOString(),
    };
    ledger.set(id, order);
    return mockDelay(order, 600);
  },

  /** Confirms the gateway callback signature/result server-side. */
  async verifyPayment(paymentId: ID, gatewayRef?: string): Promise<PaymentVerification> {
    if (!USE_MOCK_API) {
      return apiFetch<PaymentVerification>(ENDPOINTS.payments.verify, {
        method: "POST",
        body: { paymentId, gatewayRef },
      });
    }
    const existing = ledger.get(paymentId);
    if (!existing) {
      return mockDelay(
        { paymentId, status: "failed" as const, message: "Payment reference not found." },
        700,
      );
    }
    /**
     * No fake approvals: without a backend gateway there is nothing that can
     * legitimately confirm a transfer, so online payments stay `pending` until
     * a real verification endpoint replaces this branch. COD is "pending" too —
     * cash is collected at the door.
     */
    const status: PaymentOrder["status"] =
      existing.status === "processing" ? "pending" : existing.status;
    ledger.set(paymentId, { ...existing, status });
    return mockDelay(
      {
        paymentId,
        status,
        message:
          status === "pending" && existing.method === "cod"
            ? "Order confirmed. Payment will be collected on delivery."
            : status === "pending"
              ? "Awaiting payment confirmation. Your order is reserved and will be marked paid once the payment gateway verifies this transaction."
              : "Payment could not be completed.",
      },
      1400,
    );
  },

  /** Polls the current gateway status (used by the pending screen). */
  async fetchPaymentStatus(paymentId: ID): Promise<PaymentOrder | null> {
    if (!USE_MOCK_API) return apiFetch<PaymentOrder>(ENDPOINTS.payments.status(paymentId));
    return mockDelay(ledger.get(paymentId) ?? null, 400);
  },
};
