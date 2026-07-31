import type { Product } from "../types/models";
import { placeholderProductImage } from "./images";

export type { Product };



const base: Omit<Product, "id" | "image">[] = [
  { name: "CardioGuard 40mg", category: "Cardiac", supplier: "MediWave", manufacturer: "Zynex Labs", mfg: "01/2026", exp: "01/2028", stock: 128, rating: 4.8, reviews: 421, price: 249, discount: 20, grad: "var(--grad-cool)", tags: ["best", "new"] },
  { name: "GlucoBalance XR", category: "Diabetes", supplier: "PharmaOne", manufacturer: "Solvex", mfg: "03/2026", exp: "03/2028", stock: 84, rating: 4.7, reviews: 312, price: 189, discount: 15, grad: "var(--grad-neon)", tags: ["trending"] },
  { name: "ImmunoPlus C", category: "Immunity", supplier: "VitaCore", manufacturer: "NuVita", mfg: "05/2026", exp: "05/2028", stock: 320, rating: 4.9, reviews: 902, price: 99, discount: 30, grad: "var(--grad-warm)", tags: ["best", "trending", "offer"] },
  { name: "NeuroCalm 25", category: "Pain Relief", supplier: "MediWave", manufacturer: "Zynex Labs", mfg: "02/2026", exp: "02/2028", stock: 56, rating: 4.6, reviews: 187, price: 149, discount: 10, grad: "var(--grad-hero)", tags: ["new"] },
  { name: "DermaGlow Serum", category: "Skin Care", supplier: "GlowCo", manufacturer: "Aurora", mfg: "04/2026", exp: "04/2028", stock: 210, rating: 4.8, reviews: 640, price: 349, discount: 25, grad: "var(--grad-warm)", tags: ["trending", "seasonal"] },
  { name: "SleepEase PM", category: "Wellness", supplier: "PharmaOne", manufacturer: "NuVita", mfg: "06/2026", exp: "06/2028", stock: 145, rating: 4.5, reviews: 251, price: 129, discount: 12, grad: "var(--grad-cool)", tags: ["seasonal"] },
  { name: "AllerFree 24", category: "Allergy", supplier: "MediWave", manufacturer: "Solvex", mfg: "07/2026", exp: "07/2028", stock: 92, rating: 4.4, reviews: 173, price: 119, discount: 18, grad: "var(--grad-cool)", tags: ["seasonal"] },
  { name: "OmegaVital 1000", category: "Vitamins", supplier: "VitaCore", manufacturer: "NuVita", mfg: "08/2026", exp: "08/2028", stock: 260, rating: 4.7, reviews: 512, price: 279, discount: 22, grad: "var(--grad-neon)", tags: ["best"] },
  { name: "KidneyShield 500", category: "Kidney", supplier: "PharmaOne", manufacturer: "Zynex Labs", mfg: "09/2026", exp: "09/2028", stock: 47, rating: 4.6, reviews: 141, price: 199, discount: 15, grad: "var(--grad-hero)", tags: [] },
  { name: "ChildCare Syrup", category: "Baby Care", supplier: "MediWave", manufacturer: "Aurora", mfg: "05/2026", exp: "05/2027", stock: 178, rating: 4.9, reviews: 428, price: 89, discount: 20, grad: "var(--grad-warm)", tags: ["new"] },
  { name: "OralPro Toothpaste", category: "Dental", supplier: "GlowCo", manufacturer: "Aurora", mfg: "03/2026", exp: "03/2028", stock: 405, rating: 4.6, reviews: 891, price: 149, discount: 10, grad: "var(--grad-cool)", tags: ["best"] },
  { name: "SunBlock SPF 50", category: "Skin Care", supplier: "GlowCo", manufacturer: "NuVita", mfg: "04/2026", exp: "04/2028", stock: 220, rating: 4.7, reviews: 356, price: 299, discount: 28, grad: "var(--grad-warm)", tags: ["seasonal", "offer"] },
];

export const products: Product[] = base.map((p, i) => ({
  ...p,
  id: `p-${i + 1}`,
  image: placeholderProductImage(i),
}));

export const byTag = (tag: string) => products.filter((p) => p.tags?.includes(tag));
export const byCategory = (name: string) =>
  products.filter((p) => p.category.toLowerCase() === name.toLowerCase());
export const findProduct = (id: string) => products.find((p) => p.id === id);
export const searchProducts = (q: string) => {
  const s = q.trim().toLowerCase();
  if (!s) return [] as Product[];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.manufacturer.toLowerCase().includes(s),
  );
};

export const discountedPrice = (p: Product) => Math.round(p.price * (1 - p.discount / 100));
