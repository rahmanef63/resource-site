"use client";

/** Adapter registry — bridges notion-blocks primitives into the
 *  notion-shell BlockRenderers shape. NotionBlock dispatches via this
 *  prop. Equation + Code use notion-blocks primitives; divider/toggle/
 *  callout are local specialised renderers; everything else falls
 *  through to the contentEditable text shell (handled by NotionBlock
 *  default branch). */

import { useState, type ComponentType } from "react";
import { ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "rahman-shared/lib/utils";
import { Button } from "@/components/ui/button";
import { EquationBlock, CodeBlock } from "@/features/notion-blocks";
import { ImageRenderer, EmbedRenderer } from "@/features/notion-shell";
import type { BlockRenderers, BlockRendererProps } from "@/features/notion-shell";

function EquationRenderer({ block, onUpdate }: BlockRendererProps) {
  return (
    <EquationBlock
      text={block.text}
      onText={(text) => onUpdate({ text })}
      registerRef={() => {}}
    />
  );
}

function CodeRenderer({ block, onUpdate }: BlockRendererProps) {
  return (
    <CodeBlock
      text={block.text}
      lang={block.lang ?? "plaintext"}
      registerRef={() => {}}
      onText={(text) => onUpdate({ text })}
      onLang={(lang) => onUpdate({ lang })}
      onKeyDown={() => {}}
    />
  );
}

function DividerRenderer() {
  return <hr className="my-3 border-border" />;
}

function ToggleRenderer({ block, onUpdate }: BlockRendererProps) {
  const [open, setOpen] = useState(!block.collapsed);
  return (
    <div className="rounded-md py-1">
      <div className="flex items-start gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={open ? "Collapse" : "Expand"}
          onClick={() => {
            setOpen((v) => !v);
            onUpdate({ collapsed: open });
          }}
          className="mt-0.5 size-5 shrink-0 rounded text-muted-foreground"
        >
          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
        </Button>
        <input
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Toggle"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
        />
      </div>
      {open && (
        <div className="ml-6 mt-1 border-l border-dashed border-border/60 pl-3 text-sm text-muted-foreground">
          Empty toggle — wire nested blocks in a future wave.
        </div>
      )}
    </div>
  );
}

function CalloutRenderer({ block, onUpdate }: BlockRendererProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2">
      <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-primary" />
      <textarea
        value={block.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Callout body…"
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

export const NOTION_BLOCK_RENDERERS: BlockRenderers = {
  equation: EquationRenderer as ComponentType<BlockRendererProps>,
  code: CodeRenderer as ComponentType<BlockRendererProps>,
  divider: DividerRenderer as ComponentType<BlockRendererProps>,
  toggle: ToggleRenderer as ComponentType<BlockRendererProps>,
  callout: CalloutRenderer as ComponentType<BlockRendererProps>,
  image: ImageRenderer as ComponentType<BlockRendererProps>,
  embed: EmbedRenderer as ComponentType<BlockRendererProps>,
};
