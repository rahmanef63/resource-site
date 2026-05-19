"use client";

/** Adapter registry — bridges notion-blocks primitives into the
 *  notion-shell BlockRenderers shape. NotionBlock dispatches via this
 *  prop, so any block type with a renderer here gets the rich UI
 *  (equation/code) and everything else falls through to the
 *  contentEditable text shell. */

import type { ComponentType } from "react";
import { EquationBlock, CodeBlock } from "@/features/notion-blocks";
import type { BlockRenderers, BlockRendererProps } from "@/features/notion-shell";

function EquationRenderer({ block, onUpdate }: BlockRendererProps) {
  return (
    <EquationBlock
      text={block.text}
      onText={(text) => onUpdate({ text })}
      registerRef={() => {}}
    />
  );
}

function CodeRenderer({ block, onUpdate }: BlockRendererProps) {
  return (
    <CodeBlock
      text={block.text}
      lang={block.lang ?? "plaintext"}
      registerRef={() => {}}
      onText={(text) => onUpdate({ text })}
      onLang={(lang) => onUpdate({ lang })}
      onKeyDown={() => {}}
    />
  );
}

function DividerRenderer() {
  return <hr className="my-3 border-border" />;
}

export const NOTION_BLOCK_RENDERERS: BlockRenderers = {
  equation: EquationRenderer as ComponentType<BlockRendererProps>,
  code: CodeRenderer as ComponentType<BlockRendererProps>,
  divider: DividerRenderer as ComponentType<BlockRendererProps>,
};
