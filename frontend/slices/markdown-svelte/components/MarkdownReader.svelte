<script lang="ts">
  import { parseMarkdown, type MdNode } from "../../markdown/lib/parse";
  import MarkdownNodes from "./MarkdownNodes.svelte";

  type MaxWidth = "prose" | "2xl" | "3xl" | "none";
  let { content = "", nodes, title, icon, maxWidth = "3xl", className = "" }: {
    content?: string;
    nodes?: MdNode[];
    title?: string;
    icon?: string;
    maxWidth?: MaxWidth;
    className?: string;
  } = $props();

  const parsed = $derived(nodes ?? parseMarkdown(content));
  const maxWidthClass = $derived({ prose: "max-w-prose", "2xl": "max-w-2xl", "3xl": "max-w-3xl", none: "max-w-none" }[maxWidth]);
</script>

<article class={`mx-auto w-full px-4 py-6 ${maxWidthClass} ${className}`}>
  {#if title}
    <header class="mb-4 flex items-center gap-2">
      {#if icon}<span class="text-2xl leading-none">{icon}</span>{/if}
      <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
    </header>
  {/if}
  <div class="text-foreground"><MarkdownNodes nodes={parsed} /></div>
</article>
