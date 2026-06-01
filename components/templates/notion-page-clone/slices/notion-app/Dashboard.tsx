"use client";

import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NotionSidebar } from "@/features/notion-sidebar";
import { DynamicIcon, IconPickerPopover } from "@/features/icon-picker";
import { FilesAdapterProvider, useLocalStorageFilesAdapter } from "@/features/files";
import { useStore, useDocs, useDatabases } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { useSidebarPages, hrefFor, activeIdForPath } from "./hooks";
import { DocView } from "./DocView";
import { DatabaseView } from "./DatabaseView";
import { WorkspaceTopBar, type Crumb } from "./WorkspaceTopBar";

function renderRowIcon(icon: string, className?: string) {
  return <DynamicIcon value={icon} className={className} />;
}

function renderRowIconPicker({
  value, onChange, children,
}: { value: string; onChange: (next: string) => void; children: ReactNode }) {
  return (
    <IconPickerPopover value={value} onChange={onChange} onClear={() => onChange("📄")}>
      {children}
    </IconPickerPopover>
  );
}

/** Notion-clone dashboard. Sidebar on left lists docs + databases; main
 *  panel renders WorkspaceTopBar (breadcrumb + share/star) then the
 *  active entity (doc/database). Sidebar CRUD callbacks dispatch
 *  reducer actions + navigate. */
export function Dashboard({
  activeKind, activeId,
}: {
  activeKind?: "doc" | "db";
  activeId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { dispatch } = useStore();
  const pages = useSidebarPages();
  const docs = useDocs();
  const databases = useDatabases();
  const filesAdapter = useLocalStorageFilesAdapter();
  const sidebarActive =
    activeKind && activeId
      ? `${activeKind === "db" ? "db" : "doc"}:${activeId}`
      : activeIdForPath(pathname);

  const handleSelect = (sid: string) => router.push(hrefFor(sid));

  const handleCreate = (parentSid: string | null) => {
    if (parentSid && parentSid.startsWith("db:")) return;
    const parentDocId = parentSid?.startsWith("doc:") ? parentSid.slice(4) : null;
    const id = `doc-${Date.now().toString(36)}`;
    dispatch({
      type: "doc.create",
      doc: {
        id,
        parentId: parentDocId,
        title: "Untitled",
        icon: "📄",
        blocks: [],
        favorite: false,
        trashed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    router.push(hrefFor(`doc:${id}`));
  };

  const handleRename = (sid: string, title: string) => {
    if (sid.startsWith("db:")) {
      dispatch({ type: "db.update", id: sid.slice(3), patch: { name: title } });
    } else {
      dispatch({ type: "doc.update", id: sid.slice(4), patch: { title } });
    }
  };

  const handleDelete = (sid: string) => {
    if (sid.startsWith("db:")) {
      dispatch({ type: "db.delete", id: sid.slice(3) });
    } else {
      dispatch({ type: "doc.delete", id: sid.slice(4) });
    }
  };

  // Drag-reorder/reparent — only docs nest; databases stay top-level.
  const handleMove = (sid: string, parentSid: string | null, beforeSid: string | null) => {
    if (!sid.startsWith("doc:")) return;
    const parentId = parentSid?.startsWith("doc:") ? parentSid.slice(4) : null;
    const beforeId = beforeSid?.startsWith("doc:") ? beforeSid.slice(4) : null;
    dispatch({ type: "doc.move", id: sid.slice(4), parentId, beforeId });
  };

  const handleIconChange = (sid: string, icon: string) => {
    if (sid.startsWith("db:")) dispatch({ type: "db.update", id: sid.slice(3), patch: { icon } });
    else dispatch({ type: "doc.update", id: sid.slice(4), patch: { icon } });
  };

  const { crumbs, starred, onStar, onShare } = buildTopBar({
    activeKind, activeId, docs, databases,
    onToggleStar: (kind, id) => {
      if (kind === "doc") {
        const d = docs.find((x) => x.id === id);
        if (d) dispatch({ type: "doc.update", id, patch: { favorite: !d.favorite } });
      }
    },
  });

  return (
    <FilesAdapterProvider adapter={filesAdapter}>
    <div className="flex h-dvh overflow-hidden bg-background">
      <NotionSidebar
        pages={pages}
        activeId={sidebarActive}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
        onMove={handleMove}
        onIconChange={handleIconChange}
        renderIcon={renderRowIcon}
        renderIconPicker={renderRowIconPicker}
        label="Workspace"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <WorkspaceTopBar
          crumbs={crumbs}
          homeHref={PUBLIC_BASE}
          starred={starred}
          onToggleStar={onStar}
          onShare={onShare}
        />
        <div className="flex-1 overflow-hidden">
          {activeKind === "db" && activeId ? (
            <DatabaseView dbId={activeId} />
          ) : activeKind === "doc" && activeId ? (
            <DocView docId={activeId} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
    </FilesAdapterProvider>
  );
}

function buildTopBar({
  activeKind, activeId, docs, databases, onToggleStar,
}: {
  activeKind?: "doc" | "db";
  activeId?: string;
  docs: ReturnType<typeof useDocs>;
  databases: ReturnType<typeof useDatabases>;
  onToggleStar: (kind: "doc" | "db", id: string) => void;
}): { crumbs: Crumb[]; starred: boolean; onStar?: () => void; onShare?: () => void } {
  if (activeKind === "db" && activeId) {
    const db = databases.find((d) => d.id === activeId);
    return {
      crumbs: [{ label: db?.name ?? "Database", icon: db?.icon }],
      starred: false,
      onShare: () => navigator.clipboard?.writeText(`${PUBLIC_BASE}/db/${activeId}`),
    };
  }
  if (activeKind === "doc" && activeId) {
    const doc = docs.find((d) => d.id === activeId);
    const ancestors: Crumb[] = [];
    let cursor = doc?.parentId ?? null;
    while (cursor) {
      const p = docs.find((d) => d.id === cursor);
      if (!p) break;
      ancestors.unshift({ label: p.title, icon: p.icon, href: `${PUBLIC_BASE}/d/${p.id}` });
      cursor = p.parentId ?? null;
    }
    return {
      crumbs: [...ancestors, { label: doc?.title ?? "Untitled", icon: doc?.icon }],
      starred: !!doc?.favorite,
      onStar: () => onToggleStar("doc", activeId),
      onShare: () => navigator.clipboard?.writeText(`${PUBLIC_BASE}/d/${activeId}`),
    };
  }
  return { crumbs: [{ label: "Workspace" }], starred: false };
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-12 text-center">
      <span className="text-5xl">📓</span>
      <h2 className="text-lg font-semibold">No page selected</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Pick a doc or database from the sidebar, or hover a row → click the + button to create a new page.
      </p>
    </div>
  );
}
