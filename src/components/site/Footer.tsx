import { Link } from "@tanstack/react-router";
import { Pill } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { emailSchema } from "../../lib/validation";

export function Footer() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) {
      setErr(r.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setErr(null);
    setEmail("");
    toast.success("Subscribed! Check your inbox for updates.");
  };

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
              <span className="font-brand text-lg">Rays Pharmacy</span>
            </div>
            <p className="text-sm text-muted-foreground">The AI-powered pharmacy for a healthier tomorrow.</p>
          </div>
          <div>
            <div className="font-semibold mb-3">Explore</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/categories" className="hover:text-foreground transition">Categories</Link></li>
              <li><Link to="/products" search={{ tag: "new" }} className="hover:text-foreground transition">New Launches</Link></li>
              <li><Link to="/products" search={{ tag: "best" }} className="hover:text-foreground transition">Best Sellers</Link></li>
              <li><Link to="/products" search={{ tag: "offer" }} className="hover:text-foreground transition">Offers</Link></li>
              <li><Link to="/prescription" className="hover:text-foreground transition">Prescription</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition">Contact</Link></li>
              <li><Link to="/delivery" className="hover:text-foreground transition">Delivery</Link></li>
              <li><Link to="/cart" className="hover:text-foreground transition">Cart</Link></li>
              <li><Link to="/login" className="hover:text-foreground transition">Login</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Newsletter</div>
            <p className="text-sm text-muted-foreground mb-3">Health tips and offers, once a week.</p>
            <form onSubmit={onSubscribe} className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button type="submit" className="rounded-xl px-3 py-2 bg-grad-hero text-white text-sm font-semibold glow">
                Join
              </button>
            </form>
            {err && <div className="mt-2 text-xs text-pink">{err}</div>}
            <div className="mt-4 text-xs text-muted-foreground">support@rayspharmacy.com • +91 90000 00000</div>
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
