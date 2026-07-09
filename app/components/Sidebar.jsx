"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function formatCategory(slug) {
  return slug.replace(/-/g, " ");
}

function buildFilterHref(category, searchParams) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const q = searchParams.get("q");
  if (q) params.set("q", q);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  const minRating = searchParams.get("minRating");
  if (minRating) params.set("minRating", minRating);
  const sort = searchParams.get("sort");
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function StarIcons({ count, size = "h-3 w-3" }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`${size} ${i <= count ? "fill-[#D98E04]" : "fill-[#E2DFD6]"}`}
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.6.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function MinRatingFilter({ activeMinRating = 0 }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value) {
    const params = new URLSearchParams(searchParams.toString());
    const rating = Number(value);

    if (rating >= 1 && rating <= 5) {
      params.set("minRating", String(rating));
    } else {
      params.delete("minRating");
    }

    params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const optionClass =
    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 transition-colors hover:bg-white has-[:checked]:bg-white";

  return (
    <fieldset className="mt-6">
      <legend className="mb-3 font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-widest text-[#9A9686]">
        Minimum Rating
      </legend>
      <div className="flex flex-col gap-0.5">
        <label className={optionClass}>
          <input
            type="radio"
            name="minRating"
            value=""
            checked={!activeMinRating}
            onChange={() => handleChange("")}
            className="accent-[#2F4F44]"
          />
          <span className="font-[family-name:var(--font-body)] text-sm text-[#5B584F]">
            Any
          </span>
        </label>
        {[1, 2, 3, 4, 5].map((stars) => (
          <label key={stars} className={optionClass}>
            <input
              type="radio"
              name="minRating"
              value={stars}
              checked={activeMinRating === stars}
              onChange={() => handleChange(stars)}
              className="accent-[#2F4F44]"
            />
            <StarIcons count={stars} />
            <span className="sr-only">{stars} stars and up</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PriceRangeSlider({ bounds, minValue, maxValue }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);

  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  const pushPriceRange = useCallback(
    (nextMin, nextMax) => {
      const params = new URLSearchParams(searchParams.toString());
      const atFullRange = nextMin <= bounds.min && nextMax >= bounds.max;

      if (atFullRange) {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        params.set("minPrice", String(nextMin));
        params.set("maxPrice", String(nextMax));
      }

      params.delete("page");

      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [bounds.max, bounds.min, router, searchParams]
  );

  function handleMinChange(e) {
    const value = Math.min(Number(e.target.value), localMax);
    setLocalMin(value);
    pushPriceRange(value, localMax);
  }

  function handleMaxChange(e) {
    const value = Math.max(Number(e.target.value), localMin);
    setLocalMax(value);
    pushPriceRange(localMin, value);
  }

  const range = bounds.max - bounds.min || 1;
  const minPercent = ((localMin - bounds.min) / range) * 100;
  const maxPercent = ((localMax - bounds.min) / range) * 100;

  return (
    <div className="mt-6">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-widest text-[#9A9686]">
        Price Range
      </p>
      <div className="px-1">
        <div className="relative h-6">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#E2DFD6]" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#2F4F44]"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            value={localMin}
            onChange={handleMinChange}
            aria-label="Minimum price"
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2F4F44] [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2F4F44] [&::-webkit-slider-thumb]:bg-white"
          />
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            value={localMax}
            onChange={handleMaxChange}
            aria-label="Maximum price"
            className="pointer-events-none absolute inset-x-0 top-1/2 z-30 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2F4F44] [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2F4F44] [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-[family-name:var(--font-mono)] text-xs text-[#5B584F]">
          <span>${localMin}</span>
          <span>${localMax}</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  categories = [],
  activeCategory = "",
  priceBounds = { min: 0, max: 100 },
  activeMinPrice,
  activeMaxPrice,
  activeMinRating = 0,
}) {
  const searchParams = useSearchParams();
  const minValue = activeMinPrice ?? priceBounds.min;
  const maxValue = activeMaxPrice ?? priceBounds.max;

  const linkBase =
    "block rounded-sm px-3 py-2 font-[family-name:var(--font-body)] text-sm capitalize transition-colors";

  return (
    <aside className="w-full shrink-0 lg:w-44">
      <nav aria-label="Filter by category" className="lg:sticky lg:top-24">
        <p className="mb-3 font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-widest text-[#9A9686]">
          Category
        </p>
        <ul className="flex flex-col gap-0.5">
          <li>
            <Link
              href={buildFilterHref("", searchParams)}
              aria-current={!activeCategory ? "page" : undefined}
              className={`${linkBase} ${
                !activeCategory
                  ? "bg-[#2F4F44] text-white"
                  : "text-[#5B584F] hover:bg-white hover:text-[#2F4F44]"
              }`}
            >
              All
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={buildFilterHref(category, searchParams)}
                aria-current={activeCategory === category ? "page" : undefined}
                className={`${linkBase} ${
                  activeCategory === category
                    ? "bg-[#2F4F44] text-white"
                    : "text-[#5B584F] hover:bg-white hover:text-[#2F4F44]"
                }`}
              >
                {formatCategory(category)}
              </Link>
            </li>
          ))}
        </ul>

        <PriceRangeSlider
          bounds={priceBounds}
          minValue={minValue}
          maxValue={maxValue}
        />

        <MinRatingFilter activeMinRating={activeMinRating} />
      </nav>
    </aside>
  );
}
