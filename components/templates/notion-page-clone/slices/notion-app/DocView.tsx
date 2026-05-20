"use client";

import * as React from "react";
import {
  NotionPage, NotionBlock, InsertBlockButton,
  type Block, type BlockType,
} from "@/features/notion-shell";
import { DynamicIcon, IconPickerPopover } from "@/features/icon-picker";
import { useDocs, useStore } from "../../shared/store";
import { NOTION_BLOCK_RENDERERS } from "./block-renderers";

function renderIcon(icon: string, className?: string) {
  return <DynamicIcon value={icon} className={className} />;
}

function renderIconPicker({
  value, onChange, children,
}: {
  value: string;
  onChange: (next: string) => void;
  children: React.ReactNode;
}) {
  return (
    <IconPickerPopover value={value} onChange={onChange} onClear={() => onChange("📄")}>
      {children}
    </IconPickerPopover>
  );
}

/** Renders one notion-clone doc selected by id. Bound to template store —
 *  block edits dispatch doc.* actions; the +Block bar opens SlashMenu
 *  popover. Hover on any block reveals "⋯" → turn-into / duplicate /
 *  delete. For richer slash-key trigger / drag-handle UX, see BJ-wave. */
export function DocView({ docId }: { docId: string }) {
  const docs = useDocs();
  const { dispatch } = useStore();
  const doc = docs.find((d) => d.id === docId);

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Doc not found — pick one from the sidebar.
      </div>
    );
  }

  const handleBlockUpdate = (blockId: string, patch: Partial<Block>) =>
    dispatch({ type: "doc.block.update", docId: doc.id, blockId, patch });
  const handleBlockRemove = (blockId: string) =>
    dispatch({ type: "doc.block.remove", docId: doc.id, blockId });
  const handleBlockDuplicate = (blockId: string) =>
    dispatch({ type: "doc.block.duplicate", docId: doc.id, blockId });
  const handleBlockTurnInto = (blockId: string, type: BlockType) =>
    dispatch({ type: "doc.block.turnInto", docId: doc.id, blockId, blockType: type });
  const handleAppend = (type: BlockType = "paragraph") => {
    const block: Block = { id: `b-${Date.now().toString(36)}`, type, text: "" };
    dispatch({ type: "doc.block.append", docId: doc.id, block });
  };

  return (
    <NotionPage
      icon={doc.icon}
      title={doc.title}
      onIconChange={(icon) => dispatch({ type: "doc.update", id: doc.id, patch: { icon } })}
      onTitleChange={(title) => dispatch({ type: "doc.update", id: doc.id, patch: { title } })}
      renderIcon={renderIcon}
      renderIconPicker={renderIconPicker}
    >
      <div className="pl-8">
        {doc.blocks.map((b) => (
          <NotionBlock
            key={b.id}
            block={b}
            blockRenderers={NOTION_BLOCK_RENDERERS}
            onUpdate={(patch) => handleBlockUpdate(b.id, patch)}
            onRemove={() => handleBlockRemove(b.id)}
            onDuplicate={() => handleBlockDuplicate(b.id)}
            onTurnInto={(type) => handleBlockTurnInto(b.id, type)}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-dashed border-border/60 pt-3 pl-8">
        <InsertBlockButton onInsert={handleAppend} label="Add block" />
      </div>
    </NotionPage>
  );
}
