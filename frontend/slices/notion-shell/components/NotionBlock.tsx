"use client";

/** <NotionBlock /> — single-block renderer primitive. Dispatches via
 *  the `blockRenderers` registry prop. Text-shape blocks
 *  (paragraph/headings/list/quote/callout/code) render a minimal
 *  contentEditable shell with live inline-markdown decoration; for
 *  specialised types delegates to the registered renderer.
 *
 *  Hover reveals a "⋯" button (BlockActionsHandle → BlockActionsMenu).
 *  Typing "/" opens an inline SlashMenu and MARKDOWN_TRIGGERS convert
 *  on the fly (`# ` → h1, `- ` → bullet, `[] ` → todo, etc.) — both
 *  gated on `onTurnInto` being provided. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "rahman-shared/lib/utils";
import type { Block, BlockRenderers, BlockType } from "../types";
import { TOP_LEVEL_PLACEHOLDERS } from "./placeholders";
import { BlockActionsHandle } from "./BlockActionsHandle";
import { SlashMenu } from "./SlashMenu";
import { decorateInPlace } from "../lib/inlineDecorator";
import { decideBlockInput } from "../lib/blockInputHandler";

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
  dragHandle?: ReactNode;
  readOnly?: boolean;
  className?: string;
}

export function NotionBlock({
  block, pageId,
  blockRenderers, placeholders,
  onUpdate, onRemove, onTurnInto, onDuplicate,
  dragHandle,
  readOnly, className,
}: NotionBlockProps) {
  const Renderer = blockRenderers?.[block.type];
  const ref = useRef<HTMLDivElement | null>(null);
  const composingRef = useRef(false);
  const [hover, setHover] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el || composingRef.current) return;
    const next = block.text ?? "";
    if (el.innerText === next) return;
    decorateInPlace(el, next, { hideMarkers: HEADING_TYPES.has(block.type) });
  }, [block.text, block.type]);

  const closeSlash = () => {
    setSlashOpen(false);
    setSlashQuery("");
  };

  const handleSlashSelect = (type: BlockType) => {
    const el = ref.current;
    if (el) el.innerText = "";
    onUpdate?.({ text: "" });
    onTurnInto?.(type);
    closeSlash();
  };

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
          <BlockActionsHandle
            currentType={block.type}
            onTurnInto={onTurnInto}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
            dragHandle={dragHandle}
          />
        )}
      </div>
    );
  }

  const placeholder = placeholders?.[block.type] ?? TOP_LEVEL_PLACEHOLDERS[block.type] ?? "";
  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    if (composingRef.current) return;
    const el = e.currentTarget as HTMLElement;
    const text = el.innerText;
    const decision = decideBlockInput({ text, blockType: block.type, canTurnInto: !!onTurnInto, slashOpen });

    if (decision.kind === "markdownTrigger") {
      el.innerText = "";
      onUpdate?.({ text: "", ...(decision.patch ?? {}) });
      onTurnInto?.(decision.type);
      closeSlash();
      return;
    }

    onUpdate?.({ text });
    if (decision.kind === "slashOpen") {
      setSlashOpen(true);
      setSlashQuery(decision.query);
    } else if (decision.kind === "slashClose") {
      closeSlash();
    } else {
      decorateInPlace(el, text, { hideMarkers: HEADING_TYPES.has(block.type) });
    }
  };

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
        onInput={handleInput}
        onKeyDown={(e) => {
          if (readOnly) return;
          if (e.key === "Escape" && slashOpen) {
            e.preventDefault();
            closeSlash();
            return;
          }
          if (e.key === "Backspace" && (e.currentTarget as HTMLElement).innerText === "") {
            e.preventDefault();
            onRemove?.();
          }
        }}
        onBlur={() => { setTimeout(closeSlash, 150); }}
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
      {slashOpen && onTurnInto && (
        <div className="absolute left-0 top-full z-50 mt-1">
          <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={closeSlash} />
        </div>
      )}
      {!readOnly && onTurnInto && hover && (
        <BlockActionsHandle
          currentType={block.type}
          onTurnInto={onTurnInto}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          dragHandle={dragHandle}
        />
      )}
    </div>
  );
}
