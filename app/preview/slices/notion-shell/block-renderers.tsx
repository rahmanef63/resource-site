"use client";

/** App-level block-renderer wiring for the notion-shell preview. Maps the
 *  sibling code/equation slices' own prop shapes onto BlockRendererProps
 *  (notion-shell can't import another slice's frontend — compose here),
 *  then builds the default registry. */

import * as React from "react";
import {
  createDefaultBlockRenderers,
  type BlockRendererProps,
  type BlockRenderers,
} from "@/features/notion-shell";
import { CodeBlock } from "@/features/code-block";
import { EquationBlock } from "@/features/equation";
import { NotionDatabase, type Database, type Page } from "@/features/notion-database";

const noop = () => {};

function CodeAdapter({ block, onUpdate, registerRef }: BlockRendererProps) {
  return (
    <CodeBlock
      text={block.text}
      lang={block.lang}
      registerRef={registerRef ?? noop}
      onText={(text) => onUpdate({ text })}
      onLang={(lang) => onUpdate({ lang })}
      onKeyDown={noop}
    />
  );
}

function EquationAdapter({ block, onUpdate, registerRef }: BlockRendererProps) {
  return (
    <EquationBlock
      text={block.text}
      registerRef={registerRef ?? noop}
      onText={(text) => onUpdate({ text })}
    />
  );
}

/** Inline database block — mounts the full notion-database surface. A real
 *  host resolves block.databaseId to its stored db/rows; the preview keeps
 *  a tiny local one. */
const INLINE_DB: Database = {
  id: "inline", name: "Tasks", icon: "✅",
  properties: [
    { id: "name", name: "Name", type: "text" },
    { id: "done", name: "Done", type: "checkbox" },
  ],
  rowIds: ["r1", "r2"], views: [], activeViewId: "",
  createdAt: 0, updatedAt: 0,
};
function DatabaseAdapter(_props: BlockRendererProps) {
  const [rows, setRows] = React.useState<Page[]>([
    { id: "r1", parentId: null, title: "Draft spec", icon: "📝", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: "inline", rowProps: { name: "Draft spec", done: true } },
    { id: "r2", parentId: null, title: "Review PR", icon: "🔍", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: "inline", rowProps: { name: "Review PR", done: false } },
  ]);
  return (
    <NotionDatabase
      db={INLINE_DB}
      rows={rows}
      onRowUpdate={(id, propId, value) =>
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, rowProps: { ...r.rowProps, [propId]: value } } : r)))}
    />
  );
}

export const BLOCK_RENDERERS: BlockRenderers = createDefaultBlockRenderers({
  code: CodeAdapter,
  equation: EquationAdapter,
  database: DatabaseAdapter,
});
