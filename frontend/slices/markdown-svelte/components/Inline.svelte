<script lang="ts">
  import { tokenizeInline } from "../../markdown/lib/inline-core";
  import MathSpan from "./MathSpan.svelte";
  let { text }: { text: string } = $props();
  const tokens = $derived(tokenizeInline(text));
</script>

{#each tokens as token}
  {#if token.kind === "text"}{token.value}
  {:else if token.kind === "bold"}<strong>{token.inner}</strong>
  {:else if token.kind === "italic"}<em>{token.inner}</em>
  {:else if token.kind === "strike"}<del>{token.inner}</del>
  {:else if token.kind === "code"}<code class="rounded bg-muted/70 px-1 py-0.5 font-mono text-[0.9em]">{token.inner}</code>
  {:else if token.kind === "math"}<MathSpan tex={token.inner} />
  {:else if token.kind === "link"}
    <a
      href={token.href}
      target={token.href.startsWith("http") ? "_blank" : undefined}
      rel={token.href.startsWith("http") ? "noopener noreferrer nofollow" : undefined}
      class="text-primary underline-offset-2 hover:underline"
    >{token.label}</a>
  {/if}
{/each}
