import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowLeft, BadgeCheck, Beaker, Building2, CalendarClock, ClipboardList,
  Heart, Minus, Plus, ShieldAlert, Star, Thermometer, Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "../components/site/Section";
import { AsyncBoundary } from "../components/site/AsyncState";
import { ProductImage } from "../components/site/ProductImage";
import { ProductCard } from "../components/site/ProductCard";
import { productService } from "../lib/api";
import { getProductDetails, stockStatus } from "../lib/product-details";
import { discountedPrice } from "../lib/products";
import { useAuth, useCart, useWishlist } from "../lib/store";
import type { Product } from "../types/models";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetailPage,
  head: () => ({
    meta: [
      { title: "Medicine details — Rays Pharmacy" },
      { name: "description", content: "Composition, dosage, warnings, storage and availability for every medicine at Rays Pharmacy." },
      { property: "og:title", content: "Medicine details — Rays Pharmacy" },
      { property: "og:description", content: "Full product information: composition, dosage, usage, side effects and stock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const product = useQuery({ queryKey: ["product", id], queryFn: () => productService.get(id) });
  const all = useQuery({ queryKey: ["products"], queryFn: () => productService.list() });

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 pt-24 md:pt-28 pb-16">
        <Link to="/products" search={{ q: "", tag: "", category: "" }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <AsyncBoundary
          isLoading={product.isLoading}
          error={product.error}
          data={product.data ?? undefined}
          onRetry={() => product.refetch()}
          loadingLabel="Loading product…"
        >
          {(p) => <Detail p={p} related={(all.data ?? []).filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)} />}
        </AsyncBoundary>
      </div>
    </PageShell>
  );
}

function Detail({ p, related }: { p: Product; related: Product[] }) {
  const d = getProductDetails(p);
  const stock = stockStatus(p.stock);
  const price = discountedPrice(p);
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const buyNow = () => {
    add(p.id, qty);
    if (ready && !user) {
      toast.error("Please log in or create an account to continue with your purchase.");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
      return;
    }
    navigate({ to: "/checkout" });
  };

  const toneClass =
    stock.tone === "green" ? "text-emerald" : stock.tone === "amber" ? "text-orange" : "text-pink";

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
        <div className="glass rounded-3xl p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: p.grad }} />
          <ProductImage
            src={p.image}
            seed={p.id}
            alt={p.name}
            className="relative w-full aspect-square object-cover rounded-2xl"
          />
          <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {[
              { i: BadgeCheck, t: "100% genuine" },
              { i: Truck, t: "Same-day delivery" },
              { i: Thermometer, t: "Cold-chain safe" },
              { i: ClipboardList, t: "Pharmacist checked" },
            ].map(({ i: I, t }) => (
              <div key={t} className="glass rounded-xl px-2 py-2 flex items-center gap-1.5">
                <I className="h-3.5 w-3.5 shrink-0 text-cyan" />
                <span className="truncate">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="glass px-2.5 py-1 rounded-full text-[11px] font-semibold">{p.category}</span>
            <span className="glass px-2.5 py-1 rounded-full text-[11px]">{d.form}</span>
            {d.prescriptionRequired ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange/15 text-orange border border-orange/30">
                Prescription required
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald/15 text-emerald border border-emerald/30">
                Over the counter
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{p.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-neon text-neon" />
              <span className="font-semibold text-foreground">{p.rating}</span> ({p.reviews} reviews)
            </span>
            <span className={`font-semibold ${toneClass}`}>{stock.label}</span>
            <span>{d.packSize}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <div className="text-3xl font-bold">₹{price}</div>
            {p.discount > 0 && (
              <>
                <div className="text-base text-muted-foreground line-through">₹{p.price}</div>
                <div className="text-sm font-semibold text-emerald">{p.discount}% off</div>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="glass rounded-xl flex items-center">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="h-10 w-10 grid place-items-center hover:bg-white/10 rounded-l-xl">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" className="h-10 w-10 grid place-items-center hover:bg-white/10 rounded-r-xl">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => add(p.id, qty)}
              disabled={p.stock <= 0}
              className="h-10 px-5 rounded-xl glass text-sm font-semibold hover:bg-white/15 disabled:opacity-50"
            >
              Add to cart
            </button>
            <button
              onClick={buyNow}
              disabled={p.stock <= 0}
              className="h-10 px-5 rounded-xl bg-grad-hero text-white text-sm font-semibold glow disabled:opacity-50"
            >
              Buy now
            </button>
            <button
              onClick={() => toggle(p.id)}
              aria-label={has(p.id) ? "Remove from wishlist" : "Add to wishlist"}
              className="h-10 w-10 rounded-xl glass grid place-items-center hover:bg-white/15"
            >
              <Heart className={`h-4 w-4 ${has(p.id) ? "fill-pink text-pink" : ""}`} />
            </button>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Meta icon={Building2} label="Manufacturer" value={p.manufacturer} />
            <Meta icon={Building2} label="Supplier" value={p.supplier} />
            <Meta icon={CalendarClock} label="Manufacture date" value={p.mfg} />
            <Meta icon={CalendarClock} label="Expiry date" value={p.exp} />
            <Meta icon={Beaker} label="Form" value={d.form} />
            <Meta icon={ClipboardList} label="Units in stock" value={String(p.stock)} />
          </dl>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <Panel title="Description">
          <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
        </Panel>
        <Panel title="Composition / ingredients" icon={Beaker}>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {d.composition.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </Panel>
        <Panel title="Dosage information" icon={ClipboardList}>
          <p className="text-sm text-muted-foreground leading-relaxed">{d.dosage}</p>
        </Panel>
        <Panel title="Usage instructions">
          <p className="text-sm text-muted-foreground leading-relaxed">{d.usage}</p>
        </Panel>
        <Panel title="Warnings & precautions" icon={ShieldAlert}>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {d.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </Panel>
        <Panel title="Possible side effects" icon={AlertTriangle}>
          <div className="flex flex-wrap gap-2">
            {d.sideEffects.map((s) => (
              <span key={s} className="glass px-3 py-1 rounded-full text-xs">{s}</span>
            ))}
          </div>
        </Panel>
        <Panel title="Storage instructions" icon={Thermometer}>
          <p className="text-sm text-muted-foreground leading-relaxed">{d.storage}</p>
        </Panel>
        <Panel title="Prescription requirement" icon={BadgeCheck}>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {d.prescriptionRequired
              ? "A valid doctor's prescription is required. Upload it during checkout — our pharmacist verifies every order before dispatch."
              : "No prescription needed. This product can be purchased over the counter."}
          </p>
          {d.prescriptionRequired && (
            <Link to="/prescription" className="inline-block mt-3 rounded-xl px-4 py-2 bg-grad-hero text-white text-xs font-semibold glow">
              Upload prescription
            </Link>
          )}
        </Panel>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4">More in {p.category}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      )}
    </>
  );
}

function Meta({ icon: I, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2 min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        <I className="h-3.5 w-3.5 shrink-0" /> {label}
      </dt>
      <dd className="text-sm font-medium truncate">{value}</dd>
    </div>
  );
}

function Panel({ title, icon: I, children }: { title: string; icon?: typeof Building2; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <h2 className="font-semibold mb-3 flex items-center gap-2">
        {I && <I className="h-4 w-4 text-cyan" />} {title}
      </h2>
      {children}
    </section>
  );
}
