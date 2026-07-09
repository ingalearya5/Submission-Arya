import Link from "next/link";

function formatCategory(slug) {
  return slug.replace(/-/g, " ");
}

function buildFilterHref(category = "") {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function Sidebar({ categories = [], activeCategory = "" }) {
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
              href={buildFilterHref("")}
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
                href={buildFilterHref(category)}
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
      </nav>
    </aside>
  );
}
