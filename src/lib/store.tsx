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
  console.log("CART STORAGE:", items);
}, [items]);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
  productService.list()
    .then((data) => {
      console.log("STORE PRODUCTS:", data.length);
      console.log("FIRST PRODUCT:", data[0]);
      console.log("LOADED PRODUCTS:", data.length);
      console.log("FIRST LOADED PRODUCT:", data[0]);

      console.log(
  "HAS MEFTAL:",
  data.some(
    (p) =>
      p.id ===
      "af4a8b58-0850-48ec-ab7f-334acfa46c68"
  )
);

console.log(
  "MEFTAL RECORD:",
  data.find(
    (p) =>
      p.id ===
      "af4a8b58-0850-48ec-ab7f-334acfa46c68"
  )
);

setProducts(data);
    })
    .catch(console.error);
}, []);

useEffect(() => {
  console.log(
    "PRODUCT IDS SAMPLE:",
    products.slice(0, 5).map((p) => p.id)
  );
  console.log(
  "HAS CALPOL:",
  products.some(
    (p) =>
      p.id ===
      "2ece6de9-318e-4553-b839-99a94fa9a972"
  )
);

console.log(
  "HAS DELCON:",
  products.some(
    (p) =>
      p.id ===
      "056a363c-946e-4379-92e8-20764deea50b"
  )
);

  console.log("CART ITEMS:", items);
}, [products, items]);

  useEffect(() => {
  console.log("CART ITEMS:", items);

  if (items.length > 0) {
    console.log("FIRST CART ITEM:", items[0]);
  }
}, [items]);
  const add = useCallback(
  (id: string, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);

      if (found) {
        return prev.map((i) =>
          i.id === id
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }

      return [...prev, { id, qty }];
    });
  },
  [setItems],
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
      setItems((prev) =>
        qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
      );
    },
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const detailed = useMemo(
  () =>
    items
      .map((i) => {
        console.log("CART ID:", i.id, typeof i.id);
console.log(
  "FIRST PRODUCT ID:",
  products[0]?.id,
  typeof products[0]?.id
);
console.log(
  "DETAIL MAP ITEM:",
  i.id
);
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

        console.log("LOOKUP:", i.id);

const exactMatch = products.find(
  (p) => String(p.id) === String(i.id)
);

console.log("EXACT MATCH:", exactMatch);

console.log(
  "PRODUCT CONTAINS ID:",
  products.some(
    (p) => String(p.id) === String(i.id)
  )
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
  console.log("DETAILED:", detailed);
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
      setIds((prev) => {
        if (prev.includes(id)) {
          toast("Removed from wishlist");
          return prev.filter((x) => x !== id);
        }
        const p = findProduct(id);
        if (p) toast.success(`${p.name} added to wishlist`);
        return [...prev, id];
      });
    },
    [setIds],
  );
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

