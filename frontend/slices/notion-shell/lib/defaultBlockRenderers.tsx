"use client";

/** createDefaultBlockRenderers — the block-renderer registry that turns a
 *  bare <NotionBlock> into a real editor. notion-shell ships the
 *  self-contained renderers (image / embed / callout / table / divider);
 *  `code` + `equation` live in sibling slices, so the host passes them
 *  in as `BlockRendererProps` adapters (slice-boundary: notion-shell
 *  can't import another slice's frontend — compose at the app level).
 *
 *  Usage (app level):
 *    const renderers = createDefaultBlockRenderers({
 *      code: CodeAdapter, equation: EquationAdapter,
 *    });
 *    <NotionBlock block={b} blockRenderers={renderers} … />
 *
 *  Text-shape blocks (paragraph / headings / list / quote) are NOT in
 *  the registry — NotionBlock renders them inline with slash menu +
 *  markdown triggers + live decoration. */

import type { ComponentType } from "react";
import type { BlockRenderers, BlockRendererProps } from "../types";
import { ImageRenderer } from "../components/blocks/ImageRenderer";
import { EmbedRenderer } from "../components/blocks/EmbedRenderer";
import { CalloutBlock } from "../components/blocks/CalloutBlock";
import { TableBlock } from "../components/blocks/TableBlock";
import { DividerBlock } from "../components/blocks/DividerBlock";
import { VideoBlock, AudioBlock } from "../components/blocks/MediaBlock";
import { PageLinkBlock } from "../components/blocks/PageLinkBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";
import { makeToggleBlock } from "../components/blocks/ToggleBlock";

export interface DefaultBlockRendererOpts {
  /** Adapter for block-type "code" (e.g. wraps `@/features/code-block`). */
  code?: ComponentType<BlockRendererProps>;
  /** Adapter for block-type "equation" (e.g. wraps `@/features/equation`). */
  equation?: ComponentType<BlockRendererProps>;
  /** Override the built-in image renderer. */
  image?: ComponentType<BlockRendererProps>;
  /** Override the built-in embed renderer. */
  embed?: ComponentType<BlockRendererProps>;
}

export function createDefaultBlockRenderers(
  opts: DefaultBlockRendererOpts = {},
): BlockRenderers {
  const renderers: BlockRenderers = {
    image: opts.image ?? ImageRenderer,
    embed: opts.embed ?? EmbedRenderer,
    callout: CalloutBlock,
    table: TableBlock,
    divider: DividerBlock,
    video: VideoBlock,
    audio: AudioBlock,
    page: PageLinkBlock,
    button: ButtonBlock,
    ...(opts.code ? { code: opts.code } : {}),
    ...(opts.equation ? { equation: opts.equation } : {}),
  };
  // Toggle renders its children through the SAME registry (incl. nested
  // toggles), so it's bound after the object exists.
  renderers.toggle = makeToggleBlock(renderers);
  return renderers;
}
