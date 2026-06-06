"use client";

/** Variant preview (VP wave) — rr-internal, stripped on `rr add`.
 *  Mounts the composed PageEditor over a localStorage-backed in-memory
 *  EditorDataAdapter — full block editing (slash menu, markdown triggers,
 *  drag, toolbar) persists per scenario, zero backend. */

import { useMemo, useRef } from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import type { Block, Page } from "./shared/types";
import { editor } from "./index";

const { EditorAdapterProvider, PageEditor } = editor;
const uid = () => Math.random().toString(36).slice(2, 10);

function mkPage(id: string, title: string, icon: string, blocks: Array<Partial<Block> & { type: Block["type"] }>): Page {
  return {
    id, title, icon, parentId: null, favorite: false, trashed: false,
    createdAt: 0, updatedAt: 0,
    blocks: blocks.map((b) => ({ text: "", ...b, id: uid() })),
  };
}

const SEED: Record<string, Page> = {
  starter: mkPage("starter", "Team notes", "📝", [
    { type: "h1", text: "Team notes" },
    { type: "paragraph", text: "Type **/** for blocks, or use markdown triggers — `# `, `- `, `> `…" },
    { type: "todo", text: "Try checking this off", checked: false },
    { type: "todo", text: "Drag blocks by the grip", checked: true },
    { type: "quote", text: "Everything you type here persists in localStorage." },
  ]),
  rich: mkPage("rich", "Launch plan", "🚀", [
    { type: "h1", text: "Launch plan" },
    { type: "callout", text: "Demo data — edits persist per scenario." },
    { type: "h2", text: "Checklist" },
    { type: "numbered", text: "Write the announcement" },
    { type: "numbered", text: "Ship the docs" },
    { type: "toggle", text: "Details", children: [], collapsed: true },
    { type: "code", text: "npx rr add notion", lang: "bash" },
    { type: "divider", text: "" },
    { type: "paragraph", text: "Inline math works too: $E = mc^2$" },
  ]),
};

const { useDemoStore } = createDemoStore<Record<string, Page>>({ slug: "notion", seed: SEED });

/** EditorAdapter over the demo store — single page per scenario, block CRUD
 *  writes through to localStorage. */
function useDemoAdapter(scenario: string) {
  const [pages, setPages, { ready }] = useDemoStore();
  const ref = useRef(pages);
  ref.current = pages;

  const adapter = useMemo(() => {
    const cur = () => ref.current[scenario];
    const mut = (fn: (p: Page) => Page) => {
      const next = { ...ref.current, [scenario]: fn(cur()) };
      ref.current = next;
      setPages(next);
    };
    const blocks = (fn: (bs: Block[]) => Block[]) => mut((p) => ({ ...p, blocks: fn(p.blocks) }));
    return {
      data: {
        user: { id: "demo", name: "Demo", email: "", icon: "🙂", color: "#888", bio: "" },
        pages: [] as Page[],
        workspaceId: "demo",
        getPage: (id: string) => (id === scenario ? cur() : undefined),
        childrenOf: () => [],
        addBlock: async (_p: string, after: number, type?: Block["type"], init?: Partial<Block>) => {
          const id = uid();
          blocks((bs) => {
            const next = [...bs];
            next.splice(after + 1, 0, { text: "", ...init, id, type: type ?? "paragraph" } as Block);
            return next;
          });
          return id;
        },
        updateBlock: async (_p: string, bid: string, patch: Partial<Block>) =>
          blocks((bs) => bs.map((b) => (b.id === bid ? { ...b, ...patch } : b))),
        deleteBlock: async (_p: string, bid: string) =>
          blocks((bs) => bs.filter((b) => b.id !== bid)),
        duplicateBlock: async (_p: string, bid: string) => {
          const id = uid();
          blocks((bs) => {
            const i = bs.findIndex((b) => b.id === bid);
            if (i === -1) return bs;
            const next = [...bs];
            next.splice(i + 1, 0, { ...bs[i], id });
            return next;
          });
          return id;
        },
        reorderBlocks: async (_p: string, ordered: string[]) =>
          blocks((bs) => {
            const by = new Map(bs.map((b) => [b.id, b]));
            const next = ordered.map((id) => by.get(id)).filter(Boolean) as Block[];
            return next.length === bs.length ? next : bs;
          }),
        setBlockType: async (_p: string, bid: string, type: Block["type"]) =>
          blocks((bs) => bs.map((b) => (b.id === bid ? { ...b, type } : b))),
        replaceBlock: async (_p: string, bid: string, nextBlock: Block) =>
          blocks((bs) => bs.map((b) => (b.id === bid ? nextBlock : b))),
        createPage: async () => ({ id: "" }),
        updatePage: async (_id: string, patch: Partial<Page>) => mut((p) => ({ ...p, ...patch })),
        deletePage: async () => {},
        duplicatePage: async () => null,
      },
    };
  }, [scenario, setPages]);

  return { adapter, ready };
}

const preview: SlicePreviewModule = {
  PageEditor: ({ variant }) => {
    const scenario = variant.scenario === "rich" ? "rich" : "starter";
    const { adapter, ready } = useDemoAdapter(scenario);
    if (!ready) return null;
    return (
      <div className="p-4">
        <div className="h-[420px] overflow-hidden rounded-lg border border-border bg-background">
          <EditorAdapterProvider adapter={adapter}>
            <PageEditor key={scenario} pageId={scenario} />
          </EditorAdapterProvider>
        </div>
      </div>
    );
  },
};

export default preview;
