import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, LogIn, MapPin, Package, Phone, Truck } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { AsyncBoundary, EmptyState } from "../components/site/AsyncState";
import { orderService, trackingService } from "../lib/api";
import { useAuth } from "../lib/store";
import type { Order, OrderTracking, TrackingStage } from "../types/models";

export const Route = createFileRoute("/delivery")({
  component: DeliveryPage,
  head: () => ({
    meta: [
      { title: "Track Your Orders — Rays Pharmacy" },
      { name: "description", content: "View your Rays Pharmacy orders and follow live delivery tracking from hub to doorstep." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Track Your Orders — Rays Pharmacy" },
      { property: "og:description", content: "Live updates on your Rays Pharmacy deliveries." },
    ],
  }),
});

const STAGE_ICON: Record<TrackingStage, typeof Truck> = {
  confirmed: CheckCircle2,
  packed: Package,
  dispatched: Truck,
  out_for_delivery: Truck,
  delivered: MapPin,
};

function DeliveryPage() {
  const { user, ready } = useAuth();
  const userId = user?.id ?? "";

  const orders = useQuery({
    queryKey: ["me", "orders", userId],
    queryFn: () => orderService.listMine(userId),
    enabled: !!userId,
  });

  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const list = orders.data;
    if (list && list.length > 0 && !list.some((o) => o.id === selected)) setSelected(list[0].id);
  }, [orders.data, selected]);

  if (!ready) {
    return (
      <PageShell>
        <Section eyebrow="Your deliveries" title="Track | Order |" subtitle="Follow every step, from hub to doorstep.">
          <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">Loading your orders…</div>
        </Section>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <Section eyebrow="Your deliveries" title="Track | Order |" subtitle="Sign in to follow your orders in real time.">
          <EmptyState
            title="Sign in to track your orders"
            hint="Delivery tracking is available for your own orders only."
            action={
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            }
          />
        </Section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Section eyebrow="Your deliveries" title="Track | Order |" subtitle="Follow every step, from hub to doorstep.">
        <AsyncBoundary
          isLoading={orders.isLoading}
          error={orders.error}
          data={orders.data}
          onRetry={() => orders.refetch()}
          loadingLabel="Loading your orders…"
          empty={
            <EmptyState
              title="You haven't placed any orders yet"
              hint="Browse our products and place your first order."
              action={
                <Link to="/products" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
                  Shop Now
                </Link>
              }
            />
          }
        >
          {(list) => (
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1 space-y-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground px-1">My orders</div>
                {list.map((o) => (
                  <OrderRow key={o.id} order={o} active={o.id === selected} onSelect={() => setSelected(o.id)} />
                ))}
              </div>
              <div className="lg:col-span-2">
                {selected && <TrackingPanel orderId={selected} userId={userId} />}
              </div>
            </div>
          )}
        </AsyncBoundary>
      </Section>
    </PageShell>
  );
}

function OrderRow({ order, active, onSelect }: { order: Order; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`w-full text-left glass rounded-2xl p-4 transition hover-lift ${active ? "ring-1 ring-cyan/50 bg-white/10" : "hover:bg-white/10"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">#{order.reference}</div>
          <div className="text-xs text-muted-foreground">{order.placedAt} • {order.items.length} item(s)</div>
        </div>
        <span className="text-xs font-semibold capitalize text-neon shrink-0">{order.status}</span>
      </div>
      <div className="mt-2 text-sm tabular-nums">₹{order.total.toLocaleString("en-IN")}</div>
    </button>
  );
}

function TrackingPanel({ orderId, userId }: { orderId: string; userId: string }) {
  const tracking = useQuery({
    queryKey: ["me", "tracking", orderId, userId],
    queryFn: () => trackingService.forOrder(orderId, userId),
  });

  return (
    <AsyncBoundary
      isLoading={tracking.isLoading}
      error={tracking.error}
      data={tracking.data ?? undefined}
      onRetry={() => tracking.refetch()}
      loadingLabel="Loading tracking…"
      empty={<EmptyState title="Tracking unavailable" hint="We couldn't find tracking for this order." />}
    >
      {(t) => <TrackingView tracking={t} />}
    </AsyncBoundary>
  );
}

function TrackingView({ tracking: t }: { tracking: OrderTracking }) {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      <div className="md:col-span-1 glass rounded-3xl p-6">
        <div className="text-sm text-muted-foreground">Order</div>
        <div className="text-2xl font-bold">#{t.reference}</div>
        <div className="mt-6 space-y-4">
          {t.timeline.map((s) => {
            const Icon = STAGE_ICON[s.stage];
            return (
              <div key={s.stage} className="flex gap-3 items-start">
                <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${s.done ? "bg-grad-neon text-black" : "bg-white/5 text-muted-foreground"} ${s.active ? "animate-pulse-glow" : ""}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.at}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-neon" /> ETA <span className="font-semibold">{t.etaLabel}</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Delivering to {t.destination}</div>
      </div>
      <div className="md:col-span-2 rounded-3xl overflow-hidden glass relative min-h-[360px]">
        <div className="absolute inset-0 bg-grad-cool opacity-30" />
        <svg viewBox="0 0 600 400" className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M30 0H0V30" fill="none" stroke="white" strokeOpacity="0.08" />
            </pattern>
          </defs>
          <rect width="600" height="400" fill="url(#grid)" />
          <path d="M40 340 Q 180 260 260 240 T 480 100" stroke="oklch(0.9 0.24 130)" strokeWidth="3" fill="none" strokeDasharray="6 6">
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.2s" repeatCount="indefinite" />
          </path>
          <circle cx="40" cy="340" r="8" fill="oklch(0.72 0.24 350)" />
          <circle cx="480" cy="100" r="10" fill="oklch(0.9 0.24 130)">
            <animate attributeName="r" values="10;14;10" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <g transform="translate(260 236)">
            <circle r="14" fill="oklch(0.68 0.22 260)" />
            <circle r="22" fill="none" stroke="oklch(0.68 0.22 260)" strokeOpacity="0.5">
              <animate attributeName="r" values="22;42;22" dur="2s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
        {t.rider ? (
          <div className="absolute bottom-4 left-4 glass-strong rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-grad-hero grid place-items-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Rider</div>
              <div className="font-semibold">{t.rider.name} • {t.rider.rating} ★</div>
              <a href={`tel:${t.rider.phone.replace(/\s/g, "")}`} className="mt-0.5 inline-flex items-center gap-1 text-xs text-cyan hover:underline">
                <Phone className="h-3 w-3" /> {t.rider.phone}
              </a>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 glass-strong rounded-2xl px-4 py-3 text-sm">
            <div className="text-xs text-muted-foreground">Rider</div>
            <div className="font-semibold capitalize">Assigned once dispatched</div>
          </div>
        )}
      </div>
    </div>
  );
}
