import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Upload, Sparkles, Brain, Baby, Dog, Zap, Shield, Sun, Droplet, Leaf, Activity, Smile, Flower2,
  HeartPulse, ChevronRight, ChevronLeft, Truck, MapPin, Package, Clock, CheckCircle2,
  TrendingUp, DollarSign, Users, BarChart3, ArrowRight,
  CreditCard, Wallet, Banknote,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import heroPharmacy from "../assets/hero-pharmacy.jpg.asset.json";
import { Section } from "../components/site/Section";
import { ProductCard } from "../components/site/ProductCard";
import { products } from "../lib/products";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Rays Pharmacy — Your Future Pharmacy Starts Here" },
      { name: "description", content: "AI-powered medicine discovery, trusted healthcare products, and seamless online pharmacy experience." },
      { property: "og:title", content: "Rays Pharmacy — Your Future Pharmacy" },
      { property: "og:description", content: "Premium AI-powered pharmacy platform with instant prescription scanning." },
    ],
  }),
});

/* -------------------- HERO -------------------- */
function HeroDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setMouse({ x: nx, y: ny }));
    };
    el.addEventListener("mousemove", onMove);
    return () => { el.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const parallax = (depth = 20) => ({
    transform: `translate3d(${mouse.x * depth}px, ${mouse.y * depth}px, 0)`,
    transition: "transform 400ms cubic-bezier(.2,.7,.2,1)",
    willChange: "transform",
  });

  const badges = [
    { label: "50,000+ Medicines", delay: 0.5 },
    { label: "Trusted by 2M+ Customers", delay: 0.7 },
    { label: "AI Prescription Scanner", delay: 0.9 },
    { label: "24/7 Pharmacist Support", delay: 1.1 },
  ];

  return (
    <div
      ref={ref}
      className="relative w-full h-[560px] md:h-[680px] overflow-hidden rounded-3xl border border-white/10"
      style={{ background: "radial-gradient(120% 80% at 20% 10%, oklch(0.22 0.08 260) 0%, oklch(0.12 0.04 265) 55%, oklch(0.09 0.03 265) 100%)" }}
    >
      <div className="absolute inset-0 opacity-80 animate-gradient"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 20%, oklch(0.55 0.2 260 / 0.55), transparent 60%)," +
            "radial-gradient(45% 40% at 85% 30%, oklch(0.7 0.18 200 / 0.5), transparent 65%)," +
            "radial-gradient(60% 50% at 60% 90%, oklch(0.55 0.22 300 / 0.45), transparent 65%)",
          backgroundSize: "200% 200%",
        }}
      />
      <div className="absolute -top-40 left-1/4 h-[520px] w-[220px] rotate-12 blur-3xl opacity-40"
        style={{ background: "linear-gradient(180deg, oklch(0.85 0.16 210 / 0.6), transparent)" }} />
      <div className="absolute -top-40 right-1/3 h-[420px] w-[160px] -rotate-6 blur-3xl opacity-30"
        style={{ background: "linear-gradient(180deg, oklch(0.85 0.2 265 / 0.55), transparent)" }} />

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 26 }).map((_, i) => {
          const size = 3 + ((i * 7) % 9);
          return (
            <div key={i} className="absolute rounded-full"
              style={{
                top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`,
                width: size, height: size, background: "white",
                opacity: 0.15 + ((i % 5) * 0.08), filter: "blur(1.5px)",
                boxShadow: "0 0 14px rgba(255,255,255,0.55)",
                animation: `float-y ${6 + (i % 6)}s ease-in-out infinite`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          );
        })}
      </div>

      <div className="absolute inset-0 grid-bg opacity-[0.08]" />

      <div className="absolute inset-y-0 right-0 w-[62%] md:w-[58%] pointer-events-none" style={parallax(18)}>
        <div className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroPharmacy.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
            maskImage: "linear-gradient(to right, transparent 0%, black 22%, black 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 22%, black 100%)",
          }}
        />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(60% 60% at 60% 40%, oklch(0.75 0.18 210 / 0.15), transparent 70%)", mixBlendMode: "screen" }} />
      </div>

      <div className="absolute top-10 right-6 md:right-10 hidden sm:block glass-strong rounded-2xl p-4 w-64 animate-rise z-20"
        style={{ ...parallax(28), animationDelay: "0.4s" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-grad-cool grid place-items-center"><Brain className="h-4 w-4 text-white" /></div>
          <div className="text-sm font-semibold">AI Recommendation</div>
        </div>
        <div className="text-xs text-white/70 mb-3">Based on your health needs &amp; history</div>
        <Link to="/products" className="w-full block text-center text-xs font-medium rounded-lg glass px-3 py-2 hover:bg-white/10 transition-colors">
          View Suggestions →
        </Link>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-2xl">
        <div className="glass rounded-full pl-2 pr-4 py-1.5 text-xs md:text-sm mb-6 inline-flex items-center gap-2 animate-rise w-fit">
          <span className="h-6 px-2 rounded-full bg-grad-cool text-[10px] font-semibold text-white grid place-items-center">
            <Sparkles className="h-3 w-3" />
          </span>
          AI-Powered Pharmacy
          <span className="h-3 w-px bg-white/20" />
          <span className="text-white/70">Trusted by 2M+ users</span>
        </div>

        <h1 className="font-display font-bold leading-[1.02] tracking-[-0.03em] text-5xl md:text-6xl lg:text-7xl animate-rise" style={{ animationDelay: "0.1s" }}>
          Your Future<br />Pharmacy<br /><span className="text-grad-cool">Starts Here.</span>
        </h1>

        <p className="mt-5 text-base md:text-lg text-white/75 max-w-lg animate-rise" style={{ animationDelay: "0.2s" }}>
          AI-powered medicine discovery, trusted healthcare products, and a seamless online pharmacy experience.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: "0.3s" }}>
          <Link to="/products" className="group relative inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white bg-grad-hero glow overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0">
            <span className="absolute inset-0 rounded-2xl bg-grad-hero blur-xl opacity-60 -z-10 group-hover:opacity-95 transition" />
            <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
              style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "gradient-shift 2.5s linear infinite" }} />
            <span className="relative z-10 inline-flex items-center gap-2">Explore Medicines <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <Link to="/prescription" className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold glass-strong hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5">
            <Upload className="h-4 w-4" /> Upload Prescription
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 z-10 hidden md:flex flex-wrap gap-2 justify-between glass-strong rounded-2xl px-4 py-3">
        {badges.map((b, i) => (
          <div key={b.label} className="flex items-center gap-2 text-xs md:text-sm text-white/85 animate-rise" style={{ animationDelay: `${b.delay}s` }}>
            <span className="h-6 w-6 rounded-full bg-grad-cool grid place-items-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-medium whitespace-nowrap">{b.label}</span>
            {i < badges.length - 1 && <span className="hidden lg:inline h-4 w-px bg-white/10 ml-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- CATEGORIES -------------------- */
const categories = [
  { name: "Diabetes", icon: Droplet, from: "var(--cyan)", to: "var(--electric)" },
  { name: "Cardiac", icon: HeartPulse, from: "var(--pink)", to: "var(--purple)" },
  { name: "Stomach", icon: Activity, from: "var(--orange)", to: "var(--pink)" },
  { name: "Cancer Care", icon: Shield, from: "var(--purple)", to: "var(--electric)" },
  { name: "Pain Relief", icon: Zap, from: "var(--orange)", to: "var(--neon)" },
  { name: "Kidney", icon: Droplet, from: "var(--emerald)", to: "var(--cyan)" },
  { name: "Dental", icon: Smile, from: "var(--cyan)", to: "var(--emerald)" },
  { name: "Sexual Wellness", icon: Flower2, from: "var(--pink)", to: "var(--orange)" },
  { name: "Women Care", icon: Flower2, from: "var(--purple)", to: "var(--pink)" },
  { name: "Baby Care", icon: Baby, from: "var(--cyan)", to: "var(--purple)" },
  { name: "Pet Care", icon: Dog, from: "var(--orange)", to: "var(--emerald)" },
  { name: "Energy", icon: Zap, from: "var(--neon)", to: "var(--orange)" },
  { name: "Immunity", icon: Shield, from: "var(--emerald)", to: "var(--neon)" },
  { name: "Skin Care", icon: Sun, from: "var(--pink)", to: "var(--orange)" },
  { name: "Vitamins", icon: Leaf, from: "var(--emerald)", to: "var(--cyan)" },
];

function Categories() {
  return (
    <Section id="categories" eyebrow="Shop by need" title="Featured Categories" subtitle="From daily essentials to specialised care — beautifully organised.">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.name} to="/products" search={{ category: c.name }}
              className="group relative rounded-2xl p-5 glass hover-lift overflow-hidden cursor-pointer block">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }} />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl grid place-items-center mb-3" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="font-semibold group-hover:text-white transition-colors">{c.name}</div>
                <div className="text-xs text-muted-foreground group-hover:text-white/80 mt-1 flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------- CAROUSELS -------------------- */
function Carousel({ title, eyebrow, tag }: { title: string; eyebrow: string; tag?: string }) {
  const scRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  const list = tag ? products.filter((p) => p.tags?.includes(tag)) : products;
  const items = list.length >= 4 ? list : [...list, ...products].slice(0, Math.max(8, list.length));
  return (
    <Section eyebrow={eyebrow} title={title}>
      <div className="relative">
        <div ref={scRef} className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((p, i) => (
            <div key={`${p.id}-${i}`} className="snap-start"><ProductCard p={p} compact /></div>
          ))}
        </div>
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-strong grid place-items-center hover:bg-white/20" aria-label="Scroll left">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-strong grid place-items-center hover:bg-white/20" aria-label="Scroll right">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Section>
  );
}

function BestSellers() {
  const best = products.filter((p) => p.tags?.includes("best")).slice(0, 4);
  return (
    <Section eyebrow="Loved by millions" title="Best Sellers" subtitle="The most purchased medicines this month.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {(best.length ? best : products.slice(0, 4)).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </Section>
  );
}

/* -------------------- PRESCRIPTION TEASER -------------------- */
function PrescriptionUploadTeaser() {
  const navigate = useNavigate();
  return (
    <Section eyebrow="AI Vision" title="Upload Your | Prescription |" subtitle="Drop a photo — our AI extracts medicines, dosages, and finds the best price in seconds.">
      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div className="relative rounded-3xl p-10 border-2 border-dashed border-white/15 glass">
          <div className="text-center flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-grad-hero grid place-items-center glow">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="font-semibold text-lg">Drop prescription here</div>
              <div className="text-muted-foreground text-sm">JPG, JPEG, PNG or PDF • up to 5MB</div>
            </div>
            <button onClick={() => navigate({ to: "/prescription" })} className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
              <Sparkles className="h-4 w-4" /> Open AI Scanner
            </button>
          </div>
        </div>
        <div className="rounded-3xl glass p-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple/40 blur-3xl" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Brain className="h-4 w-4 text-neon" /> AI extraction preview
          </div>
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">1 pack • as prescribed</div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald" />
            </div>
          ))}
          <Link to="/prescription" className="mt-4 block text-center rounded-xl py-2.5 bg-grad-cool text-white font-semibold">
            Try it now
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* -------------------- DELIVERY -------------------- */
function DeliveryTracking() {
  const steps = [
    { icon: CheckCircle2, label: "Order confirmed", time: "10:02 AM", done: true },
    { icon: Package, label: "Packed at hub", time: "10:24 AM", done: true },
    { icon: Truck, label: "Out for delivery", time: "10:58 AM", done: true, active: true },
    { icon: MapPin, label: "Arriving soon", time: "~11:30 AM", done: false },
  ];
  return (
    <Section eyebrow="Track in real time" title="Delivery Tracking" subtitle="Follow every step, from hub to doorstep.">
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
          <Link to="/delivery" className="mt-6 inline-flex items-center gap-2 text-sm text-neon">
            Full tracking <ArrowRight className="h-3 w-3" />
          </Link>
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
  );
}

/* -------------------- ANALYTICS -------------------- */
const salesData = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  sales: 40 + Math.round(Math.sin(i / 2) * 20 + i * 5),
  revenue: 60 + Math.round(Math.cos(i / 2) * 20 + i * 6),
}));
const categoryData = [
  { name: "Cardiac", v: 34, c: "oklch(0.72 0.24 350)" },
  { name: "Diabetes", v: 28, c: "oklch(0.82 0.16 200)" },
  { name: "Immunity", v: 22, c: "oklch(0.9 0.24 130)" },
  { name: "Skin Care", v: 16, c: "oklch(0.65 0.25 300)" },
];
const dailyOrders = Array.from({ length: 7 }, (_, i) => ({
  d: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  o: 120 + ((i * 37) % 80),
}));
function Analytics() {
  return (
    <Section eyebrow="Admin insights" title="Analytics | Dashboard |" subtitle="A live snapshot of your pharmacy performance.">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Revenue", v: "₹4.82L", d: "+12.4%", i: DollarSign, g: "var(--grad-cool)" },
          { l: "Orders", v: "2,148", d: "+8.1%", i: Package, g: "var(--grad-warm)" },
          { l: "Customers", v: "18.6K", d: "+5.7%", i: Users, g: "var(--grad-neon)" },
          { l: "Growth", v: "+24%", d: "MoM", i: TrendingUp, g: "var(--grad-hero)" },
        ].map((k) => {
          const Icon = k.i;
          return (
            <div key={k.l} className="rounded-2xl p-5 glass hover-lift relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl" style={{ background: k.g }} />
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: k.g }}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-emerald font-semibold">{k.d}</span>
              </div>
              <div className="mt-4 text-2xl font-bold">{k.v}</div>
              <div className="text-xs text-muted-foreground">{k.l}</div>
            </div>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl glass p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Monthly Sales & Revenue</div>
              <div className="text-xs text-muted-foreground">Last 12 months</div>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.22 260)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.68 0.22 260)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.24 350)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.72 0.24 350)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="m" stroke="oklch(0.72 0.02 260)" fontSize={12} />
                <YAxis stroke="oklch(0.72 0.02 260)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.04 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.72 0.24 350)" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.68 0.22 260)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl glass p-5">
          <div className="font-semibold mb-2">Category share</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} dataKey="v" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {categoryData.map((c, i) => <Cell key={i} fill={c.c} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.04 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.c }} />
                  {c.name}
                </div>
                <span className="text-muted-foreground">{c.v}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-3xl glass p-5">
          <div className="font-semibold mb-3">Daily orders</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="d" stroke="oklch(0.72 0.02 260)" fontSize={12} />
                <YAxis stroke="oklch(0.72 0.02 260)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.04 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Bar dataKey="o" radius={[8, 8, 0, 0]} fill="oklch(0.82 0.16 200)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl glass p-5">
          <div className="font-semibold mb-3">Low stock alerts</div>
          <div className="space-y-3">
            {products.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{r.name}</div>
                  <div className="h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                    <div className="h-full bg-grad-warm" style={{ width: `${Math.min(100, (r.stock % 20) * 6)}%` }} />
                  </div>
                </div>
                <span className="ml-3 text-xs text-orange font-semibold">{r.stock % 20} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------- CHECKOUT TEASER -------------------- */
function CheckoutTeaser() {
  const [pay, setPay] = useState<"UPI" | "Card" | "NetBank" | "COD">("UPI");
  const options = [
    { k: "UPI", i: Wallet, label: "UPI" },
    { k: "Card", i: CreditCard, label: "Card" },
    { k: "NetBank", i: Banknote, label: "Net Banking" },
    { k: "COD", i: Truck, label: "Cash on Delivery" },
  ] as const;
  return (
    <Section eyebrow="Seamless checkout" title="Modern | Payments |" subtitle="Pay how you love — with a checkout that just feels right.">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="font-semibold mb-3">Payment methods we support</div>
          <div className="grid sm:grid-cols-4 gap-3">
            {options.map((o) => {
              const Icon = o.i;
              const active = pay === o.k;
              return (
                <button type="button" key={o.k} onClick={() => setPay(o.k)}
                  className={`rounded-2xl p-4 border transition text-left ${active ? "border-transparent bg-grad-cool text-white glow" : "border-white/10 glass hover:bg-white/10"}`}>
                  <Icon className="h-5 w-5 mb-2" />
                  <div className="text-sm font-semibold">{o.label}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <div className="font-semibold mb-2">Ready to check out?</div>
          <p className="text-sm text-muted-foreground">Complete your purchase with delivery details, coupons and secure payment.</p>
          <Link to="/checkout" className="mt-4 inline-block w-full text-center py-3 rounded-2xl bg-grad-hero text-white font-semibold glow">
            Go to Checkout
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* -------------------- STATS -------------------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const dur = 1600;
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

function Stats() {
  return (
    <section className="px-4 -mt-6">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Medicines", v: 42000, s: "+" },
          { l: "Cities served", v: 320, s: "+" },
          { l: "Happy customers", v: 2000000, s: "+" },
          { l: "Avg. rating", v: 49, s: "/50" },
        ].map((k) => (
          <div key={k.l} className="glass rounded-2xl p-5 text-center hover-lift">
            <div className="text-2xl md:text-3xl font-bold text-grad-hero"><Counter to={k.v} suffix={k.s} /></div>
            <div className="text-xs text-muted-foreground mt-1">{k.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------- LANDING -------------------- */
function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-purple/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-pink/20 blur-3xl" />
      </div>
      <main className="pt-24 md:pt-28">
        <div className="px-4">
          <div className="mx-auto max-w-7xl">
            <HeroDashboard />
          </div>
        </div>
        <div className="h-8" />
        <Stats />
        <Categories />
        <Carousel title="New Launches" eyebrow="Fresh on Rays Pharmacy" tag="new" />
        <Carousel title="Trending Now" eyebrow="What's hot" tag="trending" />
        <BestSellers />
        <PrescriptionUploadTeaser />
        <DeliveryTracking />
        <Analytics />
        <CheckoutTeaser />
      </main>
    </div>
  );
}
