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
 *  gated on `onTurnInto` being provided. The SlashMenu rides on a
 *  Radix Popover anchored to the contentEditable so it escapes any
 *  clipping parent (e.g. an `overflow-y-auto` page shell) and stays
 *  positioned correctly even when the block sits near the bottom of
 *  the viewport. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { Block, BlockRenderers, BlockType } from "../types";
import { TOP_LEVEL_PLACEHOLDERS } from "./placeholders";
import { BlockActionsHandle } from "./BlockActionsHandle";
import { SlashMenu } from "./SlashMenu";
import { decorateInPlace } from "../lib/inlineDecorator";
import { decideBlockInput } from "../lib/blockInputHandler";
import { blockEditableClass } from "../lib/blockClassName";
import { blockColorClass } from "../lib/blockColors";

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
  /** Reorder one slot — surfaced in the block actions menu. */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  dragHandle?: ReactNode;
  readOnly?: boolean;
  className?: string;
}

export function NotionBlock({
  block, pageId,
  blockRenderers, placeholders,
  onUpdate, onRemove, onTurnInto, onDuplicate, onMoveUp, onMoveDown,
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
    // Restore focus to the block so the user can keep typing.
    requestAnimationFrame(() => ref.current?.focus());
  };

  const setColor = (color?: string, bgColor?: string) => onUpdate?.({ color, bgColor });
  const copyLink = () => navigator.clipboard?.writeText(
    `${typeof location !== "undefined" ? location.href.split("#")[0] : ""}#block-${block.id}`,
  );
  const actionsHandle = !readOnly && onTurnInto ? (
    <BlockActionsHandle
      currentType={block.type} onTurnInto={onTurnInto}
      onDuplicate={onDuplicate} onRemove={onRemove} dragHandle={dragHandle}
      color={block.color} bgColor={block.bgColor} onSetColor={setColor}
      onCopyLink={copyLink} onMoveUp={onMoveUp} onMoveDown={onMoveDown}
    />
  ) : null;

  if (Renderer) {
    return (
      <div className={cn("group/block relative my-1", blockColorClass(block.color, block.bgColor), className)} data-block-id={block.id}>
        <Renderer
          block={block}
          pageId={pageId}
          onUpdate={(patch) => onUpdate?.(patch)}
          onReplace={(next) => onUpdate?.({ ...next, id: block.id } as Partial<Block>)}
        />
        {actionsHandle}
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
      className={cn("group/block relative", blockColorClass(block.color, block.bgColor))}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Popover
        open={slashOpen && !!onTurnInto}
        onOpenChange={(open) => { if (!open) closeSlash(); }}
        modal={false}
      >
        <PopoverAnchor asChild>
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
            data-placeholder={placeholder}
            className={blockEditableClass(block.type, className)}
          />
        </PopoverAnchor>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-72 p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={closeSlash} />
        </PopoverContent>
      </Popover>
      {hover && actionsHandle}
    </div>
  );
}
