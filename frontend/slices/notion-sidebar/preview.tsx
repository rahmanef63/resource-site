"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { NotionSidebar } from "./components/NotionSidebar";
import type { NotionSidebarPage } from "./types";

const NESTED: NotionSidebarPage[] = [
  { id: "getting-started", title: "Getting Started", icon: "🚀", parentId: null },
  { id: "setup", title: "Setup", icon: "⚙️", parentId: "getting-started" },
  { id: "deploy", title: "Deploy", icon: "📦", parentId: "getting-started" },
  { id: "notes", title: "Notes", icon: "📝", parentId: null },
  { id: "ideas", title: "Ideas", icon: "💡", parentId: "notes" },
];
const FLAT: NotionSidebarPage[] = [
  { id: "inbox", title: "Inbox", icon: "📥", parentId: null },
  { id: "tasks", title: "Tasks", icon: "✅", parentId: null },
  { id: "archive", title: "Archive", icon: "🗄️", parentId: null },
];

const SEEDS: Record<string, NotionSidebarPage[]> = {
  "nested-tree": NESTED,
  "with-icons": NESTED,
  "flat-list": FLAT,
};

const { useDemoStore } = createDemoStore({ slug: "notion-sidebar", seed: NESTED });

const preview: SlicePreviewModule = {
  NotionSidebar: ({ variant }) => {
    const scenario = variant.scenario ?? "nested-tree";
    const [pages, setPages, { ready }] = useDemoStore();
    if (!ready) return null;
    const data = scenario === "nested-tree" ? pages : SEEDS[scenario] ?? pages;
    const withIcons = scenario !== "flat-list";
    return (
      <div className="p-4">
        <div className="h-[360px] overflow-hidden rounded-lg border bg-card/40">
          <NotionSidebar
            pages={data}
            activeId={data[0]?.id}
            renderIcon={
              withIcons
                ? (icon, cls) => <span className={cls}>{icon}</span>
                : () => null
            }
            onRename={(id, title) =>
              setPages((p) => p.map((x) => (x.id === id ? { ...x, title } : x)))
            }
            onCreate={(parentId) =>
              setPages((p) => [
                ...p,
                { id: `p-${Date.now()}`, title: "Untitled", icon: "📄", parentId },
              ])
            }
            onDelete={(id) => setPages((p) => p.filter((x) => x.id !== id))}
          />
        </div>
      </div>
    );
  },
};
export default preview;
