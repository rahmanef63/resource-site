<script lang="ts">
  import type { PageBlock } from "../../pages-cms/types";
  import BlockRenderer from "./BlockRenderer.svelte";
  let { blocks }: { blocks: PageBlock[] } = $props();
</script>

{#each blocks as block}
  <BlockRenderer {block} />
{/each}
