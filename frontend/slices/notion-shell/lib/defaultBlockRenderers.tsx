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
import { makeColumnsBlock } from "../components/blocks/ColumnsBlock";

export interface DefaultBlockRendererOpts {
  /** Adapter for block-type "code" (e.g. wraps `@/features/code-block`). */
  code?: ComponentType<BlockRendererProps>;
  /** Adapter for block-type "equation" (e.g. wraps `@/features/equation`). */
  equation?: ComponentType<BlockRendererProps>;
  /** Adapter for block-type "database" — an inline database surface (wraps
   *  `@/features/notion-database`'s `<NotionDatabase>`; the host resolves
   *  `block.databaseId` to its data). Composed at the app level. */
  database?: ComponentType<BlockRendererProps>;
  /** Override the built-in image renderer. */
  image?: ComponentType<BlockRendererProps>;
  /** Override the built-in embed renderer. */
  embed?: ComponentType<BlockRendererProps>;
  /** Adapter for block-type "toc" — a table of contents. The host reads its
   *  own page headings and wraps `<TocBlock headings onJump>` (toc can't see
   *  sibling blocks from inside the registry). Composed at the app level. */
  toc?: ComponentType<BlockRendererProps>;
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
    ...(opts.database ? { database: opts.database } : {}),
    ...(opts.toc ? { toc: opts.toc } : {}),
  };
  // Toggle + columns render their children through the SAME registry
  // (incl. nesting), so they're bound after the object exists.
  renderers.toggle = makeToggleBlock(renderers);
  const columns = makeColumnsBlock(renderers);
  renderers.columns2 = columns;
  renderers.columns3 = columns;
  renderers.columns4 = columns;
  return renderers;
}
