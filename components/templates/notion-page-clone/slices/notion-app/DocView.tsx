"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { NotionPage, NotionBlock, type Block, type BlockType } from "@/features/notion-shell";
import { DynamicIcon, IconPickerPopover } from "@/features/icon-picker";
import { Button } from "@/components/ui/button";
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
 *  block edits dispatch DOC_* actions; the +Block bar appends a new empty
 *  paragraph. For richer slash-menu / drag handle UX, lift the editor
 *  slice from nosion (deferred). */
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
      {doc.blocks.map((b) => (
        <NotionBlock
          key={b.id}
          block={b}
          blockRenderers={NOTION_BLOCK_RENDERERS}
          onUpdate={(patch) => handleBlockUpdate(b.id, patch)}
          onRemove={() => handleBlockRemove(b.id)}
        />
      ))}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-border/60 pt-3">
        <Button variant="ghost" size="sm" onClick={() => handleAppend("paragraph")} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" /> Paragraph
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAppend("h2")} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" /> Heading
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAppend("bullet")} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" /> List
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAppend("quote")} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" /> Quote
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAppend("code")} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" /> Code
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAppend("equation")} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" /> Equation
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAppend("divider")} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" /> Divider
        </Button>
      </div>
    </NotionPage>
  );
}
