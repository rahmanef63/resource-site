"use client";

/** App-level block-renderer wiring for the notion-shell preview. Maps the
 *  sibling code/equation slices' own prop shapes onto BlockRendererProps
 *  (notion-shell can't import another slice's frontend — compose here),
 *  then builds the default registry. */

import {
  createDefaultBlockRenderers,
  type BlockRendererProps,
  type BlockRenderers,
} from "@/features/notion-shell";
import { CodeBlock } from "@/features/code-block";
import { EquationBlock } from "@/features/equation";

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

export const BLOCK_RENDERERS: BlockRenderers = createDefaultBlockRenderers({
  code: CodeAdapter,
  equation: EquationAdapter,
});
