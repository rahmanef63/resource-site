import type { PageEntry } from "../types";

/** Shell-agnostic nav item — map this into your own admin sidebar item
 *  shape (icon, count badge, active state are your shell's concern). */
export type PageNavItem = {
  id: string;
  label: string;
  href: string;
  status: PageEntry["status"];
};

/**
 * Derive sidebar nav items from the pages store. Every non-system page
 * becomes one item linking to its editor. Pure function — call it inside
 * your nav builder so the sidebar re-renders the moment a page is
 * created in admin.
 *
 * @param pages    current `pages[]`
 * @param baseHref absolute prefix to the page editor (e.g. `${ADMIN_BASE}/pages`)
 * @param opts.status  "all" (default) shows drafts + published; "published" hides drafts
 * @param opts.sort    "alpha" (default), "updated" (newest first), "created" (newest first)
 */
export function buildPageNavItems(
  pages: PageEntry[],
  baseHref: string,
  opts?: {
    status?: "all" | "published";
    sort?: "alpha" | "updated" | "created";
  },
): PageNavItem[] {
  const statusFilter = opts?.status ?? "all";
  const sortMode = opts?.sort ?? "alpha";

  const list = pages.filter((p) => !p.systemPage);
  const filtered =
    statusFilter === "all" ? list : list.filter((p) => p.status === "published");

  filtered.sort((a, b) => {
    if (sortMode === "alpha") return (a.title || "").localeCompare(b.title || "");
    if (sortMode === "updated") return b.updatedAt - a.updatedAt;
    return b.createdAt - a.createdAt;
  });

  return filtered.map((p) => ({
    id: `pages-custom-${p.id}`,
    label: p.title || "Untitled",
    href: `${baseHref}/${p.id}`,
    status: p.status,
  }));
}
