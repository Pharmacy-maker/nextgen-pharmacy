import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Search, Bell, User, ShoppingCart, Upload, Sparkles, Bot, Send,
  Pill, HeartPulse, Stethoscope, Brain, Bone, Baby, Dog, Zap,
  Shield, Sun, Droplet, Leaf, Activity, Smile, Flower2,
  Star, ChevronRight, ChevronLeft, Plus, Minus, Truck, MapPin,
  Package, Clock, CheckCircle2, TrendingUp, DollarSign, Users,
  BarChart3, Menu, X, ArrowRight, Flame, Timer, Filter,
  CreditCard, Wallet, Banknote, Instagram, Twitter, Facebook, Youtube,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Rays Pharmacy — Your Future Pharmacy Starts Here" },
      {
        name: "description",
        content:
          "AI-powered medicine discovery, trusted healthcare products, and seamless online pharmacy experience.",
      },
      { property: "og:title", content: "Rays Pharmacy — Your Future Pharmacy" },
      {
        property: "og:description",
        content: "Premium AI-powered pharmacy platform with instant prescription scanning.",
      },
    ],
  }),
});

/* -------------------- HEADER -------------------- */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const nav = ["Home", "Products", "Categories", "About", "Contact", "Delivery", "Prescription", "Cart", "Login"];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
      <div className={`mx-auto max-w-7xl px-4 transition-all ${scrolled ? "" : ""}`}>
        <div className={`glass-strong rounded-2xl px-4 md:px-6 py-3 flex items-center gap-4 ${scrolled ? "glow" : ""}`}>
          <a href="#" className="flex items-center gap-2 shrink-0">
            <div className="relative h-9 w-9 rounded-xl bg-grad-hero grid place-items-center glow">
              <Pill className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-grad-hero blur-xl opacity-60 -z-10" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Rays Pharmacy</span>
          </a>
          <nav className="hidden lg:flex items-center gap-1 mx-2">
            {nav.map((n) => (
              <a key={n} href="#" className="px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                {n}
              </a>
            ))}
          </nav>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search medicines…"
                className="w-56 bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
            <IconBtn><Bell className="h-4 w-4" /><span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink" /></IconBtn>
            <IconBtn><User className="h-4 w-4" /></IconBtn>
            <IconBtn>
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-[10px] bg-grad-warm grid place-items-center font-semibold text-white">3</span>
            </IconBtn>
          </div>
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-3 flex flex-col animate-rise">
            {nav.map((n) => (
              <a key={n} href="#" className="px-3 py-2 rounded-lg text-sm hover:bg-white/5">{n}</a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="relative h-9 w-9 grid place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      {children}
    </button>
  );
}

/* -------------------- HERO DASHBOARD -------------------- */
function HeroDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const parallax = (depth = 20) => ({
    transform: `translate3d(${mouse.x * depth}px, ${mouse.y * depth}px, 0)`,
  });

  return (
    <div
      ref={ref}
      className="relative w-full h-[520px] md:h-[620px] overflow-hidden rounded-3xl border border-white/10 glass-strong"
    >
      {/* animated gradient background */}
      <div className="absolute inset-0 bg-grad-hero animate-gradient opacity-70" />
      <div className="absolute inset-0 grid-bg opacity-30" />
      {/* glow orbs */}
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-cyan/40 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-pink/40 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-emerald/30 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Floating 3D medicine assets (CSS-only stylised) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Pill capsule */}
        <div className="absolute top-[18%] left-[8%] animate-float" style={parallax(30)}>
          <Capsule from="var(--pink)" to="var(--purple)" w={140} />
        </div>
        {/* Medicine box */}
        <div className="absolute top-[55%] left-[14%] animate-float-slow" style={parallax(20)}>
          <MedBox color="var(--cyan)" label="RX-100" />
        </div>
        {/* Tablet blister */}
        <div className="absolute top-[22%] right-[10%] animate-float-slow" style={parallax(35)}>
          <TabletStrip />
        </div>
        {/* Syringe */}
        <div className="absolute bottom-[18%] right-[16%] animate-float" style={{ ...parallax(25), animationDelay: "1.5s" }}>
          <Syringe />
        </div>
        {/* Prescription sheet */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 animate-float-slow" style={parallax(15)}>
          <PrescriptionSheet />
        </div>
        {/* Particles */}
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/60"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              animation: `float-y ${4 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: "0 0 8px white",
            }}
          />
        ))}
        {/* Rotating molecular ring */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-40 w-40 opacity-40 animate-spin-slow">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/50" />
          <div className="absolute inset-4 rounded-full border border-white/40" />
        </div>
      </div>

      {/* Hero text */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
        <div className="glass rounded-full px-4 py-1.5 text-xs md:text-sm mb-6 flex items-center gap-2 animate-rise">
          <Sparkles className="h-3.5 w-3.5 text-neon" />
          AI-Powered Pharmacy • Trusted by 2M+ users
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-[1.05] animate-rise" style={{ animationDelay: "0.1s" }}>
          Your Future Pharmacy
          <br />
          <span className="text-grad-cool">Starts Here.</span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-white/80 max-w-2xl animate-rise" style={{ animationDelay: "0.2s" }}>
          AI-powered medicine discovery, trusted healthcare products, and a seamless online pharmacy experience.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-rise" style={{ animationDelay: "0.3s" }}>
          <GradientButton>
            <Sparkles className="h-4 w-4" /> Explore Medicines
          </GradientButton>
          <GhostButton>
            <Upload className="h-4 w-4" /> Upload Prescription
          </GhostButton>
        </div>

        {/* Live mini-stats floating card */}
        <div className="absolute bottom-6 left-6 hidden md:block glass-strong rounded-2xl p-4 w-64 animate-rise" style={{ animationDelay: "0.5s" }}>
          <div className="text-xs text-white/70 mb-2">Live orders</div>
          <MiniLive />
        </div>
        <div className="absolute bottom-6 right-6 hidden md:flex glass-strong rounded-2xl p-4 gap-3 items-center animate-rise" style={{ animationDelay: "0.6s" }}>
          <div className="h-10 w-10 rounded-xl bg-grad-neon grid place-items-center">
            <Truck className="h-5 w-5 text-black" />
          </div>
          <div>
            <div className="text-xs text-white/70">Avg. delivery</div>
            <div className="text-lg font-semibold">27 min</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GradientButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="group relative inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white bg-grad-hero glow hover-lift">
      <span className="absolute inset-0 rounded-2xl bg-grad-hero blur-xl opacity-60 -z-10 group-hover:opacity-90 transition" />
      {children}
    </button>
  );
}
function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold glass-strong hover:bg-white/15 transition-all hover-lift">
      {children}
    </button>
  );
}

