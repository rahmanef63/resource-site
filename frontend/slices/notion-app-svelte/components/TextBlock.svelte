<script lang="ts">
  import type { Block } from "@notion/shared/types";
  import { MARKDOWN_TRIGGERS } from "@notion/slices/editor/lib/markdownTriggers";
  import type { PageEditorCore } from "@notion/slices/editor/lib/page-core";
  let { block, index, total, core, readonly = false, onSlash } = $props<{
    block: Block; index: number; total: number; core: PageEditorCore; readonly?: boolean;
    onSlash: (open: boolean, query: string) => void;
  }>();
  const listType = $derived(block.type === "bullet" || block.type === "numbered" || block.type === "todo");
  const placeholder = $derived(block.type.startsWith("h") ? `Heading ${block.type.slice(1)}` : block.type === "quote" ? "Quote" : block.type === "callout" ? "Callout" : "Write, or press / for commands");
  async function input(value: string) {
    if (block.type === "paragraph" && MARKDOWN_TRIGGERS[value]) {
      const trigger = MARKDOWN_TRIGGERS[value];
      await core.updateBlock(block.id, { type: trigger.type, text: "", ...(trigger.patch ?? {}) }); onSlash(false, ""); return;
    }
    await core.updateBlock(block.id, { text: value });
    const slash = value.startsWith("/") && !value.includes("\n"); onSlash(slash, slash ? value.slice(1) : "");
  }
  async function keydown(event: KeyboardEvent) {
    if (readonly) return;
    const meta = event.metaKey || event.ctrlKey;
    if (meta && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? await core.redo() : await core.undo(); return; }
    if (meta && event.key.toLowerCase() === "d") { event.preventDefault(); await core.duplicateBlock(block.id); return; }
    if (event.key === "Tab" && listType) { event.preventDefault(); await core.updateBlock(block.id, { indent: event.shiftKey ? Math.max(0,(block.indent??0)-1) : Math.min(3,(block.indent??0)+1) }); return; }
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (listType && !block.text) await core.updateBlock(block.id,{type:"paragraph",indent:0}); else await core.addBlock(index, listType ? block.type : "paragraph", listType ? {indent:block.indent??0}:{}); return; }
    if (event.key === "Backspace" && !block.text) { if (block.type !== "paragraph") { event.preventDefault(); await core.updateBlock(block.id,{type:"paragraph",indent:0}); } else if (total > 1) { event.preventDefault(); await core.deleteBlock(block.id); } }
  }
</script>
<div class="flex min-w-0 flex-1 items-start gap-2" style={`padding-left:${Math.min(3,block.indent??0)*20}px`}>
  {#if block.type === "todo"}<input class="mt-2" type="checkbox" checked={block.checked} disabled={readonly} onchange={(e)=>core.updateBlock(block.id,{checked:e.currentTarget.checked})} />
  {:else if block.type === "bullet"}<span class="mt-1.5 text-lg">•</span>
  {:else if block.type === "numbered"}<span class="mt-2 min-w-5 text-xs text-muted-foreground">{index+1}.</span>
  {:else if block.type === "quote"}<span class="mt-1 h-7 w-1 rounded-full bg-border"></span>
  {:else if block.type === "callout"}<span class="mt-1">💡</span>{/if}
  <textarea style="field-sizing:content" class={`min-h-7 w-full resize-none overflow-hidden bg-transparent px-1 py-1 outline-none placeholder:text-muted-foreground ${block.type === "h1" ? "text-3xl font-bold" : block.type === "h2" ? "text-2xl font-semibold" : block.type === "h3" ? "text-xl font-semibold" : block.type.startsWith("h") ? "text-lg font-semibold" : block.type === "quote" ? "italic" : "text-sm"}`} value={block.text} {placeholder} disabled={readonly} rows="1" oninput={(e)=>void input(e.currentTarget.value)} onkeydown={(e)=>void keydown(e)}></textarea>
</div>
