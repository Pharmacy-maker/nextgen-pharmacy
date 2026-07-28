import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, Package, Truck } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";

export const Route = createFileRoute("/delivery")({
  component: DeliveryPage,
  head: () => ({
    meta: [
      { title: "Delivery Tracking — Rays Pharmacy" },
      { name: "description", content: "Track your Rays Pharmacy order in real time from hub to doorstep." },
      { property: "og:title", content: "Delivery Tracking — Rays Pharmacy" },
      { property: "og:description", content: "Live updates on your Rays Pharmacy delivery." },
    ],
  }),
});

function DeliveryPage() {
  const steps = [
    { icon: CheckCircle2, label: "Order confirmed", time: "10:02 AM", done: true },
    { icon: Package, label: "Packed at hub", time: "10:24 AM", done: true },
    { icon: Truck, label: "Out for delivery", time: "10:58 AM", done: true, active: true },
    { icon: MapPin, label: "Arriving soon", time: "~11:30 AM", done: false },
  ];
  return (
    <PageShell>
      <Section eyebrow="Track in real time" title="Delivery | Tracking |" subtitle="Follow every step, from hub to doorstep.">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 glass rounded-3xl p-6">
            <div className="text-sm text-muted-foreground">Order</div>
            <div className="text-2xl font-bold">#RP-08421</div>
            <div className="mt-6 space-y-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${s.done ? "bg-grad-neon text-black" : "bg-white/5 text-muted-foreground"} ${s.active ? "animate-pulse-glow" : ""}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-neon" /> ETA <span className="font-semibold">27 min</span>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-3xl overflow-hidden glass relative min-h-[360px]">
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
            <div className="absolute bottom-4 left-4 glass-strong rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-grad-hero grid place-items-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Rider</div>
                <div className="font-semibold">Rahul • 4.9 ★</div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