/* -------------------- Decorative SVG assets -------------------- */
function Capsule({ from, to, w = 120 }: { from: string; to: string; w?: number }) {
  return (
    <svg width={w} height={w * 0.42} viewBox="0 0 200 80">
      <defs>
        <linearGradient id={`cap-${from}`} x1="0" x2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <g transform="rotate(-20 100 40)">
        <rect x="10" y="10" width="90" height="60" rx="30" fill={`url(#cap-${from})`} />
        <rect x="100" y="10" width="90" height="60" rx="30" fill="white" opacity="0.9" />
        <ellipse cx="45" cy="28" rx="24" ry="6" fill="white" opacity="0.5" />
      </g>
    </svg>
  );
}
function MedBox({ color, label }: { color: string; label: string }) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150">
      <defs>
        <linearGradient id={`box-${label}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor="var(--purple)" />
        </linearGradient>
      </defs>
      <g transform="translate(15 20)">
        <polygon points="0,20 60,0 120,20 120,110 60,130 0,110" fill={`url(#box-${label})`} />
        <polygon points="0,20 60,0 60,50 0,40" fill="white" opacity="0.15" />
        <polygon points="60,0 120,20 120,50 60,50" fill="black" opacity="0.2" />
        <rect x="30" y="55" width="60" height="8" rx="2" fill="white" opacity="0.9" />
        <text x="60" y="80" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Space Grotesk">{label}</text>
      </g>
    </svg>
  );
}
function TabletStrip() {
  return (
    <svg width="180" height="80" viewBox="0 0 180 80">
      <defs>
        <linearGradient id="strip" x1="0" x2="1">
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="1" stopColor="var(--emerald)" />
        </linearGradient>
      </defs>
      <g transform="rotate(15 90 40)">
        <rect x="5" y="15" width="170" height="50" rx="8" fill="url(#strip)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={25 + i * 32} cy="40" r="10" fill="white" opacity="0.95" />
        ))}
      </g>
    </svg>
  );
}
function Syringe() {
  return (
    <svg width="200" height="60" viewBox="0 0 200 60">
      <g transform="rotate(-25 100 30)">
        <rect x="20" y="22" width="120" height="16" rx="4" fill="white" opacity="0.95" />
        <rect x="20" y="22" width="80" height="16" fill="var(--cyan)" opacity="0.6" />
        <rect x="140" y="18" width="10" height="24" fill="var(--purple)" />
        <rect x="150" y="26" width="30" height="8" fill="var(--purple)" />
        <line x1="0" y1="30" x2="20" y2="30" stroke="white" strokeWidth="2" />
      </g>
    </svg>
  );
}
function PrescriptionSheet() {
  return (
    <svg width="120" height="150" viewBox="0 0 120 150" className="drop-shadow-2xl">
      <g transform="rotate(-8 60 75)">
        <rect x="5" y="5" width="110" height="140" rx="8" fill="white" />
        <rect x="5" y="5" width="110" height="20" fill="var(--electric)" />
        <text x="60" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Rx PRESCRIPTION</text>
        {[35, 50, 65, 80, 95, 110].map((y) => (
          <rect key={y} x="15" y={y} width={70 + (y % 30)} height="4" rx="2" fill="#c9c9c9" />
        ))}
        <circle cx="95" cy="125" r="12" fill="var(--emerald)" opacity="0.3" />
        <path d="M87 125 l6 6 l12 -12" stroke="var(--emerald)" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}

function MiniLive() {
  const data = Array.from({ length: 12 }, (_, i) => ({ i, v: 40 + Math.sin(i / 2) * 20 + i * 3 }));
  return (
    <div className="h-16">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="mlg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.9 0.24 130)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="oklch(0.9 0.24 130)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="oklch(0.9 0.24 130)" fill="url(#mlg)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------- CATEGORIES -------------------- */
const categories = [
  { name: "Diabetes", icon: Droplet, from: "var(--cyan)", to: "var(--electric)" },
  { name: "Cardiac Care", icon: HeartPulse, from: "var(--pink)", to: "var(--purple)" },
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
            <div key={c.name} className="group relative rounded-2xl p-5 glass hover-lift overflow-hidden cursor-pointer">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl grid place-items-center mb-3" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="font-semibold group-hover:text-white transition-colors">{c.name}</div>
                <div className="text-xs text-muted-foreground group-hover:text-white/80 mt-1 flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------- SECTION WRAPPER -------------------- */
function Section({
  id, eyebrow, title, subtitle, children,
}: { id?: string; eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative py-20 md:py-28 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl mb-10 md:mb-14">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" /> {eyebrow}
            </div>
          )}
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            {title.split("|").map((p, i) => (i % 2 ? <span key={i} className="text-grad-hero">{p}</span> : <span key={i}>{p}</span>))}
          </h2>
          {subtitle && <p className="mt-3 text-muted-foreground md:text-lg">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

/* -------------------- PRODUCT DATA -------------------- */
type Product = {
  name: string; category: string; supplier: string; manufacturer: string;
  mfg: string; exp: string; stock: number; rating: number; reviews: number;
  price: number; discount: number; grad: string;
};
const products: Product[] = [
  { name: "CardioGuard 40mg", category: "Cardiac", supplier: "MediWave", manufacturer: "Zynex Labs", mfg: "01/2026", exp: "01/2028", stock: 128, rating: 4.8, reviews: 421, price: 249, discount: 20, grad: "var(--grad-cool)" },
  { name: "GlucoBalance XR", category: "Diabetes", supplier: "PharmaOne", manufacturer: "Solvex", mfg: "03/2026", exp: "03/2028", stock: 84, rating: 4.7, reviews: 312, price: 189, discount: 15, grad: "var(--grad-neon)" },
  { name: "ImmunoPlus C", category: "Immunity", supplier: "VitaCore", manufacturer: "NuVita", mfg: "05/2026", exp: "05/2028", stock: 320, rating: 4.9, reviews: 902, price: 99, discount: 30, grad: "var(--grad-warm)" },
  { name: "NeuroCalm 25", category: "Pain Relief", supplier: "MediWave", manufacturer: "Zynex Labs", mfg: "02/2026", exp: "02/2028", stock: 56, rating: 4.6, reviews: 187, price: 149, discount: 10, grad: "var(--grad-hero)" },
  { name: "DermaGlow Serum", category: "Skin Care", supplier: "GlowCo", manufacturer: "Aurora", mfg: "04/2026", exp: "04/2028", stock: 210, rating: 4.8, reviews: 640, price: 349, discount: 25, grad: "var(--grad-warm)" },
  { name: "SleepEase PM", category: "Wellness", supplier: "PharmaOne", manufacturer: "NuVita", mfg: "06/2026", exp: "06/2028", stock: 145, rating: 4.5, reviews: 251, price: 129, discount: 12, grad: "var(--grad-cool)" },
];

function ProductCard({ p, compact = false }: { p: Product; compact?: boolean }) {
  const discounted = Math.round(p.price * (1 - p.discount / 100));
  return (
    <div className={`group relative rounded-3xl glass hover-lift overflow-hidden flex flex-col ${compact ? "min-w-[260px]" : ""}`}>
      <div className="relative h-44 overflow-hidden" style={{ background: p.grad }}>
        <div className="absolute inset-0 opacity-30 grid-bg" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="animate-float">
            <Capsule from="white" to="rgba(255,255,255,0.6)" w={140} />
          </div>
        </div>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="glass px-2 py-1 rounded-full text-[10px] font-semibold">{p.category}</span>
          {p.discount > 0 && <span className="bg-grad-warm px-2 py-1 rounded-full text-[10px] font-bold text-white">-{p.discount}%</span>}
        </div>
        <button className="absolute top-3 right-3 h-8 w-8 rounded-full glass grid place-items-center hover:bg-white/25 transition">
          <HeartPulse className="h-4 w-4" />
        </button>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
          <button className="glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
            Quick View <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{p.name}</h3>
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
            <div className="text-xl font-bold">₹{discounted}</div>
            {p.discount > 0 && <div className="text-xs text-muted-foreground line-through">₹{p.price}</div>}
          </div>
          <div className="flex gap-2">
            <button className="h-9 w-9 rounded-xl glass grid place-items-center hover:bg-white/15" aria-label="add">
              <Plus className="h-4 w-4" />
            </button>
            <button className="h-9 px-3 rounded-xl bg-grad-hero text-white text-sm font-semibold glow">Buy</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- NEW LAUNCH / TRENDING (Carousels) -------------------- */
function Carousel({ title, eyebrow }: { title: string; eyebrow: string }) {
  const scRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <Section eyebrow={eyebrow} title={title}>
      <div className="relative">
        <div ref={scRef} className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p, i) => (
            <div key={i} className="snap-start"><ProductCard p={p} compact /></div>
          ))}
          {products.map((p, i) => (
            <div key={`b-${i}`} className="snap-start"><ProductCard p={p} compact /></div>
          ))}
        </div>
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-strong grid place-items-center hover:bg-white/20">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-strong grid place-items-center hover:bg-white/20">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Section>
  );
}

/* -------------------- BEST SELLERS GRID -------------------- */
function BestSellers() {
  return (
    <Section eyebrow="Loved by millions" title="Best Sellers" subtitle="The most purchased medicines this month.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.slice(0, 4).map((p) => <ProductCard key={p.name} p={p} />)}
      </div>
    </Section>
  );
}

/* -------------------- DISCOUNT / FLASH SALE -------------------- */
function useCountdown(seconds: number) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setT((v) => (v > 0 ? v - 1 : seconds)), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const h = Math.floor(t / 3600).toString().padStart(2, "0");
  const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
  const s = (t % 60).toString().padStart(2, "0");
  return { h, m, s };
}
function FlashSale() {
  const { h, m, s } = useCountdown(3600 * 8 + 900);
  return (
    <Section eyebrow="Limited time" title="Flash Sale ⚡ Ends Soon">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 rounded-3xl p-6 bg-grad-warm relative overflow-hidden text-white">
          <Flame className="h-10 w-10 mb-3" />
          <div className="text-2xl font-bold leading-tight">Up to 60% off on Immunity & Skin Care</div>
          <p className="mt-2 text-white/85 text-sm">Curated bundles, live now.</p>
          <div className="mt-6 flex gap-3">
            {[{ v: h, l: "Hours" }, { v: m, l: "Min" }, { v: s, l: "Sec" }].map((x) => (
              <div key={x.l} className="glass-strong rounded-xl px-3 py-2 text-center min-w-16">
                <div className="text-2xl font-bold tabular-nums">{x.v}</div>
                <div className="text-[10px] uppercase tracking-widest">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
          <Timer className="absolute top-6 right-6 h-6 w-6 opacity-70" />
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
          {products.slice(2, 6).map((p) => <ProductCard key={p.name} p={p} />)}
        </div>
      </div>
    </Section>
  );
}

/* -------------------- AI PRESCRIPTION UPLOAD -------------------- */
function PrescriptionUpload() {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); setScanning(false); return 100; }
        return p + 4;
      });
    }, 80);
  };

  return (
    <Section eyebrow="AI Vision" title="Upload Your | Prescription |" subtitle="Drop a photo — our AI extracts medicines, dosages, and finds the best price in seconds.">
      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); startScan(); }}
          className={`relative rounded-3xl p-10 border-2 border-dashed transition-all ${drag ? "border-primary bg-primary/10" : "border-white/15 glass"}`}
        >
          <div className="text-center flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-grad-hero grid place-items-center glow">
                <Upload className="h-8 w-8 text-white" />
              </div>
              {scanning && <div className="absolute inset-0 rounded-2xl border-2 border-neon animate-pulse-glow" />}
            </div>
            <div>
              <div className="font-semibold text-lg">Drop prescription here</div>
              <div className="text-muted-foreground text-sm">or click to browse • JPG, PNG, PDF up to 10MB</div>
            </div>
            <button onClick={startScan} className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
              <Sparkles className="h-4 w-4" /> Start AI Scan
            </button>
            {(scanning || progress > 0) && (
              <div className="w-full mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span>{scanning ? "AI scanning…" : "Scan complete"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-grad-neon transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl glass p-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple/40 blur-3xl" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Brain className="h-4 w-4 text-neon" /> AI extraction preview
          </div>
          {[
            { n: "Amoxicillin 500mg", d: "1 tablet • 3× daily • 5 days", ok: true },
            { n: "Paracetamol 650mg", d: "As needed • max 4/day", ok: true },
            { n: "Cetirizine 10mg", d: "1 tablet • bedtime", ok: true },
            { n: "Vitamin D3 60K", d: "1 sachet • weekly • 4 weeks", ok: true },
          ].map((r) => (
            <div key={r.n} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
              <div>
                <div className="font-semibold">{r.n}</div>
                <div className="text-xs text-muted-foreground">{r.d}</div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald" />
            </div>
          ))}
          <button className="mt-4 w-full rounded-xl py-2.5 bg-grad-cool text-white font-semibold">Add all to cart</button>
        </div>
      </div>
    </Section>
  );
}

