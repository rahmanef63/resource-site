<script lang="ts">
  import { MARKDOWN_SNIPPETS } from "../../markdown/lib/snippets";
  import { parseMarkdown } from "../../markdown/lib/parse";
  import MarkdownNodes from "./MarkdownNodes.svelte";

  let { value, onChange }: { value: string; onChange: (next: string) => void } = $props();
  let textarea: HTMLTextAreaElement | undefined;
  const nodes = $derived(parseMarkdown(value));

  function insert(snippet: string) {
    const at = textarea?.selectionStart ?? value.length;
    const next = value.slice(0, at) + snippet + value.slice(at);
    onChange(next);
    setTimeout(() => {
      textarea?.focus();
      textarea?.setSelectionRange(at + snippet.length, at + snippet.length);
    }, 0);
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-wrap gap-1">
    {#each MARKDOWN_SNIPPETS as item}
      <button class="h-7 rounded-md border px-2 text-xs hover:bg-muted" type="button" onclick={() => insert(item.snippet)}>{item.label}</button>
    {/each}
  </div>
  <div class="grid gap-3 lg:grid-cols-2">
    <textarea bind:this={textarea} value={value} oninput={(event) => onChange(event.currentTarget.value)} aria-label="Markdown source" spellcheck="false" class="min-h-[420px] resize-y rounded-md border bg-background p-3 font-mono text-xs leading-relaxed"></textarea>
    <div class="min-h-[420px] overflow-auto rounded-md border border-border bg-background px-4 py-2"><MarkdownNodes {nodes} /></div>
  </div>
</div>
