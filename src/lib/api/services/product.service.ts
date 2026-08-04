import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockCategories } from "../mock/db";
import { products as mockProducts } from "../../products";
import type { Category, ID, Product, ProductInput } from "../../../types/models";

/** In-memory overlay so admin CRUD works against mock data. */
let catalog: Product[] = [...mockProducts];
let categoryList: Category[] = [...mockCategories];

export type ProductQuery = {
  search?: string;
  category?: string;
  tag?: string;
  sort?: "popular" | "price-asc" | "price-desc" | "rating";
};

function applyQuery(list: Product[], q: ProductQuery): Product[] {
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
  if (q.category) out = out.filter((p) => p.category.toLowerCase() === q.category!.toLowerCase());
  if (q.tag) out = out.filter((p) => p.tags?.includes(q.tag!));
  if (q.sort === "price-asc") out.sort((a, b) => a.price - b.price);
  if (q.sort === "price-desc") out.sort((a, b) => b.price - a.price);
  if (q.sort === "rating") out.sort((a, b) => b.rating - a.rating);
  return out;
}

export const productService = {
  async list(query: ProductQuery = {}): Promise<Product[]> {
    if (!USE_MOCK_API) return apiFetch<Product[]>(ENDPOINTS.products.list, { query });
    return mockDelay(applyQuery(catalog, query));
  },

  async get(id: ID): Promise<Product | null> {
    if (!USE_MOCK_API) return apiFetch<Product>(ENDPOINTS.products.detail(id));
    return mockDelay(catalog.find((p) => p.id === id) ?? null);
  },

  async create(input: ProductInput): Promise<Product> {
    if (!USE_MOCK_API) return apiFetch<Product>(ENDPOINTS.products.create, { method: "POST", body: input });
    const product: Product = { rating: 4.5, reviews: 0, ...input, id: `p-${Date.now()}` };
    catalog = [product, ...catalog];
    return mockDelay(product, 400);
  },

  async update(id: ID, input: Partial<ProductInput>): Promise<Product> {
    if (!USE_MOCK_API) return apiFetch<Product>(ENDPOINTS.products.update(id), { method: "PUT", body: input });
    catalog = catalog.map((p) => (p.id === id ? { ...p, ...input } : p));
    return mockDelay(catalog.find((p) => p.id === id)!, 400);
  },

  async remove(id: ID): Promise<void> {
    if (!USE_MOCK_API) {
      await apiFetch<void>(ENDPOINTS.products.remove(id), { method: "DELETE" });
      return;
    }
    catalog = catalog.filter((p) => p.id !== id);
    await mockDelay(null, 300);
  },

  async categories(): Promise<Category[]> {
    if (!USE_MOCK_API) return apiFetch<Category[]>(ENDPOINTS.products.categories);
    return mockDelay(categoryList);
  },

  async createCategory(input: Omit<Category, "id">): Promise<Category> {
    if (!USE_MOCK_API)
      return apiFetch<Category>(ENDPOINTS.products.categoryCreate, { method: "POST", body: input });
    const category: Category = { ...input, id: `c-${Date.now()}` };
    categoryList = [category, ...categoryList];
    return mockDelay(category, 300);
  },

  async updateCategory(id: ID, input: Partial<Category>): Promise<Category> {
    if (!USE_MOCK_API)
      return apiFetch<Category>(ENDPOINTS.products.categoryUpdate(id), { method: "PUT", body: input });
    categoryList = categoryList.map((c) => (c.id === id ? { ...c, ...input } : c));
    return mockDelay(categoryList.find((c) => c.id === id)!, 300);
  },

  async removeCategory(id: ID): Promise<void> {
    if (!USE_MOCK_API) {
      await apiFetch<void>(ENDPOINTS.products.categoryRemove(id), { method: "DELETE" });
      return;
    }
    categoryList = categoryList.filter((c) => c.id !== id);
    await mockDelay(null, 250);
  },
};
