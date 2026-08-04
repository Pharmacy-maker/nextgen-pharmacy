import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, Section } from "../components/site/Section";
import { AsyncBoundary, EmptyState } from "../components/site/AsyncState";
import { ProductCard } from "../components/site/ProductCard";
import { productService } from "../lib/api";
import { useWishlist } from "../lib/store";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Wishlist — Rays Pharmacy" },
      { name: "description", content: "Your saved medicines and wellness products at Rays Pharmacy." },
      { property: "og:title", content: "Wishlist — Rays Pharmacy" },
      { property: "og:description", content: "Everything you saved for later, ready to add to cart." },
    ],
  }),
});

function WishlistPage() {
  const { ids, count, clear } = useWishlist();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.list(),
  });

  const saved = (data ?? []).filter((p) => ids.includes(p.id));

  return (
    <PageShell>
      <Section
        eyebrow="Saved for later"
        title="Your | Wishlist |"
        subtitle={count > 0 ? `${count} item${count === 1 ? "" : "s"} saved.` : "Tap the heart on any product to save it here."}
      >
        <AsyncBoundary
          isLoading={isLoading}
          error={error}
          data={data}
          onRetry={() => refetch()}
          loadingLabel="Loading wishlist…"
        >
          {() =>
            saved.length === 0 ? (
              <EmptyState
                title="Your wishlist is empty"
                hint="Browse our products and tap the heart icon to save your favourites."
                action={
                  <Link to="/products" search={{ q: "", tag: "", category: "" }} className="inline-block mt-4 rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold glow">
                    Shop now
                  </Link>
                }
              />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {saved.map((p) => <ProductCard key={p.id} p={p} />)}
                </div>
                <div className="mt-8 text-center">
                  <button onClick={clear} className="glass px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-white/15">
                    Clear wishlist
                  </button>
                </div>
              </>
            )
          }
        </AsyncBoundary>
      </Section>
    </PageShell>
  );
}
