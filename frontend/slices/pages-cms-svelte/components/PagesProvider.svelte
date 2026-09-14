<script lang="ts">
  import type { Snippet } from "svelte";
  import type { PagesStore } from "../../pages-cms/lib/core";
  import { setPagesStore } from "../lib/context";

  let { value, children }: { value: PagesStore; children: Snippet } = $props();
  setPagesStore({
    get pages() { return value.pages; },
    create: (entry) => value.create(entry),
    update: (id, patch) => value.update(id, patch),
    remove: (id) => value.remove(id),
    reorderBlock: (id, from, to) => value.reorderBlock(id, from, to),
  });
</script>

{@render children()}
