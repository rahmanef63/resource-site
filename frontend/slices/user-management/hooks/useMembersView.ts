"use client";

import { useMemo, useState } from "react";
import { deriveMembersView, nextSort, type SortDir, type SortKey } from "../lib/members-core";
import type { Member } from "../types";

export type { SortKey } from "../lib/members-core";

export interface MembersView {
  query: string;
  setQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  toggleSort: (k: SortKey) => void;
  rows: Member[];
  total: number;
}

export function useMembersView(members: Member[] | undefined): MembersView {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    const next = nextSort(sortKey, sortDir, key);
    setSortKey(next.sortKey);
    setSortDir(next.sortDir);
  };
  const rows = useMemo(
    () => deriveMembersView({ members, query, roleFilter, sortKey, sortDir }),
    [members, query, roleFilter, sortKey, sortDir],
  );
  return { query, setQuery, roleFilter, setRoleFilter, sortKey, sortDir, toggleSort, rows, total: members?.length ?? 0 };
}
