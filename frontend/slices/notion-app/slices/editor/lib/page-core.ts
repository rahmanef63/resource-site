import type { Block, BlockType, Page } from "@notion/shared/types";
import { uid } from "@notion/shared/lib/uid";
import { blocksToMarkdown, markdownToBlocks } from "@notion/shared/lib/markdown";
import type { EditorDataAdapter } from "./dataAdapter";
import { NOOP_DATA_ADAPTER } from "./dataAdapter";

export type PageEditorSnapshot = { page: Page | null; version: number; canUndo: boolean; canRedo: boolean };
export type PageListener = (snapshot: PageEditorSnapshot) => void;

const clone = <T>(value: T): T => structuredClone(value);
const makeBlock = (type: BlockType = "paragraph", init: Partial<Block> = {}): Block => ({ id: uid(), type, text: "", ...init });

export function createPageEditorCore(opts: {
  pageId: string; data?: EditorDataAdapter; initialPage?: Page | null; onChange?: (page: Page) => void;
}) {
  const data = opts.data ?? NOOP_DATA_ADAPTER;
  let page = opts.initialPage ? clone(opts.initialPage) : data.getPage(opts.pageId) ? clone(data.getPage(opts.pageId)!) : null;
  let version = 0, past: Page[] = [], future: Page[] = [];
  const listeners = new Set<PageListener>();
  const snapshot = (): PageEditorSnapshot => ({ page, version, canUndo: past.length > 0, canRedo: future.length > 0 });
  const emit = () => { version++; const value = snapshot(); for (const fn of listeners) fn(value); };
  const commit = (next: Page, record = true) => {
    if (page && record) { past.push(clone(page)); if (past.length > 80) past.shift(); future = []; }
    page = next; opts.onChange?.(clone(next)); emit();
  };
  const savePage = async (next: Page, record = true) => { commit(next, record); await data.updatePage(next.id, next); };
  const mutateBlock = async (id: string, patch: Partial<Block>) => {
    if (!page) return;
    const next = { ...page, blocks: page.blocks.map((b) => b.id === id ? { ...b, ...patch } : b), updatedAt: Date.now() };
    commit(next); await data.updateBlock(page.id, id, patch);
  };
  return {
    getSnapshot: snapshot,
    subscribe(fn: PageListener) { listeners.add(fn); return () => listeners.delete(fn); },
    refresh(next?: Page | null) { const resolved = next ?? data.getPage(opts.pageId) ?? null; page = resolved ? clone(resolved) : null; past = []; future = []; emit(); },
    async updateTitle(title: string) { if (page) await savePage({ ...page, title, updatedAt: Date.now() }); },
    updateBlock: mutateBlock,
    async addBlock(after: number, type: BlockType = "paragraph", init: Partial<Block> = {}) {
      if (!page) return "";
      const remoteId = await data.addBlock(page.id, after, type, init);
      const block = makeBlock(type, { ...init, id: remoteId || uid() });
      const blocks = [...page.blocks]; blocks.splice(after + 1, 0, block);
      commit({ ...page, blocks, updatedAt: Date.now() }); return block.id;
    },
    async duplicateBlock(id: string) {
      if (!page) return ""; const index = page.blocks.findIndex((b) => b.id === id); if (index < 0) return "";
      const remoteId = await data.duplicateBlock(page.id, id); const block = { ...clone(page.blocks[index]), id: remoteId || uid() };
      const blocks = [...page.blocks]; blocks.splice(index + 1, 0, block); commit({ ...page, blocks }); return block.id;
    },
    async deleteBlock(id: string) { if (!page || page.blocks.length <= 1) return; commit({ ...page, blocks: page.blocks.filter((b) => b.id !== id) }); await data.deleteBlock(page.id, id); },
    async reorder(orderedIds: string[]) { if (!page) return; const by = new Map(page.blocks.map((b) => [b.id, b])); const blocks = orderedIds.map((id) => by.get(id)).filter(Boolean) as Block[]; if (blocks.length !== page.blocks.length) return; commit({ ...page, blocks }); await data.reorderBlocks(page.id, orderedIds); },
    async move(id: string, delta: number) { if (!page) return; const ids = page.blocks.map((b) => b.id); const from = ids.indexOf(id), to = Math.max(0, Math.min(ids.length - 1, from + delta)); if (from < 0 || from === to) return; ids.splice(to, 0, ids.splice(from, 1)[0]); await this.reorder(ids); },
    async createChild(blockId: string) { if (!page) return; const child = await data.createPage(page.id, { title: "New page" }); await mutateBlock(blockId, { type: "page", text: "New page", pageId: child.id }); },
    exportMarkdown() { return page ? blocksToMarkdown(page.blocks) : ""; },
    async importMarkdown(text: string) { if (!page) return; await savePage({ ...page, blocks: markdownToBlocks(text), updatedAt: Date.now() }); },
    async undo() { if (!page) return; const prev = past.pop(); if (!prev) return; future.push(clone(page)); await savePage(prev, false); },
    async redo() { if (!page) return; const next = future.pop(); if (!next) return; past.push(clone(page)); await savePage(next, false); },
  };
}
export type PageEditorCore = ReturnType<typeof createPageEditorCore>;
