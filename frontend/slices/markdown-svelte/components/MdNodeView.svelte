<script lang="ts">
  import type { Align, MdNode } from "../../markdown/lib/parse";
  import Inline from "./Inline.svelte";
  import MathSpan from "./MathSpan.svelte";
  import MermaidBlock from "./MermaidBlock.svelte";
  import ChartBlock from "./ChartBlock.svelte";
  import MarkdownNodes from "./MarkdownNodes.svelte";

  let { node }: { node: MdNode } = $props();

  const headingClass = (level: number) => ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-sm"][level - 1] ?? "text-base";
  const calloutClass = (kind: string) => ({
    note: "border-sky-500/40 bg-sky-500/5",
    tip: "border-emerald-500/40 bg-emerald-500/5",
    warning: "border-amber-500/40 bg-amber-500/5",
    important: "border-violet-500/40 bg-violet-500/5",
    caution: "border-rose-500/40 bg-rose-500/5",
  }[kind] ?? "border-border bg-muted/40");
  const alignClass = (align: Align) => ({ left: "text-left", center: "text-center", right: "text-right" }[align]);
</script>

{#if node.type === "heading"}
  <svelte:element this={`h${node.level}`} class={`mb-2 mt-6 font-semibold tracking-tight first:mt-0 ${headingClass(node.level)}`}><Inline text={node.text} /></svelte:element>
{:else if node.type === "paragraph"}
  <p class="my-2 text-sm leading-relaxed"><Inline text={node.text} /></p>
{:else if node.type === "quote"}
  <blockquote class="my-3 border-l-2 border-border pl-4 text-sm italic text-muted-foreground"><Inline text={node.text} /></blockquote>
{:else if node.type === "callout"}
  <div class={`my-3 rounded-md border-l-2 px-4 py-3 text-sm ${calloutClass(node.kind)}`}><span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{node.kind}</span><Inline text={node.text} /></div>
{:else if node.type === "code"}
  <pre class="my-3 overflow-x-auto rounded-md bg-muted/70 p-3 text-xs"><code class="font-mono">{node.text}</code></pre>
{:else if node.type === "diagram"}
  <MermaidBlock text={node.text} />
{:else if node.type === "chart"}
  <ChartBlock text={node.text} />
{:else if node.type === "equation"}
  <MathSpan tex={node.text} display />
{:else if node.type === "divider"}
  <hr class="my-5 border-border" />
{:else if node.type === "image"}
  <figure class="my-4"><img src={node.url} alt={node.caption ?? ""} class="mx-auto max-w-full rounded-md" />{#if node.caption}<figcaption class="mt-1 text-center text-xs text-muted-foreground">{node.caption}</figcaption>{/if}</figure>
{:else if node.type === "table" && node.rows.length}
  <div class="my-3 overflow-x-auto"><table class="w-full border-collapse text-sm"><thead><tr>{#each node.rows[0] as cell, index}<th class={`border border-border px-3 py-1.5 font-semibold ${alignClass(node.align[index] ?? "left")}`}><Inline text={cell} /></th>{/each}</tr></thead><tbody>{#each node.rows.slice(1) as row}<tr>{#each row as cell, index}<td class={`border border-border px-3 py-1.5 ${alignClass(node.align[index] ?? "left")}`}><Inline text={cell} /></td>{/each}</tr>{/each}</tbody></table></div>
{:else if node.type === "toggle"}
  <details class="my-2 rounded-md border border-border px-3 py-2 text-sm"><summary class="cursor-pointer font-medium"><Inline text={node.text} /></summary><div class="mt-2 pl-2"><MarkdownNodes nodes={node.children} /></div></details>
{/if}
