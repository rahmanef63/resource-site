import type { Member } from "../types";

export type SortKey = "name" | "role" | "joined";
export type SortDir = "asc" | "desc";

export type MembersViewInput = {
  members: readonly Member[] | undefined;
  query: string;
  roleFilter: string;
  sortKey: SortKey;
  sortDir: SortDir;
};

export function nextSort(
  currentKey: SortKey,
  currentDir: SortDir,
  nextKey: SortKey,
): { sortKey: SortKey; sortDir: SortDir } {
  return nextKey === currentKey
    ? { sortKey: currentKey, sortDir: currentDir === "asc" ? "desc" : "asc" }
    : { sortKey: nextKey, sortDir: "asc" };
}

export function deriveMembersView(input: MembersViewInput): Member[] {
  const q = input.query.trim().toLowerCase();
  const list = (input.members ?? []).filter((member) => {
    if (input.roleFilter !== "all" && member.roleSlug !== input.roleFilter) return false;
    if (!q) return true;
    return (member.name ?? "").toLowerCase().includes(q)
      || (member.email ?? "").toLowerCase().includes(q);
  });
  const direction = input.sortDir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    if (input.sortKey === "name") {
      av = (a.name ?? a.email ?? "").toLowerCase();
      bv = (b.name ?? b.email ?? "").toLowerCase();
    } else if (input.sortKey === "role") {
      av = a.roleSlug;
      bv = b.roleSlug;
    } else {
      av = a.joinedAt ?? 0;
      bv = b.joinedAt ?? 0;
    }
    return av < bv ? -direction : av > bv ? direction : 0;
  });
}
