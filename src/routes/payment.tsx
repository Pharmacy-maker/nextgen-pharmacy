import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { useCart } from "../lib/store";
import { toast } from "sonner";

const searchSchema = z.object({
  method: fallback(z.string(), "UPI").default("UPI"),
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

function PaymentPage() {
  const { method, total, slot } = Route.useSearch();
  const { clear } = useCart();
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    if (state !== "processing") return;
    const id = setTimeout(() => {
      setState("success");
      clear();
      toast.success("Payment successful!");
    }, 1800);
    return () => clearTimeout(id);
  }, [state, clear]);

  return (
    <PageShell>
      <Section eyebrow="Almost there" title="Confirm | Payment |">
        <div className="glass rounded-3xl p-6 md:p-10 max-w-2xl mx-auto text-center">
          {state === "success" ? (
            <>
              <div className="h-16 w-16 rounded-full bg-grad-neon grid place-items-center mx-auto mb-4 glow">
                <CheckCircle2 className="h-8 w-8 text-black" />
              </div>
              <div className="text-2xl font-bold">Order placed!</div>
              <p className="text-sm text-muted-foreground mt-2">
                Thank you for shopping with Rays Pharmacy. Your order will arrive within {slot || "the selected slot"}.
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Link to="/delivery" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
                  Track order
                </Link>
                <Link to="/products" className="rounded-xl px-5 py-2.5 glass hover:bg-white/15">
                  Continue shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">Payment method</div>
              <div className="text-2xl font-bold mb-1">{method}</div>
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-3xl font-bold text-grad-hero">₹{total}</div>
              <div className="text-sm text-muted-foreground mt-2">Delivery slot: {slot || "—"}</div>
              <button
                disabled={state === "processing" || total === 0}
                onClick={() => setState("processing")}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 bg-grad-hero text-white font-semibold glow disabled:opacity-60"
              >
                {state === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
                {state === "processing" ? "Processing…" : `Pay ₹${total}`}
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
