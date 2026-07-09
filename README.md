# E-Commerce Product Multi-Filter Sidebar

A product browsing interface with real-time multi-criteria filtering and sorting, built with Next.js and Tailwind CSS. Product data is fetched from [DummyJSON](https://dummyjson.com/products).

## Features

- **Category filter** — checklist (Electronics, Apparel, Footwear, etc.)
- **Price range filter** — dual-point slider (min/max)
- **Rating filter** — minimum star rating (1–5)
- **Sort by** — Price: Low to High, Top Rated First
- **Instant updates** — grid updates on every filter/sort change, no submit button
- **Empty state** — "No items match your criteria" with a Reset Filters button
- **Combinatorial filtering** — all active filters apply together (AND logic)
- **Graceful fallback** — no filters selected = full inventory shown

## Tech Stack

- Next.js
- Tailwind CSS
- DummyJSON API

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Filtering Logic

1. Filter the full product dataset against active category, price range, and rating criteria.
2. Sort the filtered result set based on the selected "Sort By" option.
3. Render the final list to the grid.

If no filters are active, the full dataset is used as-is (no filtering applied).

## Project Structure

```
├── components/
│   ├── Sidebar.jsx
│   ├── ProductGrid.jsx
│   ├── ProductCard.jsx
│   └── SortDropdown.jsx
├── lib/
│   └── filterProducts.js
├── pages/
│   └── index.jsx
└── styles/
    └── globals.css
```

## Author

**Arya Ingale**
Email: aryaamol21@gmail.com
Phone: 9820172107