/* -------------------- DELIVERY TRACKING -------------------- */
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
          <div className="text-2xl font-bold">#NG-08421</div>
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
          {/* Stylised map */}
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
              <Truck x="-8" y="-8" width="16" height="16" color="white" />
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

/* -------------------- ANALYTICS DASHBOARD -------------------- */
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
  o: 120 + Math.round(Math.random() * 80),
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
            {[
              { n: "CardioGuard 40mg", s: 12 },
              { n: "GlucoBalance XR", s: 8 },
              { n: "NeuroCalm 25", s: 5 },
              { n: "Vitamin D3 60K", s: 3 },
            ].map((r) => (
              <div key={r.n} className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{r.n}</div>
                  <div className="h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                    <div className="h-full bg-grad-warm" style={{ width: `${Math.min(100, r.s * 6)}%` }} />
                  </div>
                </div>
                <span className="ml-3 text-xs text-orange font-semibold">{r.s} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------- CHECKOUT / PAYMENT -------------------- */
function Checkout() {
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
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-3xl p-6">
            <div className="font-semibold mb-3">Delivery address</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Full name" className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60" />
              <input placeholder="Phone" className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60" />
              <input placeholder="Address" className="sm:col-span-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60" />
              <input placeholder="City" className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60" />
              <input placeholder="PIN" className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60" />
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="font-semibold mb-3">Delivery slot</div>
            <div className="flex flex-wrap gap-2">
              {["Now (30 min)", "Today • 4–6 PM", "Tomorrow • 10 AM", "Tomorrow • 6 PM"].map((s, i) => (
                <button key={s} className={`px-4 py-2 rounded-xl text-sm border ${i === 0 ? "bg-grad-hero text-white border-transparent glow" : "border-white/10 hover:bg-white/5"}`}>
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
                  <button key={o.k} onClick={() => setPay(o.k)} className={`rounded-2xl p-4 border transition ${active ? "border-transparent bg-grad-cool text-white glow" : "border-white/10 glass hover:bg-white/10"}`}>
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
          <div className="space-y-2 text-sm">
            {products.slice(0, 3).map((p) => (
              <div key={p.name} className="flex justify-between">
                <span className="truncate">{p.name}</span>
                <span className="text-muted-foreground">₹{Math.round(p.price * (1 - p.discount / 100))}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
            <span>Total</span>
            <span className="text-2xl font-bold text-grad-hero">₹537</span>
          </div>
          <div className="mt-3 flex gap-2">
            <input placeholder="Coupon" className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
            <button className="rounded-xl px-3 py-2 bg-white/10 text-sm font-semibold">Apply</button>
          </div>
          <button className="mt-4 w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow">Place order</button>
        </div>
      </div>
    </Section>
  );
}

/* -------------------- FOOTER -------------------- */
function Footer() {
  return (
    <footer className="relative overflow-hidden mt-10">
      <svg viewBox="0 0 1440 120" className="w-full text-primary" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.68 0.22 260)" />
            <stop offset="0.5" stopColor="oklch(0.65 0.25 300)" />
            <stop offset="1" stopColor="oklch(0.72 0.24 350)" />
          </linearGradient>
        </defs>
        <path fill="url(#wave)" fillOpacity="0.35" d="M0,64L60,58.7C120,53,240,43,360,53.3C480,64,600,96,720,101.3C840,107,960,85,1080,74.7C1200,64,1320,64,1380,64L1440,64L1440,120L0,120Z">
          <animate attributeName="d" dur="10s" repeatCount="indefinite"
            values="M0,64L60,58.7C120,53,240,43,360,53.3C480,64,600,96,720,101.3C840,107,960,85,1080,74.7C1200,64,1320,64,1380,64L1440,64L1440,120L0,120Z;
                    M0,80L60,74.7C120,69,240,59,360,69.3C480,80,600,112,720,117.3C840,123,960,101,1080,90.7C1200,80,1320,80,1380,80L1440,80L1440,120L0,120Z;
                    M0,64L60,58.7C120,53,240,43,360,53.3C480,64,600,96,720,101.3C840,107,960,85,1080,74.7C1200,64,1320,64,1380,64L1440,64L1440,120L0,120Z" />
        </path>
      </svg>
      <div className="bg-[color:oklch(0.16_0.04_265)] pt-8 pb-10 px-4">
        <div className="mx-auto max-w-7xl grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-grad-hero grid place-items-center">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">Rays Pharmacy</span>
            </div>
            <p className="text-sm text-muted-foreground">The AI-powered pharmacy for a healthier tomorrow.</p>
            <div className="flex gap-2 mt-4">
              {[Instagram, Twitter, Facebook, Youtube].map((I, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-xl glass grid place-items-center hover:bg-white/15 transition"><I className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3">Explore</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Categories", "New Launches", "Best Sellers", "Offers", "Prescription"].map((x) => (
                <li key={x}><a href="#" className="hover:text-foreground transition">{x}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["About", "Careers", "Press", "Blog", "Contact"].map((x) => (
                <li key={x}><a href="#" className="hover:text-foreground transition">{x}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Newsletter</div>
            <p className="text-sm text-muted-foreground mb-3">Health tips and offers, once a week.</p>
            <div className="flex gap-2">
              <input placeholder="you@email.com" className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
              <button className="rounded-xl px-3 py-2 bg-grad-hero text-white text-sm font-semibold glow">Join</button>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">support@nextgen.rx • +91 90000 00000</div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-8 pt-6 border-t border-white/10 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Rays Pharmacy. All rights reserved.</span>
          <span>Made with ♥ for a healthier tomorrow.</span>
        </div>
      </div>
    </footer>
  );
}

/* -------------------- CHATBOT -------------------- */
function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([
    { me: false, t: "Hi! I'm Rays AI. Ask me about medicines, symptoms, or upload a prescription." },
  ]);
  const [typing, setTyping] = useState(false);
  const [txt, setTxt] = useState("");
  const send = (v: string) => {
    if (!v.trim()) return;
    setMsgs((m) => [...m, { me: true, t: v }]);
    setTxt("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { me: false, t: "I recommend consulting a doctor. Here are 3 medicines commonly prescribed — I can add them to your cart." }]);
    }, 1400);
  };
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-grad-hero grid place-items-center glow hover-lift"
        aria-label="Open chat"
      >
        <Bot className="h-6 w-6 text-white" />
        <span className="absolute inset-0 rounded-full bg-grad-hero blur-xl opacity-60 -z-10 animate-pulse-glow" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[92vw] max-w-sm glass-strong rounded-3xl overflow-hidden animate-rise glow">
          <div className="p-4 bg-grad-hero flex items-center gap-3 text-white">
            <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center"><Bot className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Rays AI</div>
              <div className="text-xs opacity-80">Always online</div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 h-72 overflow-y-auto space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.me ? "bg-grad-cool text-white" : "bg-white/10"}`}>{m.t}</div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-1 items-center bg-white/10 w-fit px-3 py-2 rounded-2xl">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-white typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2 mb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["Fever meds", "Skin care", "Track order"].map((s) => (
                <button key={s} onClick={() => send(s)} className="shrink-0 text-xs px-3 py-1 rounded-full glass hover:bg-white/15">{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(txt)}
                placeholder="Ask anything…"
                className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button onClick={() => send(txt)} className="h-9 w-9 rounded-xl bg-grad-hero grid place-items-center glow">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------- STATS COUNTER -------------------- */
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
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-purple/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-pink/20 blur-3xl" />
      </div>

      <Header />

      <main className="pt-24 md:pt-28">
        <div className="px-4">
          <div className="mx-auto max-w-7xl">
            <HeroDashboard />
          </div>
        </div>
        <div className="h-8" />
        <Stats />
        <Categories />
        <Carousel title="New Launches" eyebrow="Fresh on Rays Pharmacy" />
        <Carousel title="Trending Now" eyebrow="What's hot" />
        <BestSellers />
        <FlashSale />
        <PrescriptionUpload />
        <DeliveryTracking />
        <Analytics />
        <Checkout />
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
