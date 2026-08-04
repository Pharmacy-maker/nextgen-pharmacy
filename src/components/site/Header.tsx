import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Menu, Pill, Search, ShoppingCart, User, X, LogOut } from "lucide-react";
import { useAuth, useCart } from "../../lib/store";
import { searchProducts, discountedPrice } from "../../lib/products";
import { ProductImage } from "./ProductImage";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Delivery", to: "/delivery" },
  { label: "Prescription", to: "/prescription" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setOpen(false);
    setShowResults(false);
  }, [pathname]);

  const results = useMemo(() => searchProducts(query).slice(0, 6), [query]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    navigate({ to: "/products", search: { q: query.trim() } });
    setShowResults(false);
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className={`glass-strong rounded-2xl px-4 md:px-6 py-3 flex items-center gap-4 ${scrolled ? "glow" : ""}`}>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="relative h-9 w-9 rounded-xl bg-grad-hero grid place-items-center glow">
              <Pill className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-grad-hero blur-xl opacity-60 -z-10" />
            </div>
            <span className="font-brand text-lg">Rays Pharmacy</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 mx-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "px-3 py-1.5 text-sm rounded-lg bg-white/10 text-foreground" }}
                inactiveProps={{ className: "px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <div className="relative" ref={searchRef}>
              <form onSubmit={submitSearch}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search medicines…"
                  className="w-56 bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
              </form>
              {showResults && query.trim() && (
                <div className="absolute right-0 mt-2 w-80 glass-strong rounded-2xl p-2 max-h-80 overflow-y-auto z-50">
                  {results.length === 0 ? (
                    <div className="text-xs text-muted-foreground px-3 py-4 text-center">
                      No results for “{query}”
                    </div>
                  ) : (
                    results.map((p) => (
                      <Link
                        key={p.id}
                        to="/products"
                        search={{ q: p.name }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10"
                      >
                        <ProductImage src={p.image} seed={p.id} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.category}</div>
                        </div>
                        <div className="text-sm font-semibold">₹{discountedPrice(p)}</div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
            <IconBtn onClick={() => navigate({ to: "/delivery" })} label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink" />
            </IconBtn>
            <div className="relative" ref={userRef}>
              <IconBtn onClick={() => (user ? setUserMenu((v) => !v) : navigate({ to: "/login" }))} label="Account">
                <User className="h-4 w-4" />
              </IconBtn>
              {user && userMenu && (
                <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl p-3 z-50">
                  <div className="text-sm font-semibold truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    to={user.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setUserMenu(false)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-sm"
                  >
                    <User className="h-4 w-4" /> {user.role === "admin" ? "Admin dashboard" : "My dashboard"}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-sm"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
            <IconBtn onClick={() => navigate({ to: "/cart" })} label="Cart">
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-[10px] bg-grad-warm grid place-items-center font-semibold text-white">
                  {count}
                </span>
              )}
            </IconBtn>
          </div>
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-3 flex flex-col animate-rise">
            <form onSubmit={submitSearch} className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicines…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </form>
            {[...NAV, { label: "Cart", to: "/cart" as const }, { label: user ? "Account" : "Login", to: "/login" as const }].map((n) => (
              <Link key={n.to} to={n.to} className="px-3 py-2 rounded-lg text-sm hover:bg-white/5">
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative h-9 w-9 grid place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
    >
      {children}
    </button>
  );
}
