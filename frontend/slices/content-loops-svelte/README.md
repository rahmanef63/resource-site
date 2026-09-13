# content-loops — Svelte 5 / SvelteKit distribution

Native Svelte repeater for the canonical Content Loops contract. React remains
the default distribution. Both adapters share the exact same source registry,
mock source, pagination controller, variant-index helper, and portable types.

```svelte
<script lang="ts">
  import { ContentLoop, createMockLoopSource } from "@/features/content-loops-svelte";

  const source = createMockLoopSource();
</script>

{#snippet card(item, index)}
  <article>{index + 1}. {String(item.fields.title)}</article>
{/snippet}

<ContentLoop
  {source}
  pagination="infinite"
  pageSize={6}
  variants={[card]}
  class="grid gap-4"
/>
```

`variants` are Svelte 5 snippets and keep the same round-robin rule as React:
item `i` renders variant `i % variants.length`. `sourceId`, filters, ordering,
error/loading/empty behavior, and load-more accumulation share the canonical
framework-neutral controller.
