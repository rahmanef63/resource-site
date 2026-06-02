"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import {
  NotionPage, NotionBlock, InsertBlockButton,
  SortableBlockList, PageActionsMenu, InlineFormatToolbar, MentionTypeahead,
  focusBlock, collectHeadings,
  type Block, type BlockType, type SortableBlockDragProps,
} from "@/features/notion-shell";
import { SelectionProvider, SelectableBlock, SelectionMarquee } from "@/features/selection";
import { DynamicIcon, IconPickerPopover } from "@/features/icon-picker";
import type { ImageValue, ImageField } from "@/features/image-picker";
import { Button } from "@/components/ui/button";
import { useDocs, useStore } from "../../shared/store";
import { NOTION_BLOCK_RENDERERS, TocHeadingsContext } from "./block-renderers";
import { CoverArea, AddCoverPicker } from "./DocCover";

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

function DragHandle({ drag }: { drag: SortableBlockDragProps }) {
  return (
    <Button
      ref={drag.setActivatorNodeRef}
      variant="ghost"
      size="icon"
      className="h-6 w-6 cursor-grab text-muted-foreground active:cursor-grabbing"
      aria-label="Drag block"
      {...drag.attributes}
      {...drag.listeners}
    >
      <GripVertical className="h-3.5 w-3.5" />
    </Button>
  );
}

/** Renders one notion-clone doc selected by id. Bound to template store —
 *  block edits dispatch doc.* actions; the +Block bar opens SlashMenu
 *  popover. Hover on any block reveals "⋯" + drag-handle.
 *  PageActionsMenu in the header dispatches doc-level actions. */
export function DocView({ docId }: { docId: string }) {
  const docs = useDocs();
  const { dispatch } = useStore();
  const [coverPickerOpen, setCoverPickerOpen] = React.useState(false);
  const doc = docs.find((d) => d.id === docId);

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Doc not found — pick one from the sidebar.
      </div>
    );
  }

  const setCover = (c: ImageValue | null) =>
    dispatch({ type: "doc.update", id: doc.id, patch: { cover: c ?? undefined } });

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
  const handleMove = (blockId: string, dir: -1 | 1) => {
    const from = doc.blocks.findIndex((b) => b.id === blockId);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= doc.blocks.length) return;
    dispatch({ type: "doc.block.reorder", docId: doc.id, from, to });
  };
  const handleInsertAfter = (afterId: string, type: BlockType, init?: Partial<Block>) => {
    const id = `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    dispatch({ type: "doc.block.insertAfter", docId: doc.id, afterId, block: { id, type, text: "", ...init } });
    return id;
  };
  const handleMergeBack = (blockId: string) => {
    const i = doc.blocks.findIndex((b) => b.id === blockId);
    if (i <= 0) return;
    const prev = doc.blocks[i - 1];
    const caret = (prev.text ?? "").length;
    dispatch({ type: "doc.block.mergeBack", docId: doc.id, blockId });
    focusBlock(prev.id, caret);
  };
  const handleFocusSibling = (blockId: string, dir: -1 | 1) => {
    const i = doc.blocks.findIndex((b) => b.id === blockId);
    const sib = doc.blocks[i + dir];
    if (sib) focusBlock(sib.id, dir > 0 ? 0 : undefined);
  };
  const handleBulkDelete = (ids: string[]) =>
    ids.forEach((blockId) => dispatch({ type: "doc.block.remove", docId: doc.id, blockId }));
  const handleBulkDuplicate = (ids: string[]) =>
    ids.forEach((blockId) => dispatch({ type: "doc.block.duplicate", docId: doc.id, blockId }));

  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const blockIds = doc.blocks.map((b) => b.id);
  const blockById = new Map(doc.blocks.map((b) => [b.id, b] as const));
  const headings = React.useMemo(() => collectHeadings(doc.blocks), [doc.blocks]);
  const mentionables = docs
    .filter((d) => !d.trashed && d.id !== doc.id)
    .slice(0, 50)
    .map((d) => ({
      id: d.id,
      label: d.title || "Untitled",
      href: `#${d.id}`,
      icon: /^[A-Za-z]/.test(d.icon ?? "") ? undefined : d.icon,
    }));

  return (
    <TocHeadingsContext.Provider value={headings}>
    <NotionPage
      icon={doc.icon}
      title={doc.title}
      onIconChange={(icon) => dispatch({ type: "doc.update", id: doc.id, patch: { icon } })}
      onTitleChange={(title) => dispatch({ type: "doc.update", id: doc.id, patch: { title } })}
      renderIcon={renderIcon}
      renderIconPicker={renderIconPicker}
      coverSlot={doc.cover ? <CoverArea cover={doc.cover as ImageField} onChange={setCover} /> : undefined}
      actions={
        <PageActionsMenu
          favorite={doc.favorite}
          onAddCover={() => setCoverPickerOpen(true)}
          onToggleFavorite={() => dispatch({ type: "doc.update", id: doc.id, patch: { favorite: !doc.favorite } })}
          onDuplicate={() => dispatch({ type: "doc.duplicate", id: doc.id })}
          onTrash={() => dispatch({ type: "doc.update", id: doc.id, patch: { trashed: true } })}
        />
      }
    >
      <SelectionProvider onBulkDelete={handleBulkDelete} onBulkDuplicate={handleBulkDuplicate}>
      <div ref={surfaceRef} className="relative min-h-[16rem] pb-12 pl-8">
        <SelectionMarquee containerRef={surfaceRef} />
        <SortableBlockList
          items={blockIds}
          onReorder={(from, to) => dispatch({ type: "doc.block.reorder", docId: doc.id, from, to })}
        >
          {(id, drag) => {
            const b = blockById.get(id);
            if (!b) return null;
            return (
              <SelectableBlock id={b.id} orderedIds={blockIds}>
              <NotionBlock
                block={b}
                blockRenderers={NOTION_BLOCK_RENDERERS}
                onUpdate={(patch) => handleBlockUpdate(b.id, patch)}
                onRemove={() => handleBlockRemove(b.id)}
                onDuplicate={() => handleBlockDuplicate(b.id)}
                onTurnInto={(type) => handleBlockTurnInto(b.id, type)}
                onMoveUp={() => handleMove(b.id, -1)}
                onMoveDown={() => handleMove(b.id, 1)}
                onInsertAfter={(type, init) => handleInsertAfter(b.id, type, init)}
                onMergeBack={() => handleMergeBack(b.id)}
                onFocusSibling={(dir) => handleFocusSibling(b.id, dir)}
                dragHandle={<DragHandle drag={drag} />}
              />
              </SelectableBlock>
            );
          }}
        </SortableBlockList>
      </div>
      </SelectionProvider>
      <div className="mt-3 flex items-center gap-2 border-t border-dashed border-border/60 pt-3 pl-8">
        <InsertBlockButton onInsert={handleAppend} label="Add block" />
      </div>
      <InlineFormatToolbar />
      <MentionTypeahead mentionables={mentionables} />
      <AddCoverPicker open={coverPickerOpen} onOpenChange={setCoverPickerOpen} onPick={setCover} />
    </NotionPage>
    </TocHeadingsContext.Provider>
  );
}
