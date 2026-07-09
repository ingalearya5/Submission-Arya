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

/** Categories shown in the sidebar filter (max 7). */
export const SIDEBAR_CATEGORIES = [
  "beauty",
  "smartphones",
  "laptops",
  "furniture",
  "groceries",
  "mens-shoes",
  "womens-dresses",
];

export function getSidebarCategories(products) {
  const available = new Set(products.map((p) => p.category));
  return SIDEBAR_CATEGORIES.filter((category) => available.has(category));
}

/** Derived from the cached catalog — no extra network call. */
export const getCategories = cache(async () => {
  const products = await getAllProducts();
  return getSidebarCategories(products);
});

/** Min/max price across the catalog. */
export function getPriceBounds(products) {
  if (!products.length) return { min: 0, max: 100 };
  const prices = products.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

/** Mirrors DummyJSON search fields: title, description, brand, category, tags. */
export function filterProducts(
  products,
  { query = "", category = "", minPrice, maxPrice } = {}
) {
  const trimmedQuery = query.trim();
  const trimmedCategory = category.trim();

  let result;

  if (trimmedQuery) {
    const q = trimmedQuery.toLowerCase();
    result = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  } else if (trimmedCategory) {
    result = products.filter((p) => p.category === trimmedCategory);
  } else {
    result = products;
  }

  if (minPrice != null && maxPrice != null) {
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  }

  return result;
}

export function paginateProducts(products, page, pageSize) {
  const total = products.length;
  const skip = (page - 1) * pageSize;
  return {
    products: products.slice(skip, skip + pageSize),
    total,
  };
}
