import type { PageBlock, PageEntry } from "../types";

export type PagesStore = {
  pages: PageEntry[];
  create: (entry: PageEntry) => void;
  update: (id: string, patch: Partial<Omit<PageEntry, "id" | "createdAt">>) => void;
  remove: (id: string) => void;
  reorderBlock: (id: string, from: number, to: number) => void;
};

export type CreateDialogMode =
  | { mode: "new" }
  | { mode: "dup"; source: PageEntry }
  | null;

export function orderPagesForAdmin(pages: PageEntry[]): PageEntry[] {
  return pages.slice().sort((a, b) =>
    a.systemPage === b.systemPage
      ? a.slug.localeCompare(b.slug)
      : a.systemPage
        ? -1
        : 1,
  );
}

export function createDialogDefaults(dialog: CreateDialogMode): {
  slug: string;
  title: string;
} {
  if (!dialog) return { slug: "", title: "" };
  if (dialog.mode === "new") return { slug: "new-page", title: "Untitled" };
  return {
    slug: `${dialog.source.slug}-copy`,
    title: `${dialog.source.title} (copy)`,
  };
}

export function pageHref(base: string, slug: string): string {
  const cleanBase = base === "/" ? "" : base.replace(/\/$/, "");
  const cleanSlug = slug.replace(/^\//, "");
  return cleanSlug ? `${cleanBase}/${cleanSlug}` || `/${cleanSlug}` : cleanBase || "/";
}

export function replaceBlock(blocks: PageBlock[], index: number, next: PageBlock): PageBlock[] {
  return blocks.map((block, i) => (i === index ? next : block));
}

export function removeBlock(blocks: PageBlock[], index: number): PageBlock[] {
  return blocks.filter((_, i) => i !== index);
}

export function moveBlock(blocks: PageBlock[], from: number, to: number): PageBlock[] {
  if (from === to || from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) {
    return blocks;
  }
  const next = blocks.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function editablePageSnapshot(page: PageEntry): string {
  return JSON.stringify({
    slug: page.slug,
    title: page.title,
    description: page.description,
    status: page.status,
    blocks: page.blocks,
  });
}
