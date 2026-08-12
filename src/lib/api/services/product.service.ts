import { apiFetch } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { supabase } from "../../supabase";
import { mockCategories } from "../mock/db";
import { products as mockProducts } from "../../products";

import type {
  Category,
  ID,
  Product,
  ProductInput,
} from "../../../types/models";

let catalog: Product[] = [...mockProducts];
let categoryList: Category[] = [...mockCategories];

export type ProductQuery = {
  search?: string;
  category?: string;
  tag?: string;
  sort?: "popular" | "price-asc" | "price-desc" | "rating";
};

function applyQuery(
  list: Product[],
  q: ProductQuery,
): Product[] {
  let out = [...list];

  if (q.search) {
    const s = q.search.trim().toLowerCase();

    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.manufacturer.toLowerCase().includes(s),
    );
  }

  if (q.category) {
    out = out.filter(
      (p) =>
        p.category.toLowerCase() ===
        q.category!.toLowerCase(),
    );
  }

  if (q.tag) {
    out = out.filter((p) =>
      p.tags?.includes(q.tag!),
    );
  }

  if (q.sort === "price-asc") {
    out.sort((a, b) => a.price - b.price);
  }

  if (q.sort === "price-desc") {
    out.sort((a, b) => b.price - a.price);
  }

  if (q.sort === "rating") {
    out.sort((a, b) => b.rating - a.rating);
  }

  return out;
}

function mapSupabaseProduct(row: any): Product {
  return {
    id: String(row.id),

    name: row.name ?? "Unnamed Product",

    category: row.category ?? "Uncategorized",
    categoryId: row.category_id ?? undefined,

    supplier: row.supplier ?? "—",
    supplierId: row.supplier_id ?? undefined,

    manufacturer: row.manufacturer ?? "—",

    mfg: row.mfg ?? "",
    exp: row.exp ?? "",

    stock: Number(row.stock ?? 0),

    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),

    price: Number(row.price ?? 0),
    discount: Number(row.discount ?? 0),

    grad: row.grad ?? "var(--grad-cool)",

    image:
      row.image ||
      "/images/medicine-placeholder.png",

    description: row.description ?? "",

    form: row.form ?? undefined,

    packSize:
      row.pack_size ??
      row.packSize ??
      undefined,

    composition: Array.isArray(row.composition)
      ? row.composition
      : row.composition
      ? [row.composition]
      : [],

    dosage: row.dosage ?? undefined,

    usage: row.usage ?? undefined,

    warnings: Array.isArray(row.warnings)
      ? row.warnings
      : [],

    sideEffects: Array.isArray(row.side_effects)
      ? row.side_effects
      : [],

    storage: row.storage ?? undefined,

    prescriptionRequired:
      row.prescription_required ?? false,

    tags: Array.isArray(row.tags)
      ? row.tags
      : [],
  };
}

export const productService = {
  async list(
    query: ProductQuery = {},
  ): Promise<Product[]> {
    if (!USE_MOCK_API) {
      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) {
        console.error(
          "Supabase products error:",
          error,
        );
        throw error;
      }

      const products = (data ?? []).map(
        mapSupabaseProduct,
      );

      console.log(
        "========== SUPABASE DEBUG ==========",
      );
      console.log(
        "USE_MOCK_API:",
        USE_MOCK_API,
      );
      console.log(
        "Products Count:",
        products.length,
      );
      console.log(
        "Raw Supabase Row:",
        data?.[0],
      );
      console.log(
        "Mapped Product:",
        products[0],
      );
      console.log(
        "===================================",
      );

      return applyQuery(products, query);
    }

    return applyQuery(catalog, query);
  },

  async get(
    id: ID,
  ): Promise<Product | null> {
    if (!USE_MOCK_API) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error(
          "Supabase product error:",
          error,
        );
        throw error;
      }

      return data
        ? mapSupabaseProduct(data)
        : null;
    }

    return (
      catalog.find((p) => p.id === id) ??
      null
    );
  },

  async create(
    input: ProductInput,
  ): Promise<Product> {
    if (!USE_MOCK_API) {
      const { data, error } = await supabase
        .from("products")
        .insert(input)
        .select("*")
        .single();

      if (error) {
        console.error(
          "Supabase create error:",
          error,
        );
        throw error;
      }

      return mapSupabaseProduct(data);
    }

    const product: Product = {
      ...(input as Product),
      id: `p-${Date.now()}`,
      rating: 4.5,
      reviews: 0,
    };

    catalog = [product, ...catalog];

    return product;
  },

  async update(
    id: ID,
    input: Partial<Product>,
  ): Promise<Product> {
    if (!USE_MOCK_API) {
      const { data, error } = await supabase
        .from("products")
        .update(input)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error(
          "Supabase update error:",
          error,
        );
        throw error;
      }

      return mapSupabaseProduct(data);
    }

    catalog = catalog.map((p) =>
      p.id === id
        ? { ...p, ...input }
        : p,
    );

    const product = catalog.find(
      (p) => p.id === id,
    );

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  },

  async remove(id: ID): Promise<void> {
    if (!USE_MOCK_API) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return;
    }

    catalog = catalog.filter(
      (p) => p.id !== id,
    );
  },

  async categories(): Promise<Category[]> {
    return categoryList;
  },

  async createCategory(
    input: Omit<Category, "id">,
  ): Promise<Category> {
    const category: Category = {
      ...input,
      id: `c-${Date.now()}`,
    };

    categoryList = [
      category,
      ...categoryList,
    ];

    return category;
  },

  async updateCategory(
    id: ID,
    input: Partial<Category>,
  ): Promise<Category> {
    categoryList = categoryList.map(
      (c) =>
        c.id === id
          ? { ...c, ...input }
          : c,
    );

    const category = categoryList.find(
      (c) => c.id === id,
    );

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  },

  async removeCategory(
    id: ID,
  ): Promise<void> {
    categoryList = categoryList.filter(
      (c) => c.id !== id,
    );
  },
};