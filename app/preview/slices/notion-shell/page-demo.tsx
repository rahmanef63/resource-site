"use client";

import * as React from "react";
import {
  NotionPage,
  NotionBlock,
  InsertBlockButton,
  InlineFormatToolbar,
  PageActionsMenu,
  PageBreadcrumbs,
  Subpages,
  focusBlock,
  type Block,
  type BlockType,
  type PageFont,
} from "@/features/notion-shell";
import { BLOCK_RENDERERS } from "./block-renderers";

const DEFAULT_BLOCKS: Block[] = [
  { id: "b1", type: "h2", text: "Hello from NotionPage" },
  { id: "b2", type: "paragraph", text: 'Type "/" anywhere to open the block picker. Select text for the format toolbar. Hover the "⋯" for colour.' },
  { id: "b3", type: "quote", text: "Pure props-driven — host owns the data." },
  { id: "b4", type: "callout", calloutKind: "tip", text: "Callout — click the icon to switch kind." },
  { id: "b5", type: "code", lang: "ts", text: "const greet = (n: string) => `hi ${n}`;" },
  { id: "b6", type: "equation", text: "E = mc^2" },
  { id: "b7", type: "table", text: "", tableHeader: true, tableRows: [["Feature", "Status"], ["Callout", "✓"], ["Table", "✓"]] },
  { id: "b8", type: "toggle", text: "Toggle — click the chevron; blocks nest inside", collapsed: false, children: [{ id: "b8a", type: "paragraph", text: "A nested child block." }, { id: "b8b", type: "callout", calloutKind: "note", text: "Even callouts nest." }] },
  { id: "bc", type: "columns2", text: "", columns: [[{ id: "bc1", type: "paragraph", text: "Left column." }], [{ id: "bc2", type: "callout", calloutKind: "tip", text: "Right column — blocks nest in each." }]] },
  { id: "bd", type: "database", text: "", databaseId: "inline" },
  { id: "b9", type: "page", text: "A sub-page reference" },
  { id: "b10", type: "button", text: "Open docs", url: "https://resource.rahmanef.com" },
  { id: "b11", type: "divider", text: "" },
];

export function PageDemo() {
  const [icon, setIcon] = React.useState("📘");
  const [title, setTitle] = React.useState("Untitled page");
  const [blocks, setBlocks] = React.useState<Block[]>(DEFAULT_BLOCKS);
  const [font, setFont] = React.useState<PageFont>("default");
  const [fullWidth, setFullWidth] = React.useState(false);
  const [smallText, setSmallText] = React.useState(false);
  const [locked, setLocked] = React.useState(false);

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const turnInto = (id: string, type: BlockType) =>
    setBlocks((cur) => cur.map((x) => (x.id === id ? { ...x, type } : x)));
  const remove = (id: string) =>
    setBlocks((cur) => {
      const next = cur.filter((x) => x.id !== id);
      return next.length ? next : [{ id: `b${Date.now()}`, type: "paragraph", text: "" }];
    });
  const duplicate = (id: string) =>
    setBlocks((cur) => {
      const i = cur.findIndex((x) => x.id === id);
      if (i === -1) return cur;
      const next = [...cur];
      next.splice(i + 1, 0, { ...cur[i]!, id: `b${Date.now()}` });
      return next;
    });
  const insert = (type: BlockType) =>
    setBlocks((cur) => [...cur, { id: `b${Date.now()}`, type, text: "" }]);
  const move = (id: string, dir: -1 | 1) =>
    setBlocks((cur) => {
      const i = cur.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  const insertAfter = (afterId: string, type: BlockType, init?: Partial<Block>) => {
    const id = `b${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setBlocks((cur) => {
      const i = cur.findIndex((x) => x.id === afterId);
      const next = [...cur];
      next.splice(i + 1, 0, { id, type, text: "", ...init });
      return next;
    });
    return id;
  };
  const mergeBack = (id: string) => {
    const i = blocks.findIndex((x) => x.id === id);
    if (i <= 0) return;
    const prev = blocks[i - 1]!;
    focusBlock(prev.id, (prev.text ?? "").length);
    setBlocks((cur) => {
      const j = cur.findIndex((x) => x.id === id);
      if (j <= 0) return cur;
      const p = cur[j - 1]!;
      const merged = { ...p, text: (p.text ?? "") + (cur[j]!.text ?? "") };
      return [...cur.slice(0, j - 1), merged, ...cur.slice(j + 1)];
    });
  };
  const focusSibling = (id: string, dir: -1 | 1) => {
    const sib = blocks[blocks.findIndex((x) => x.id === id) + dir];
    if (sib) focusBlock(sib.id, dir > 0 ? 0 : undefined);
  };

  return (
    <div className="h-[28rem] overflow-y-auto rounded-lg border border-border bg-background">
      <InlineFormatToolbar />
      <NotionPage
        icon={icon} title={title}
        onIconChange={setIcon} onTitleChange={setTitle}
        font={font} fullWidth={fullWidth} smallText={smallText} locked={locked}
        actions={
          <PageActionsMenu
            font={font} fullWidth={fullWidth} smallText={smallText} locked={locked}
            onSetFont={setFont}
            onToggleFullWidth={() => setFullWidth((v) => !v)}
            onToggleSmallText={() => setSmallText((v) => !v)}
            onToggleLock={() => setLocked((v) => !v)}
          />
        }
      >
        <PageBreadcrumbs
          items={[{ id: "root", label: "Workspace" }, { id: "p2", label: "Projects" }, { id: "cur", label: title }]}
          onNavigate={() => {}}
        />
        <div className="space-y-1">
          {blocks.map((b) => (
            <NotionBlock
              key={b.id}
              block={b}
              blockRenderers={BLOCK_RENDERERS}
              readOnly={locked}
              onUpdate={(patch) => update(b.id, patch)}
              onTurnInto={locked ? undefined : (type) => turnInto(b.id, type)}
              onDuplicate={() => duplicate(b.id)}
              onRemove={() => remove(b.id)}
              onMoveUp={() => move(b.id, -1)}
              onMoveDown={() => move(b.id, 1)}
              onInsertAfter={(type, init) => insertAfter(b.id, type, init)}
              onMergeBack={() => mergeBack(b.id)}
              onFocusSibling={(dir) => focusSibling(b.id, dir)}
            />
          ))}
          {!locked && (
            <div className="pt-3">
              <InsertBlockButton onInsert={insert} label="Add block" />
            </div>
          )}
          <Subpages
            pages={[{ id: "s1", title: "Meeting notes" }, { id: "s2", title: "Spec draft" }]}
            onOpen={() => {}}
            onCreate={() => {}}
          />
        </div>
      </NotionPage>
    </div>
  );
}
