import type { NavGroupCore, NavItemCore } from "./core-types";

function normalize(p: string): string {
  const trimmed = (p || "/").split(/[?#]/)[0].replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function isActive(
  pathname: string,
  item: Pick<NavItemCore<unknown>, "href" | "exact" | "active">,
): boolean {
  if (item.active !== undefined) return item.active;
  if (!item.href) return false;
  const href = normalize(item.href);
  const path = normalize(pathname);
  if (item.exact || href === "/") return path === href;
  return path === href || path.startsWith(`${href}/`);
}

export function flattenNav<T extends NavItemCore<T>>(
  groups: NavGroupCore<T>[],
): T[] {
  return groups.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.items ?? [])]),
  );
}

export function deriveDock<T extends NavItemCore<T>>(
  groups: NavGroupCore<T>[],
  max = 4,
): T[] {
  const all = flattenNav(groups).filter((item) => item.href || item.onSelect);
  const flagged = all.filter((item) => item.dock);
  return (flagged.length ? flagged : all).slice(0, max);
}

export function activeItem<T extends NavItemCore<T>>(
  pathname: string,
  groups: NavGroupCore<T>[],
): T | undefined {
  return flattenNav(groups)
    .filter((item) => isActive(pathname, item))
    .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0];
}

export function activeTitle<T extends NavItemCore<T>>(
  pathname: string,
  groups: NavGroupCore<T>[],
): string {
  return activeItem(pathname, groups)?.label ?? "";
}
