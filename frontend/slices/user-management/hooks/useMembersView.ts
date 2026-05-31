"use client";

// Search + role-filter + sort state for the members list. Pure derive — no
// data fetching (the host passes `members`).

import { useMemo, useState } from "react";
import type { Member } from "../types";

export type SortKey = "name" | "role" | "joined";

export interface MembersView {
  query: string;
  setQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  toggleSort: (k: SortKey) => void;
  rows: Member[];
  total: number;
}

export function useMembersView(members: Member[] | undefined): MembersView {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (members ?? []).filter((m) => {
      if (roleFilter !== "all" && m.roleSlug !== roleFilter) return false;
      if (!q) return true;
      return (m.name ?? "").toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q);
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "name") { av = (a.name ?? a.email ?? "").toLowerCase(); bv = (b.name ?? b.email ?? "").toLowerCase(); }
      else if (sortKey === "role") { av = a.roleSlug; bv = b.roleSlug; }
      else { av = a.joinedAt ?? 0; bv = b.joinedAt ?? 0; }
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }, [members, query, roleFilter, sortKey, sortDir]);

  return { query, setQuery, roleFilter, setRoleFilter, sortKey, sortDir, toggleSort, rows, total: members?.length ?? 0 };
}
