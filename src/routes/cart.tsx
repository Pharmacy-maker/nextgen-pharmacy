import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageShell, Section } from "../components/site/Section";
import { useAuth, useCart } from "../lib/store";
import { ProductImage } from "../components/site/ProductImage";


export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your Cart — Rays Pharmacy" },
      { name: "description", content: "Review your medicines, adjust quantities and proceed to checkout." },
      { property: "og:title", content: "Your Cart — Rays Pharmacy" },
      { property: "og:description", content: "Review your medicines and continue to secure checkout." },
    ],
  }),
});

function CartPage() {
  const { detailed, remove, setQty, subtotal, clear, count } = useCart();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const shipping = subtotal > 0 && subtotal < 499 ? 49 : 0;
  const total = subtotal + shipping;

  const goToCheckout = () => {
    if (ready && !user) {
      toast.error("Please log in or create an account to continue with your purchase.");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
      return;
    }
    navigate({ to: "/checkout" });
  };


  return (
    <PageShell>
      <Section eyebrow="Shopping" title="Your | Cart |" subtitle="Adjust quantities, remove items, or continue shopping.">
        {count === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <div className="text-lg font-semibold">Your cart is empty</div>
            <p className="text-sm text-muted-foreground mt-1">Browse the catalogue and add medicines to get started.</p>
            <Link to="/products" className="inline-block mt-5 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-3">
              {detailed.map(({ product, qty, line }) => (
                <div key={product.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                  <ProductImage src={product.image} seed={product.id} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.category} • {product.manufacturer}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="inline-flex items-center rounded-lg border border-white/10 overflow-hidden">
                        <button
                          onClick={() => setQty(product.id, qty - 1)}
                          className="h-8 w-8 grid place-items-center hover:bg-white/10"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-sm font-semibold min-w-8 text-center">{qty}</span>
                        <button
                          onClick={() => setQty(product.id, qty + 1)}
                          className="h-8 w-8 grid place-items-center hover:bg-white/10"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(product.id)}
                        className="text-xs text-muted-foreground hover:text-pink flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{line}</div>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-pink">
                Clear cart
              </button>
            </div>
            <div className="glass rounded-3xl p-6 h-fit sticky top-24">
              <div className="font-semibold mb-3">Order summary</div>
              <div className="flex justify-between text-sm py-1">
                <span>Subtotal ({count} items)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                <span>Total</span>
                <span className="text-2xl font-bold text-grad-hero">₹{total}</span>
              </div>
              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="mt-4 w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow"
              >
                Proceed to Checkout
              </button>
              <Link to="/products" className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </Section>
    </PageShell>
  );
}
