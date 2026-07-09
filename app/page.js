import { Fraunces, Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Topbar } from "./components/Topbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
});

const PAGE_SIZE = 10;

async function getProducts(page, query = "") {
  const skip = (page - 1) * PAGE_SIZE;
  const trimmed = query.trim();
  const url = trimmed
    ? `https://dummyjson.com/products/search?q=${encodeURIComponent(trimmed)}&limit=${PAGE_SIZE}&skip=${skip}`
    : `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

function buildPageHref(page, query = "") {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function StarRating({ rating }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-3 w-3 ${i <= full ? "fill-[#D98E04]" : "fill-[#E2DFD6]"}`}
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.6.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
      <span className="ml-1 font-[family-name:var(--font-mono)] text-[10px] text-[#9A9686]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// Builds a compact page list like: 1 … 4 5 [6] 7 8 … 20
function getPageNumbers(current, total) {
  const delta = 2;
  const range = [];
  const withDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last !== undefined) {
      if (i - last === 2) withDots.push(last + 1);
      else if (i - last !== 1) withDots.push("...");
    }
    withDots.push(i);
    last = i;
  }

  return withDots;
}

function Pagination({ currentPage, totalPages, query = "" }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  const navBtn =
    "flex h-9 items-center rounded-sm border border-[#E2DFD6] px-3 font-[family-name:var(--font-mono)] text-xs transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-1.5"
    >
      <Link
        href={buildPageHref(Math.max(1, currentPage - 1), query)}
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : undefined}
        className={`${navBtn} ${
          prevDisabled
            ? "pointer-events-none text-[#C9C6BB]"
            : "text-[#5B584F] hover:border-[#2F4F44] hover:text-[#2F4F44]"
        }`}
      >
        Prev
      </Link>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`dots-${idx}`}
            className="px-1.5 font-[family-name:var(--font-mono)] text-xs text-[#9A9686]"
          >
            ···
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageHref(p, query)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-sm font-[family-name:var(--font-mono)] text-xs transition-colors ${
              p === currentPage
                ? "bg-[#2F4F44] text-white"
                : "border border-[#E2DFD6] text-[#5B584F] hover:border-[#2F4F44] hover:text-[#2F4F44]"
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildPageHref(Math.min(totalPages, currentPage + 1), query)}
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
        className={`${navBtn} ${
          nextDisabled
            ? "pointer-events-none text-[#C9C6BB]"
            : "text-[#5B584F] hover:border-[#2F4F44] hover:text-[#2F4F44]"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const requestedPage = parseInt(sp?.page, 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const searchQuery = sp?.q?.trim() || "";

  let products = [];
  let total = 0;
  let loadError = null;

  try {
    const data = await getProducts(page, searchQuery);
    products = data.products || [];
    total = data.total || 0;
  } catch (err) {
    loadError = err.message;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-body)] text-[#1C1B19]`}
    >
      <Topbar defaultQuery={searchQuery} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {loadError && (
          <p className="font-[family-name:var(--font-mono)] text-sm text-red-700">
            Couldn&apos;t load products: {loadError}
          </p>
        )}

        {!loadError && searchQuery && (
          <p className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium italic text-[#1C1B19]">
            Results for &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {!loadError && total > 0 && (
          <p className="mb-6 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[#9A9686]">
            SHOWING {rangeStart}–{rangeEnd} OF {total}
          </p>
        )}

        {!loadError && searchQuery && total === 0 && (
          <p className="font-[family-name:var(--font-mono)] text-sm text-[#9A9686]">
            No products found. Try a different search term.
          </p>
        )}

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => {
            const hasDiscount = product.discountPercentage > 0;
            const originalPrice = hasDiscount
              ? product.price / (1 - product.discountPercentage / 100)
              : null;

            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-sm border border-[#E2DFD6] bg-white transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-[#FAF9F6] p-6">
                  {hasDiscount && (
                    <span className="absolute left-0 top-3 rounded-r-full bg-[#D98E04] py-1 pl-3 pr-2 font-[family-name:var(--font-mono)] text-[11px] font-bold text-white">
                      -{Math.round(product.discountPercentage)}%
                    </span>
                  )}
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="font-[family-name:var(--font-body)] text-[10px] font-semibold uppercase tracking-widest text-[#2F4F44]">
                    {product.category?.replace(/-/g, " ")}
                  </span>
                  <h2 className="line-clamp-2 text-sm font-medium leading-snug text-[#1C1B19]">
                    {product.title}
                  </h2>
                  <StarRating rating={product.rating} />
                  <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="font-[family-name:var(--font-mono)] text-lg font-bold text-[#1C1B19]">
                      ${product.price}
                    </span>
                    {hasDiscount && (
                      <span className="font-[family-name:var(--font-mono)] text-xs text-[#9A9686] line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} query={searchQuery} />
      </main>
    </div>
  );
}