"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "../lib/products";

export function Topbar({ defaultQuery = "", activeSort = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  function buildSearchUrl(value) {
    const trimmed = value.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    params.delete("page");

    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  // Live search: debounce URL updates as the user types
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const trimmed = query.trim();
    const currentQ = searchParams.get("q") || "";
    if (trimmed === currentQ) return; // nothing actually changed

    const timer = setTimeout(() => {
      router.replace(buildSearchUrl(query), { scroll: false });
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleSubmit(e) {
    e.preventDefault();
    router.push(buildSearchUrl(query));
  }

  function handleSortChange(e) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set("sort", value);
    else params.delete("sort");

    params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[#E2DFD6] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4 sm:gap-6">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-display)] text-xl font-semibold italic text-[#2F4F44]"
        >
          Curated
        </Link>

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-[#9A9686]"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="h-10 w-full rounded-sm border border-[#E2DFD6] bg-[#FAF9F6] pl-10 pr-4 font-[family-name:var(--font-body)] text-sm text-[#1C1B19] placeholder:text-[#9A9686] transition-colors focus:border-[#2F4F44] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="h-10 shrink-0 rounded-sm border border-[#2F4F44] bg-[#2F4F44] px-4 font-[family-name:var(--font-mono)] text-xs font-medium text-white transition-colors hover:bg-[#243D35]"
          >
            Search
          </button>
        </form>

        <div className="shrink-0">
          <label htmlFor="sort-by" className="sr-only">
            Sort by
          </label>
          <select
            id="sort-by"
            value={activeSort}
            onChange={handleSortChange}
            aria-label="Sort by"
            className="h-10 cursor-pointer rounded-sm border border-[#E2DFD6] bg-[#FAF9F6] px-3 font-[family-name:var(--font-mono)] text-xs text-[#1C1B19] transition-colors focus:border-[#2F4F44] focus:bg-white focus:outline-none"
          >
            <option value="">Sort By</option>
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}