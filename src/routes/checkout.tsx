import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CreditCard, Landmark, Loader2, MapPin, Plus, Smartphone, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageShell, Section } from "../components/site/Section";
import { useAuth, useCart } from "../lib/store";
import { userService } from "../lib/api";
import { checkoutSchema, emailSchema, toFieldErrors, type FieldErrors } from "../lib/validation";
import { TextField } from "../components/site/FormFields";
import type { Address, PaymentMethod } from "../types/models";


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

type Form = { name: string; email: string; phone: string; address: string; city: string; pincode: string };

const formSchema = checkoutSchema.extend({ email: emailSchema });

const EMPTY_FORM: Form = { name: "", email: "", phone: "", address: "", city: "", pincode: "" };

function CheckoutPage() {
  const { detailed, subtotal, count } = useCart();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [touched, setTouched] = useState<Record<keyof Form, boolean>>({
    name: false, email: false, phone: false, address: false, city: false, pincode: false,
  });
  const [errors, setErrors] = useState<FieldErrors<Form>>({});
  const [pay, setPay] = useState<Exclude<PaymentMethod, "card">>("upi");
  const [slot, setSlot] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [prefilled, setPrefilled] = useState(false);

  /* Guests may browse and fill the cart, but never reach checkout. */
  useEffect(() => {
    if (ready && !user) {
      toast.error("Please log in or create an account to continue with your purchase.");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    }
  }, [ready, user, navigate]);

  const addressesQuery = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => userService.addresses(user!.id),
    enabled: !!user,
  });
  const addresses = useMemo(() => addressesQuery.data ?? [], [addressesQuery.data]);

  /* Prefill profile details (name / email / phone) once the session is known. */
  useEffect(() => {
    if (!user || prefilled) return;
    setPrefilled(true);
    setForm((f) => ({
      ...f,
      name: f.name || user.name,
      email: f.email || user.email,
      phone: f.phone || user.phone || "",
    }));
  }, [user, prefilled]);

  const applyAddress = (a: Address) => {
    setSelectedAddressId(a.id);
    setShowNewAddress(false);
    setForm((f) => ({
      ...f,
      phone: a.phone || f.phone,
      address: a.line1,
      city: a.city,
      pincode: a.pincode,
    }));
  };

  /* Auto-select the default saved address. */
  useEffect(() => {
    if (selectedAddressId || showNewAddress || addresses.length === 0) return;
    const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (preferred) applyAddress(preferred);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const slots = ["Now (30 min)", "Today • 4–6 PM", "Tomorrow • 10 AM", "Tomorrow • 6 PM"];
  const options = [
    { k: "upi", i: Smartphone, label: "UPI" },
    { k: "credit_card", i: CreditCard, label: "Credit Card" },
    { k: "debit_card", i: Banknote, label: "Debit Card" },
    { k: "netbanking", i: Landmark, label: "Net Banking" },
    { k: "wallet", i: Wallet, label: "Wallet" },
    { k: "cod", i: Truck, label: "Cash on Delivery" },
  ] as const satisfies readonly { k: Exclude<PaymentMethod, "card">; i: typeof Wallet; label: string }[];

  const shipping = subtotal > 0 && subtotal < 499 ? 49 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const validate = (next: Form) => {
    const r = formSchema.safeParse(next);
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

  const isValid = useMemo(() => formSchema.safeParse(form).success, [form]);


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
    setTouched({ name: true, email: true, phone: true, address: true, city: true, pincode: true });
    if (!validate(form) || !user) return;
    setSubmitting(true);
    try {
      /* Save the address book entry so it can be reused for future orders. */
      const isNew =
        !selectedAddressId ||
        !addresses.some(
          (a) => a.id === selectedAddressId && a.line1 === form.address && a.pincode === form.pincode,
        );
      if (isNew && saveAddress) {
        try {
          await userService.addAddress(user.id, {
            label: addresses.length === 0 ? "Home" : "Other",
            line1: form.address,
            city: form.city,
            pincode: form.pincode,
            phone: form.phone,
            isDefault: addresses.length === 0,
          });
          await queryClient.invalidateQueries({ queryKey: ["addresses", user.id] });
        } catch {
          toast.error("We couldn't save this address, but your order can continue.");
        }
      }
      try {
        localStorage.setItem(
          "rays:pending-order",
          JSON.stringify({
            shippingAddress: `${form.address}, ${form.city} ${form.pincode}`,
            customerName: form.name,
            email: form.email,
            phone: form.phone,
          }),
        );
      } catch {
        /* storage unavailable — order is still created with a fallback address */
      }
      navigate({ to: "/payment", search: { method: pay, total, slot: slots[slot] } });
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || !user) {
    return (
      <PageShell>
        <Section eyebrow="Secure checkout" title="Sign | in |" subtitle="Please log in or create an account to continue with your purchase.">
          <div className="glass rounded-3xl p-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <div className="mt-4 text-sm text-muted-foreground">Taking you to the login page…</div>
            <Link to="/login" search={{ redirect: "/checkout" }} className="inline-block mt-5 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
              Log in / Sign up
            </Link>
          </div>
        </Section>
      </PageShell>
    );
  }


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
                {addresses.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    {addresses.map((a) => {
                      const active = a.id === selectedAddressId && !showNewAddress;
                      return (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() => applyAddress(a)}
                          aria-pressed={active}
                          className={`text-left rounded-2xl p-4 border transition ${
                            active ? "border-transparent bg-grad-cool text-white glow" : "border-white/10 glass hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <MapPin className="h-4 w-4" /> {a.label}
                            {a.isDefault && <span className="text-[10px] uppercase opacity-70">Default</span>}
                          </div>
                          <div className="text-xs mt-1 opacity-80">
                            {a.line1}, {a.city} {a.pincode}
                          </div>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAddress(true);
                        setSelectedAddressId(null);
                        setForm((f) => ({ ...f, address: "", city: "", pincode: "" }));
                      }}
                      aria-pressed={showNewAddress}
                      className={`text-left rounded-2xl p-4 border transition ${
                        showNewAddress ? "border-transparent bg-grad-cool text-white glow" : "border-white/10 glass hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Plus className="h-4 w-4" /> Add new address
                      </div>
                      <div className="text-xs mt-1 opacity-80">Save it for future orders</div>
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    You don't have a saved delivery address yet — add one below and we'll keep it for future orders.
                  </p>
                )}
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
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(v) => setField("email", v)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    error={errors.email}
                    touched={touched.email}
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
