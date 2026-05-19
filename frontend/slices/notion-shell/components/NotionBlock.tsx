"use client";

/** <NotionBlock /> — single-block renderer primitive. Dispatches via
 *  the `blockRenderers` registry prop. For text-shape blocks
 *  (paragraph/headings/list/quote/callout/code) renders a minimal
 *  contentEditable shell; for specialised types (image/embed/equation
 *  etc.) delegates to the registered renderer when provided.
 *
 *  Pure props — no store reach-around. Host owns the registry, so each
 *  consumer can ship only the block types it needs (e.g. notion-blocks
 *  primitives only for a static template, or the full editor set when
 *  paired with the editor slice).
 */

import { useRef, useEffect } from "react";
import { cn } from "rahman-shared/lib/utils";
import type { Block, BlockRenderers, BlockType } from "../types";
import { TOP_LEVEL_PLACEHOLDERS } from "./placeholders";

export interface NotionBlockProps {
  block: Block;
  pageId?: string;
  /** Optional registry of specialised renderers. Falls back to a
   *  contentEditable text shell when the block type isn't registered. */
  blockRenderers?: BlockRenderers;
  /** Override / extend the default placeholder map (per block type). */
  placeholders?: Partial<Record<BlockType, string>>;
  onUpdate?: (patch: Partial<Block>) => void;
  onRemove?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function NotionBlock({
  block, pageId,
  blockRenderers, placeholders,
  onUpdate, onRemove, readOnly, className,
}: NotionBlockProps) {
  const Renderer = blockRenderers?.[block.type];
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.innerText !== (block.text ?? "")) el.innerText = block.text ?? "";
  }, [block.text]);

  if (Renderer) {
    return (
      <div className={cn("my-1", className)} data-block-id={block.id}>
        <Renderer
          block={block}
          pageId={pageId}
          onUpdate={(patch) => onUpdate?.(patch)}
          onReplace={(next) => onUpdate?.({ ...next, id: block.id } as Partial<Block>)}
        />
      </div>
    );
  }

  const placeholder = placeholders?.[block.type] ?? TOP_LEVEL_PLACEHOLDERS[block.type] ?? "";
  return (
    <div
      ref={ref}
      data-block-id={block.id}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onInput={(e) => onUpdate?.({ text: (e.currentTarget as HTMLElement).innerText })}
      onKeyDown={(e) => {
        if (readOnly) return;
        if (e.key === "Backspace" && (e.currentTarget as HTMLElement).innerText === "") {
          e.preventDefault();
          onRemove?.();
        }
      }}
      data-placeholder={placeholder}
      className={cn(
        "outline-none whitespace-pre-wrap break-words py-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40",
        block.type === "h1" && "text-3xl font-bold tracking-tight",
        block.type === "h2" && "text-2xl font-semibold tracking-tight",
        block.type === "h3" && "text-xl font-semibold tracking-tight",
        block.type === "h4" && "text-lg font-semibold tracking-tight",
        block.type === "quote" && "border-l-4 border-foreground/40 pl-4 italic text-foreground/80",
        block.type === "code" && "rounded bg-muted px-2 py-1 font-mono text-sm",
        block.type === "callout" && "rounded-md border border-primary/20 bg-primary/10 px-3 py-2",
        block.type === "bullet" && "list-disc ml-5",
        block.type === "numbered" && "list-decimal ml-5",
        className,
      )}
    />
  );
}
