import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Banknote, CreditCard, Loader2, Truck, Wallet } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { useCart } from "../lib/store";
import { checkoutSchema, toFieldErrors, type FieldErrors } from "../lib/validation";
import { TextField } from "../components/site/FormFields";

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
  const [touched, setTouched] = useState<Record<keyof Form, boolean>>({
    name: false, phone: false, address: false, city: false, pincode: false,
  });
  const [errors, setErrors] = useState<FieldErrors<Form>>({});
  const [pay, setPay] = useState<"UPI" | "Card" | "NetBank" | "COD">("UPI");
  const [slot, setSlot] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const slots = ["Now (30 min)", "Today • 4–6 PM", "Tomorrow • 10 AM", "Tomorrow • 6 PM"];
  const options = [
    { k: "UPI", i: Wallet, label: "UPI" },
    { k: "Card", i: CreditCard, label: "Card" },
    { k: "NetBank", i: Banknote, label: "Net Banking" },
    { k: "COD", i: Truck, label: "Cash on Delivery" },
  ] as const;

  const shipping = subtotal > 0 && subtotal < 499 ? 49 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const validate = (next: Form) => {
    const r = checkoutSchema.safeParse(next);
    if (r.success) {
      setErrors({});
      return true;
    }
    setErrors(toFieldErrors<Form>(r.error));
    return false;
  };

  const setField = <K extends keyof Form>(k: K, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    validate(next);
  };

  const isValid = useMemo(() => checkoutSchema.safeParse(form).success, [form]);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "RAYS10") {
      setDiscount(Math.round(subtotal * 0.1));
      setCouponMsg("Coupon applied: 10% off");
    } else {
      setDiscount(0);
      setCouponMsg("Invalid coupon code");
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0 || submitting) return;
    setTouched({ name: true, phone: true, address: true, city: true, pincode: true });
    if (!validate(form)) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      navigate({ to: "/payment", search: { method: pay, total, slot: slots[slot] } });
    } finally {
      setSubmitting(false);
    }
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
                  <TextField
                    label="Full name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(v) => setField("name", v)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    error={errors.name}
                    touched={touched.name}
                  />
                  <TextField
                    label="Phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={(v) => setField("phone", v.replace(/\D/g, "").slice(0, 10))}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    error={errors.phone}
                    touched={touched.phone}
                  />
                  <div className="sm:col-span-2">
                    <TextField
                      label="Address"
                      autoComplete="street-address"
                      placeholder="House / Street"
                      value={form.address}
                      onChange={(v) => setField("address", v)}
                      onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                      error={errors.address}
                      touched={touched.address}
                    />
                  </div>
                  <TextField
                    label="City"
                    autoComplete="address-level2"
                    placeholder="City"
                    value={form.city}
                    onChange={(v) => setField("city", v)}
                    onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                    error={errors.city}
                    touched={touched.city}
                  />
                  <TextField
                    label="Pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={(v) => setField("pincode", v.replace(/\D/g, "").slice(0, 6))}
                    onBlur={() => setTouched((t) => ({ ...t, pincode: true }))}
                    error={errors.pincode}
                    touched={touched.pincode}
                  />
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
                      aria-pressed={i === slot}
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
                        aria-pressed={active}
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
                  aria-label="Coupon code"
                  className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
                <button type="button" onClick={applyCoupon} className="rounded-xl px-3 py-2 bg-white/10 text-sm font-semibold hover:bg-white/15">
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div className={`mt-2 text-xs ${discount > 0 ? "text-emerald" : "text-pink"}`}>{couponMsg}</div>
              )}
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="mt-4 w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Placing order…" : "Place order"}
              </button>
            </div>
          </form>
        )}
      </Section>
    </PageShell>
  );
}
