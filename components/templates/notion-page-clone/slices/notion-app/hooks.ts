"use client";

import { useMemo } from "react";
import type { NotionSidebarPage } from "@/features/notion-sidebar";
import { useDocs, useDatabases } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/** Build sidebar tree from docs + databases. Docs that are database rows
 *  are excluded — they show inside the database surface, not the tree.
 *  Databases appear as their own top-level entries with the 🗂 icon. */
export function useSidebarPages(): NotionSidebarPage[] {
  const docs = useDocs();
  const databases = useDatabases();
  return useMemo(() => {
    const docEntries: NotionSidebarPage[] = docs
      .filter((d) => !d.rowOfDatabaseId)
      .map((d) => ({ id: `doc:${d.id}`, title: d.title, icon: d.icon, parentId: d.parentId ? `doc:${d.parentId}` : null }));
    const dbEntries: NotionSidebarPage[] = databases.map((db) => ({
      id: `db:${db.id}`,
      title: db.name,
      icon: db.icon,
      parentId: null,
    }));
    return [...docEntries, ...dbEntries];
  }, [docs, databases]);
}

/** Parse a sidebar id ("doc:X" | "db:Y") into its absolute /public route. */
export function hrefFor(sidebarId: string): string {
  const [kind, id] = sidebarId.split(":");
  if (kind === "db") return `${PUBLIC_BASE}/db/${id}`;
  return `${PUBLIC_BASE}/d/${id}`;
}

/** Inverse — derive the active sidebar id from the current pathname. */
export function activeIdForPath(pathname: string): string | undefined {
  if (pathname.includes("/db/")) return `db:${pathname.split("/db/")[1]?.split("/")[0]}`;
  if (pathname.includes("/d/"))  return `doc:${pathname.split("/d/")[1]?.split("/")[0]}`;
  return undefined;
}
