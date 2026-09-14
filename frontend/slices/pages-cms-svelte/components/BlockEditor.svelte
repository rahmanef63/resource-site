<script lang="ts">
  import { BLOCK_KIND_LABEL, type PageBlock } from "../../pages-cms/types";
  import BlockSimpleFields from "./BlockSimpleFields.svelte";
  import BlockListFields from "./BlockListFields.svelte";
  import BlockRichFields from "./BlockRichFields.svelte";

  let { block, onChange, onRemove }: {
    block: PageBlock;
    onChange: (next: PageBlock) => void;
    onRemove?: () => void;
  } = $props();
</script>

<section class="rounded-lg border bg-card">
  <header class="flex items-center justify-between border-b p-4">
    <h3 class="text-sm font-semibold">{BLOCK_KIND_LABEL[block.kind]}</h3>
    {#if onRemove}<button class="text-xs text-muted-foreground" type="button" onclick={onRemove}>Remove block</button>{/if}
  </header>
  <div class="p-4">
    {#if ["hero", "text", "cta", "testimonial", "video"].includes(block.kind)}
      <BlockSimpleFields {block} {onChange} />
    {:else if ["feature-list", "faq", "stats", "logo-cloud"].includes(block.kind)}
      <BlockListFields {block} {onChange} />
    {:else}
      <BlockRichFields {block} {onChange} />
    {/if}
  </div>
</section>
