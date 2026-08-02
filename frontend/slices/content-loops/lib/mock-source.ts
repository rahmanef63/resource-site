// createMockLoopSource — synthetic source so the slice runs env-free (preview,
// tests, first drop-in). Replace with your own LoopEntitySource that fetches
// from Convex/REST; the contract (fields + async fetch) is identical.

import type { LoopEntitySource, LoopItem, LoopQuery } from "./types";

const SAMPLE_TITLES = [
  "Shipping the visual canvas",
  "Why copy-first beats lock-in",
  "A repeater you can own",
  "Sources, not hardcoded lists",
  "Pagination without a backend",
  "From CMS engine to slice",
  "Variants round-robin",
  "Bind any field you like",
  "Env-free by default",
  "Swap the mock for Convex",
  "Namespaced source ids",
  "One contract, many backends",
];

const AUTHORS = ["Dina", "Arman", "Lia", "Budi"];

export interface MockLoopSourceOptions {
  /** Namespaced id (defaults to `mock.posts`). */
  id?: string;
  /** How many synthetic items to generate (defaults to 12). */
  count?: number;
}

export function createMockLoopSource(options: MockLoopSourceOptions = {}): LoopEntitySource {
  const id = options.id ?? "mock.posts";
  const count = options.count ?? 12;

  const items: LoopItem[] = Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    fields: {
      title: SAMPLE_TITLES[i % SAMPLE_TITLES.length],
      excerpt: `Synthetic excerpt #${i + 1} — swap createMockLoopSource() for a real source.`,
      author: AUTHORS[i % AUTHORS.length],
      order: i,
    },
  }));

  return {
    id,
    label: "Mock posts",
    description: "Synthetic in-memory items for previews and tests.",
    fields: [
      { id: "title", label: "Title" },
      { id: "excerpt", label: "Excerpt" },
      { id: "author", label: "Author" },
    ],
    orderByOptions: [
      { id: "order", label: "Default" },
      { id: "title", label: "Title" },
    ],
    async fetch(query: LoopQuery): Promise<{ items: LoopItem[]; totalItems: number }> {
      const key = query.orderBy ?? "order";
      const sorted = [...items].sort((a, b) => {
        const av = a.fields[key];
        const bv = b.fields[key];
        let cmp = 0;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        return query.direction === "desc" ? -cmp : cmp;
      });
      const page = sorted.slice(query.offset, query.offset + query.limit);
      return { items: page, totalItems: sorted.length };
    },
  };
}
