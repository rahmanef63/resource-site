import type { KeyboardEvent } from "react";
import type { Block, BlockType } from "../types";
import { getCaretOffset } from "./inlineDecorator";
import { focusBlock } from "./focusBlock";

const LIST = new Set<BlockType>(["bullet", "numbered", "todo"]);
/** Text-shape blocks that downgrade to a plain paragraph on the first
 *  Backspace-while-empty (heading/quote/callout/list). A second Backspace
 *  from the resulting empty paragraph then merges into the previous block. */
const DOWNGRADE = new Set<BlockType>([
  "h1", "h2", "h3", "h4", "h5", "h6", "quote", "callout",
  "bullet", "numbered", "todo",
]);

export interface BlockKeyDeps {
  block: Block;
  slashOpen: boolean;
  closeSlash: () => void;
  onTurnInto?: (type: BlockType) => void;
  onUpdate?: (patch: Partial<Block>) => void;
  onRemove?: () => void;
  /** Host inserts a new block right after this one; returns its id so the
   *  caret can hop into it. Enables Enter → new block (caret-split). */
  onInsertAfter?: (type: BlockType, init?: Partial<Block>) => string | void;
  /** Host deletes this (empty) block and focuses the previous one at the
   *  join point. Enables Backspace → merge into previous line. */
  onMergeBack?: () => void;
  /** Host moves focus to the adjacent block (caret at the near edge). */
  onFocusSibling?: (dir: -1 | 1) => void;
}

/** Notion-canonical editing keys for a text-shape block. The SlashMenu owns
 *  ArrowUp/Down/Enter while open (global capture listener), so we bail on
 *  those when `slashOpen`. */
export function handleBlockKeyDown(e: KeyboardEvent<HTMLElement>, deps: BlockKeyDeps): void {
  const { block, slashOpen, closeSlash, onTurnInto, onUpdate, onRemove } = deps;
  const el = e.currentTarget as HTMLElement;

  if (e.key === "Escape" && slashOpen) {
    e.preventDefault();
    closeSlash();
    return;
  }
  if (slashOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
    return;
  }

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const text = block.text ?? el.innerText;
    // Empty list item → exit the list (convert to paragraph) instead of
    // stacking another empty bullet.
    if (LIST.has(block.type) && text === "") {
      onTurnInto?.("paragraph");
      focusBlock(block.id, 0);
      return;
    }
    const off = getCaretOffset(el);
    const head = text.slice(0, off);
    const tail = text.slice(off);
    // Lists continue their own type on Enter; everything else → paragraph.
    const nextType: BlockType = LIST.has(block.type) ? block.type : "paragraph";
    if (head !== text) onUpdate?.({ text: head });
    const id = deps.onInsertAfter?.(nextType, { text: tail });
    if (typeof id === "string") focusBlock(id, 0);
    return;
  }

  if (e.key === "Backspace" && el.innerText === "") {
    e.preventDefault();
    // First Backspace on an empty non-paragraph drops the block-type so it
    // becomes a plain empty paragraph (re-triggerable with "/").
    if (block.type !== "paragraph" && DOWNGRADE.has(block.type)) {
      onTurnInto?.("paragraph");
      focusBlock(block.id, 0);
      return;
    }
    // Empty paragraph → merge into the previous block (host focuses it).
    if (deps.onMergeBack) deps.onMergeBack();
    else onRemove?.();
    return;
  }

  if (e.key === "ArrowDown" && getCaretOffset(el) === el.innerText.length) {
    deps.onFocusSibling?.(1);
  } else if (e.key === "ArrowUp" && getCaretOffset(el) === 0) {
    deps.onFocusSibling?.(-1);
  }
}
