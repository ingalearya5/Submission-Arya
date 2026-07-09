import { cache } from "react";

const PRODUCTS_URL = "https://dummyjson.com/products?limit=0";

/** Fetch the full catalog once; cached across requests for 1 hour. */
export const getAllProducts = cache(async () => {
  const res = await fetch(PRODUCTS_URL, {
    next: { revalidate: 3600, tags: ["products"] },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.products ?? [];
});

/** Derived from the cached catalog — no extra network call. */
export const getCategories = cache(async () => {
  const products = await getAllProducts();
  return [...new Set(products.map((p) => p.category))].sort();
});

/** Mirrors DummyJSON search fields: title, description, brand, category, tags. */
export function filterProducts(products, { query = "", category = "" } = {}) {
  const trimmedQuery = query.trim();
  const trimmedCategory = category.trim();

  if (trimmedQuery) {
    const q = trimmedQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (trimmedCategory) {
    return products.filter((p) => p.category === trimmedCategory);
  }

  return products;
}

export function paginateProducts(products, page, pageSize) {
  const total = products.length;
  const skip = (page - 1) * pageSize;
  return {
    products: products.slice(skip, skip + pageSize),
    total,
  };
}
