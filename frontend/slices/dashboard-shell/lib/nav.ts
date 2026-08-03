import type { NavGroup, NavItem } from "./types";

function normalize(p: string): string {
  const trimmed = (p || "/").split(/[?#]/)[0].replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Prefix-match on whole segments (`/a/b` matches `/a`, `/ab` does not). */
export function isActive(
  pathname: string,
  item: Pick<NavItem, "href" | "exact">,
): boolean {
  if (!item.href) return false;
  const href = normalize(item.href);
  const path = normalize(pathname);
  if (item.exact || href === "/") return path === href;
  return path === href || path.startsWith(`${href}/`);
}

/** Every item + sub-item, depth-first — one source for dock + title lookup. */
export function flattenNav(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) =>
    g.items.flatMap((i) => [i, ...(i.items ?? [])]),
  );
}

/** Dock items: the ones flagged `dock`, else the first `max` linkable items. */
export function deriveDock(groups: NavGroup[], max = 4): NavItem[] {
  const all = flattenNav(groups).filter((i) => i.href || i.onSelect);
  const flagged = all.filter((i) => i.dock);
  return (flagged.length ? flagged : all).slice(0, max);
}

/** Longest active href wins, so `/settings/billing` beats `/settings`. */
export function activeItem(
  pathname: string,
  groups: NavGroup[],
): NavItem | undefined {
  return flattenNav(groups)
    .filter((i) => isActive(pathname, i))
    .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0];
}

/** Default topbar heading — the active item's label. */
export function activeTitle(pathname: string, groups: NavGroup[]): string {
  return activeItem(pathname, groups)?.label ?? "";
}
