import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageShell, Section } from "../components/site/Section";
import { useCart } from "../lib/store";
import { paymentService } from "../lib/api";
import type { PaymentMethod, PaymentState } from "../types/models";

const METHODS = ["upi", "credit_card", "debit_card", "netbanking", "wallet", "cod"] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
  cod: "Cash on Delivery",
};

const searchSchema = z.object({
  method: fallback(z.enum(METHODS), "upi").default("upi"),
  total: fallback(z.number(), 0).default(0),
  slot: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/payment")({
  validateSearch: zodValidator(searchSchema),
  component: PaymentPage,
  head: () => ({
    meta: [
      { title: "Payment — Rays Pharmacy" },
      { name: "description", content: "Confirm and pay for your Rays Pharmacy order securely." },
      { property: "og:title", content: "Payment — Rays Pharmacy" },
      { property: "og:description", content: "Complete your secure payment." },
    ],
  }),
});

type Screen = "idle" | "processing" | "success" | "failed" | "pending";

function PaymentPage() {
  const { method, total, slot } = Route.useSearch();
  const { clear } = useCart();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("idle");
  const [message, setMessage] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const cleared = useRef(false);

  const settle = useCallback(
    (status: PaymentState, note: string) => {
      setMessage(note);
      setScreen(status === "processing" ? "processing" : status);
      if ((status === "success" || status === "pending") && !cleared.current) {
        cleared.current = true;
        clear();
      }
      if (status === "success") toast.success("Payment successful!");
      if (status === "failed") toast.error(note || "Payment failed.");
    },
    [clear],
  );

  const pay = async () => {
    if (screen === "processing" || total <= 0) return;
    setScreen("processing");
    setMessage("");
    try {
      const order = await paymentService.createPaymentOrder({ amount: total, method });
      setPaymentId(order.id);
      const result = await paymentService.verifyPayment(order.id, order.gatewayRef);
      settle(result.status, result.message);
    } catch (err) {
      settle("failed", (err as Error).message || "We couldn't reach the payment service.");
    }
  };

  const refreshStatus = async () => {
    if (!paymentId || checking) return;
    setChecking(true);
    try {
      const current = await paymentService.fetchPaymentStatus(paymentId);
      if (current) settle(current.status, message);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (total <= 0 && screen === "idle") setMessage("");
  }, [total, screen]);

  return (
    <PageShell>
      <Section eyebrow="Almost there" title="Confirm | Payment |">
        <div className="glass rounded-3xl p-6 md:p-10 max-w-2xl mx-auto text-center">
          {screen === "success" ? (
            <>
              <div className="h-16 w-16 rounded-full bg-grad-neon grid place-items-center mx-auto mb-4 glow">
                <CheckCircle2 className="h-8 w-8 text-black" />
              </div>
              <div className="text-2xl font-bold">Order placed!</div>
              <p className="text-sm text-muted-foreground mt-2">
                Thank you for shopping with Rays Pharmacy. Your order will arrive within {slot || "the selected slot"}.
              </p>
              {paymentId && <div className="text-xs text-muted-foreground mt-2">Payment ID: {paymentId}</div>}
              <div className="flex justify-center gap-3 mt-6 flex-wrap">
                <Link to="/delivery" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
                  Track order
                </Link>
                <Link to="/products" className="rounded-xl px-5 py-2.5 glass hover:bg-white/15">
                  Continue shopping
                </Link>
              </div>
            </>
          ) : screen === "pending" ? (
            <>
              <div className="h-16 w-16 rounded-full bg-grad-cool grid place-items-center mx-auto mb-4 glow">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold">Payment pending</div>
              <p className="text-sm text-muted-foreground mt-2">
                {message || "We're waiting for confirmation. Your order is reserved."}
              </p>
              {paymentId && <div className="text-xs text-muted-foreground mt-2">Payment ID: {paymentId}</div>}
              <div className="flex justify-center gap-3 mt-6 flex-wrap">
                <button
                  type="button"
                  onClick={refreshStatus}
                  disabled={checking}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 glass hover:bg-white/15 disabled:opacity-60"
                >
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Check status
                </button>
                <Link to="/delivery" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
                  Track order
                </Link>
              </div>
            </>
          ) : screen === "failed" ? (
            <>
              <div className="h-16 w-16 rounded-full bg-orange/20 grid place-items-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-orange" />
              </div>
              <div className="text-2xl font-bold">Payment failed</div>
              <p className="text-sm text-muted-foreground mt-2">
                {message || "Your payment could not be completed. No money was deducted."}
              </p>
              <div className="flex justify-center gap-3 mt-6 flex-wrap">
                <button
                  type="button"
                  onClick={pay}
                  className="rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow"
                >
                  Retry payment
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/checkout" })}
                  className="rounded-xl px-5 py-2.5 glass hover:bg-white/15"
                >
                  Change method
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">Payment method</div>
              <div className="text-2xl font-bold mb-1">{PAYMENT_METHOD_LABELS[method as PaymentMethod]}</div>
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-3xl font-bold text-grad-hero">₹{total}</div>
              <div className="text-sm text-muted-foreground mt-2">Delivery slot: {slot || "—"}</div>
              {screen === "processing" && (
                <div className="text-xs text-muted-foreground mt-3" role="status" aria-live="polite">
                  Securely contacting the payment gateway…
                </div>
              )}
              <button
                disabled={screen === "processing" || total <= 0}
                onClick={pay}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 bg-grad-hero text-white font-semibold glow disabled:opacity-60"
              >
                {screen === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
                {screen === "processing"
                  ? "Processing…"
                  : method === "cod"
                    ? "Confirm order"
                    : `Pay ₹${total}`}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/checkout" })}
                className="mt-3 block mx-auto text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back to checkout
              </button>
            </>
          )}
        </div>
      </Section>
    </PageShell>
  );
}
