import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { discountedPrice, findProduct, type Product } from "./products";
import { setToken } from "./api/client";
import type { UserRole } from "../types/models";


type CartItem = { id: string; qty: number };
type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  detailed: { product: Product; qty: number; line: number }[];
};

const CartContext = createContext<CartCtx | null>(null);
import { productService } from "./api/services/product.service";

function useLocal<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
  }, [key]);
  const set = useCallback(
    (val: T | ((p: T) => T)) => {
      setV((prev) => {
        const next = typeof val === "function" ? (val as (p: T) => T)(prev) : val;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );
  return [v, set];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocal<CartItem[]>("rays:cart", []);
  useEffect(() => {
  
}, [items]);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
  productService.list()
    .then((data) => {
      
setProducts(data);
    })
    .catch(console.error);
}, []);

useEffect(() => {
  


}, [products, items]);

  useEffect(() => {
  

  if (items.length > 0) {
    
  }
}, [items]);
  const add = useCallback(
  (id: string, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);

      const product = products.find((p) => p.id === id);
      const stock = product?.stock ?? 0;

      if (found) {
        const newQty = found.qty + qty;

        if (newQty > stock) {
          toast.error(`Only ${stock} units available`);
          return prev;
        }

        return prev.map((i) =>
          i.id === id
            ? { ...i, qty: newQty }
            : i
        );
      }

      if (qty > stock) {
        toast.error(`Only ${stock} units available`);
        return prev;
      }

      return [...prev, { id, qty }];
    });
  },
  [setItems, products],
);
  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast("Removed from cart");
    },
    [setItems],
  );

  const setQty = useCallback(
  (id: string, qty: number) => {
    const product = products.find((p) => p.id === id);
    const stock = product?.stock ?? 0;

    if (qty > stock) {
      toast.error(`Only ${stock} units available`);
      return;
    }

    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) =>
            i.id === id
              ? { ...i, qty }
              : i
          ),
    );
  },
  [setItems, products],
);
  const clear = useCallback(() => setItems([]), [setItems]);

  const detailed = useMemo(
  () =>
    items
      .map((i) => {
       
const product = products.find((p) => {
  const match = String(p.id) === String(i.id);

  if (match) {
    console.log(
      "MATCH FOUND:",
      p.id,
      i.id
    );
  }

  return match;
});

        

const exactMatch = products.find(
  (p) => String(p.id) === String(i.id)
);


        if (!product) return null;

        return {
          product,
          qty: i.qty,
          line: discountedPrice(product) * i.qty,
        };
      })
      .filter(Boolean) as {
      product: Product;
      qty: number;
      line: number;
    }[],
  [items, products],
);

useEffect(() => {
  
}, [detailed]);

  const count = detailed.reduce((s, d) => s + d.qty, 0);
  const subtotal = detailed.reduce((s, d) => s + d.line, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, add, remove, setQty, clear, detailed }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/* -------------------- Wishlist -------------------- */
type WishCtx = { ids: string[]; count: number; toggle: (id: string) => void; has: (id: string) => boolean; remove: (id: string) => void; clear: () => void };
const WishContext = createContext<WishCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useLocal<string[]>("rays:wishlist", []);
  const toggle = useCallback(
    (id: string) => {
      console.log("TOGGLE CALLED WITH:", id);
      setIds((prev) => {
        console.log("PREV IDS:", prev);

        if (prev.includes(id)) {
          toast("Removed from wishlist");
          return prev.filter((x) => x !== id);
        }
        toast.success("Added to wishlist");
        return [...prev, id];
      });
    },
    [setIds],
  );
  // if (p) toast.success(`${p.name} added to wishlist`);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const removeItem = useCallback(
    (id: string) => {
      setIds((prev) => prev.filter((x) => x !== id));
      toast("Removed from wishlist");
    },
    [setIds],
  );
  const clear = useCallback(() => setIds([]), [setIds]);
  return (
    <WishContext.Provider value={{ ids, count: ids.length, toggle, has, remove: removeItem, clear }}>
      {children}
    </WishContext.Provider>
  );
}
export function useWishlist() {
  const ctx = useContext(WishContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

/* -------------------- Auth -------------------- */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
};
type AuthCtx = {
  user: AuthUser | null;
  /** True once the persisted session has been read on the client. */
  ready: boolean;
  isAdmin: boolean;
  login: (u: AuthUser) => void;
  /** Patches the signed-in profile (mirrors a PATCH /users/:id response). */
  updateUser: (patch: Partial<Omit<AuthUser, "id" | "role">>) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocal<AuthUser | null>("rays:user", null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isAdmin: user?.role === "admin",
        login: (u) => {
          setUser(u);
          toast.success(`Welcome, ${u.name}`);
        },
        updateUser: (patch) => setUser((prev) => (prev ? { ...prev, ...patch } : prev)),
        logout: () => {
          setUser(null);
          setToken(null);
          toast("Signed out");
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

