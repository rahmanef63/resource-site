"use client";

import { useRouter, usePathname } from "next/navigation";
import { NotionSidebar } from "@/features/notion-shell";
import { DynamicIcon } from "@/features/icon-picker";
import { useStore } from "../../shared/store";
import { useSidebarPages, hrefFor, activeIdForPath } from "./hooks";
import { DocView } from "./DocView";
import { DatabaseView } from "./DatabaseView";

function renderRowIcon(icon: string, className?: string) {
  return <DynamicIcon value={icon} className={className} />;
}

/** Notion-clone dashboard. Sidebar on left lists docs + databases; main
 *  panel renders the active entity (doc/database) based on the URL
 *  segment. Sidebar CRUD callbacks dispatch reducer actions + navigate. */
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

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <NotionSidebar
        pages={pages}
        activeId={sidebarActive}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
        renderIcon={renderRowIcon}
        label="Workspace"
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
  );
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
