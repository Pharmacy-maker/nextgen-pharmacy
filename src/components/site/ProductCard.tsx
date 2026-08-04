import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Heart, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { discountedPrice, type Product } from "../../lib/products";
import { useAuth, useCart, useWishlist } from "../../lib/store";
import { ProductImage } from "./ProductImage";

export function ProductCard({ p, compact = false }: { p: Product; compact?: boolean }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const price = discountedPrice(p);
  const wished = has(p.id);

  const buyNow = () => {
    add(p.id, 1);
    if (ready && !user) {
      toast.error("Please log in or create an account to continue with your purchase.");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
      return;
    }
    navigate({ to: "/checkout" });
  };


  return (
    <div className={`group relative rounded-3xl glass hover-lift overflow-hidden flex flex-col ${compact ? "min-w-[220px] sm:min-w-[260px]" : ""}`}>
      <div className="relative h-36 sm:h-44 overflow-hidden" style={{ background: p.grad }}>
        <div className="absolute inset-0 opacity-30 grid-bg" />
        <ProductImage
          src={p.image}
          seed={p.id}
          alt={p.name}
          className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="glass px-2 py-1 rounded-full text-[10px] font-semibold">{p.category}</span>
          {p.discount > 0 && (
            <span className="bg-grad-warm px-2 py-1 rounded-full text-[10px] font-bold text-white">-{p.discount}%</span>
          )}
        </div>
        <button
          onClick={() => toggle(p.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 h-8 w-8 rounded-full glass grid place-items-center hover:bg-white/25 transition"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-pink text-pink" : ""}`} />
        </button>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
          <Link
            to="/product/$id"
            params={{ id: p.id }}
            className="glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1"
          >
            View details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link to="/product/$id" params={{ id: p.id }} className="font-semibold leading-tight hover:text-grad-hero">
            <h3>{p.name}</h3>
          </Link>
          <div className="flex items-center gap-1 text-xs shrink-0">
            <Star className="h-3.5 w-3.5 fill-neon text-neon" />
            <span className="font-semibold">{p.rating}</span>
            <span className="text-muted-foreground">({p.reviews})</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-y-0.5">
          <span>Mfr: {p.manufacturer}</span>
          <span>Sup: {p.supplier}</span>
          <span>Exp: {p.exp}</span>
          <span>Stock: {p.stock}</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-xl font-bold">₹{price}</div>
            {p.discount > 0 && <div className="text-xs text-muted-foreground line-through">₹{p.price}</div>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => add(p.id, 1)}
              className="h-9 w-9 rounded-xl glass grid place-items-center hover:bg-white/15"
              aria-label={`Add ${p.name} to cart`}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={buyNow}
              className="h-9 px-3 rounded-xl bg-grad-hero text-white text-sm font-semibold glow"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
