"use client";

/** <NotionBlock /> — single-block renderer primitive. Dispatches via
 *  the `blockRenderers` registry prop. For text-shape blocks
 *  (paragraph/headings/list/quote/callout/code) renders a minimal
 *  contentEditable shell with live inline-markdown decoration; for
 *  specialised types (image/embed/equation etc.) delegates to the
 *  registered renderer when provided.
 *
 *  Pure props — no store reach-around. Host owns the registry. Hover
 *  reveals a "⋯" button that opens BlockActionsMenu (turn-into /
 *  duplicate / delete) when handlers are provided. */

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "rahman-shared/lib/utils";
import { Button } from "@/components/ui/button";
import type { Block, BlockRenderers, BlockType } from "../types";
import { TOP_LEVEL_PLACEHOLDERS } from "./placeholders";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { decorateInPlace } from "../lib/inlineDecorator";

const HEADING_TYPES = new Set<BlockType>(["h1", "h2", "h3", "h4", "h5", "h6"]);

export interface NotionBlockProps {
  block: Block;
  pageId?: string;
  blockRenderers?: BlockRenderers;
  placeholders?: Partial<Record<BlockType, string>>;
  onUpdate?: (patch: Partial<Block>) => void;
  onRemove?: () => void;
  onTurnInto?: (type: BlockType) => void;
  onDuplicate?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function NotionBlock({
  block, pageId,
  blockRenderers, placeholders,
  onUpdate, onRemove, onTurnInto, onDuplicate,
  readOnly, className,
}: NotionBlockProps) {
  const Renderer = blockRenderers?.[block.type];
  const ref = useRef<HTMLDivElement | null>(null);
  const composingRef = useRef(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || composingRef.current) return;
    const next = block.text ?? "";
    if (el.innerText === next) return;
    decorateInPlace(el, next, { hideMarkers: HEADING_TYPES.has(block.type) });
  }, [block.text, block.type]);

  if (Renderer) {
    return (
      <div className={cn("group/block relative my-1", className)} data-block-id={block.id}>
        <Renderer
          block={block}
          pageId={pageId}
          onUpdate={(patch) => onUpdate?.(patch)}
          onReplace={(next) => onUpdate?.({ ...next, id: block.id } as Partial<Block>)}
        />
        {!readOnly && onTurnInto && (
          <ActionsHandle
            currentType={block.type}
            onTurnInto={onTurnInto}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
          />
        )}
      </div>
    );
  }

  const placeholder = placeholders?.[block.type] ?? TOP_LEVEL_PLACEHOLDERS[block.type] ?? "";

  return (
    <div
      className="group/block relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={ref}
        data-block-id={block.id}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onCompositionStart={() => { composingRef.current = true; }}
        onCompositionEnd={(e) => {
          composingRef.current = false;
          const el = e.currentTarget as HTMLElement;
          const text = el.innerText;
          onUpdate?.({ text });
          decorateInPlace(el, text, { hideMarkers: HEADING_TYPES.has(block.type) });
        }}
        onInput={(e) => {
          if (composingRef.current) return;
          const el = e.currentTarget as HTMLElement;
          const text = el.innerText;
          onUpdate?.({ text });
          decorateInPlace(el, text, { hideMarkers: HEADING_TYPES.has(block.type) });
        }}
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
      {!readOnly && onTurnInto && hover && (
        <ActionsHandle
          currentType={block.type}
          onTurnInto={onTurnInto}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

function ActionsHandle({
  currentType, onTurnInto, onDuplicate, onRemove,
}: {
  currentType: BlockType;
  onTurnInto: (t: BlockType) => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="absolute -left-7 top-1 opacity-0 transition group-hover/block:opacity-100">
      <BlockActionsMenu
        currentType={currentType}
        onTurnInto={onTurnInto}
        onDuplicate={onDuplicate}
        onDelete={onRemove}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          aria-label="Block actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </BlockActionsMenu>
    </div>
  );
}
