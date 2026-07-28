import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, CreditCard, Truck, Wallet } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { useCart } from "../lib/store";
import { checkoutSchema, toFieldErrors, type FieldErrors } from "../lib/validation";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout — Rays Pharmacy" },
      { name: "description", content: "Enter delivery details and choose your payment method to complete your order." },
      { property: "og:title", content: "Checkout — Rays Pharmacy" },
      { property: "og:description", content: "Fast, secure checkout with multiple payment options." },
    ],
  }),
});

type Form = { name: string; phone: string; address: string; city: string; pincode: string };

function CheckoutPage() {
  const { detailed, subtotal, count } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({ name: "", phone: "", address: "", city: "", pincode: "" });
  const [errors, setErrors] = useState<FieldErrors<Form>>({});
  const [pay, setPay] = useState<"UPI" | "Card" | "NetBank" | "COD">("UPI");
  const [slot, setSlot] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const slots = ["Now (30 min)", "Today • 4–6 PM", "Tomorrow • 10 AM", "Tomorrow • 6 PM"];
  const options = [
    { k: "UPI", i: Wallet, label: "UPI" },
    { k: "Card", i: CreditCard, label: "Card" },
    { k: "NetBank", i: Banknote, label: "Net Banking" },
    { k: "COD", i: Truck, label: "Cash on Delivery" },
  ] as const;

  const shipping = subtotal > 0 && subtotal < 499 ? 49 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const update = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    const single = checkoutSchema.pick({ [k]: true } as never).safeParse({ [k]: v });
    setErrors((e) => ({ ...e, [k]: single.success ? undefined : single.error.issues[0]?.message }));
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "RAYS10") {
      setDiscount(Math.round(subtotal * 0.1));
      setCouponMsg("Coupon applied: 10% off");
    } else {
      setDiscount(0);
      setCouponMsg("Invalid coupon code");
    }
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0) return;
    const r = checkoutSchema.safeParse(form);
    if (!r.success) {
      setErrors(toFieldErrors<Form>(r.error));
      return;
    }
    navigate({ to: "/payment", search: { method: pay, total, slot: slots[slot] } });
  };

  return (
    <PageShell>
      <Section eyebrow="Seamless checkout" title="Modern | Payments |" subtitle="Pay how you love — with a checkout that just feels right.">
        {count === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <div className="text-lg font-semibold">Your cart is empty</div>
            <Link to="/products" className="inline-block mt-4 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
              Browse products
            </Link>
          </div>
        ) : (
          <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-5" noValidate>
            <div className="lg:col-span-2 space-y-5">
              <div className="glass rounded-3xl p-6">
                <div className="font-semibold mb-3">Delivery address</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Full name" error={errors.name}>
                    <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls(!!errors.name)} placeholder="Jane Doe" />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <input value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputCls(!!errors.phone)} placeholder="10-digit number" inputMode="numeric" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address" error={errors.address}>
                      <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls(!!errors.address)} placeholder="House / Street" />
                    </Field>
                  </div>
                  <Field label="City" error={errors.city}>
                    <input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls(!!errors.city)} placeholder="City" />
                  </Field>
                  <Field label="Pincode" error={errors.pincode}>
                    <input value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className={inputCls(!!errors.pincode)} placeholder="6-digit pincode" inputMode="numeric" />
                  </Field>
                </div>
              </div>
              <div className="glass rounded-3xl p-6">
                <div className="font-semibold mb-3">Delivery slot</div>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s, i) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSlot(i)}
                      className={`px-4 py-2 rounded-xl text-sm border transition ${
                        i === slot ? "bg-grad-hero text-white border-transparent glow" : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass rounded-3xl p-6">
                <div className="font-semibold mb-3">Payment method</div>
                <div className="grid sm:grid-cols-4 gap-3">
                  {options.map((o) => {
                    const Icon = o.i;
                    const active = pay === o.k;
                    return (
                      <button
                        type="button"
                        key={o.k}
                        onClick={() => setPay(o.k)}
                        className={`rounded-2xl p-4 border transition text-left ${
                          active ? "border-transparent bg-grad-cool text-white glow" : "border-white/10 glass hover:bg-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-2" />
                        <div className="text-sm font-semibold">{o.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 h-fit sticky top-24">
              <div className="font-semibold mb-3">Order summary</div>
              <div className="space-y-2 text-sm max-h-56 overflow-y-auto pr-1">
                {detailed.map(({ product, qty, line }) => (
                  <div key={product.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {product.name} × {qty}
                    </span>
                    <span className="text-muted-foreground">₹{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald"><span>Discount</span><span>-₹{discount}</span></div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                <span>Total</span>
                <span className="text-2xl font-bold text-grad-hero">₹{total}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon (try RAYS10)"
                  className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
                <button type="button" onClick={applyCoupon} className="rounded-xl px-3 py-2 bg-white/10 text-sm font-semibold">
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div className={`mt-2 text-xs ${discount > 0 ? "text-emerald" : "text-pink"}`}>{couponMsg}</div>
              )}
              <button type="submit" className="mt-4 w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow">
                Place order
              </button>
            </div>
          </form>
        )}
      </Section>
    </PageShell>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-white/5 rounded-xl px-3 py-2.5 border ${hasError ? "border-pink/60" : "border-white/10"} focus:outline-none focus:ring-2 focus:ring-primary/60`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-pink mt-1">{error}</span>}
    </label>
  );
}
