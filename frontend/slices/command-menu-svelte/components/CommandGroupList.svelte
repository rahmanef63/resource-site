<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    filterCommandGroups,
    type CommandGroupBase,
    type CommandItemBase,
  } from "../../command-menu/lib/core";

  let {
    groups,
    query,
    onSelect,
    renderIcon,
    renderTrailing,
  } = $props<{
    groups: CommandGroupBase[];
    query: string;
    onSelect: (item: CommandItemBase) => void | Promise<void>;
    renderIcon?: Snippet<[CommandItemBase]>;
    renderTrailing?: Snippet<[CommandItemBase]>;
  }>();

  let filtered = $derived(filterCommandGroups(groups, query));
</script>

{#each filtered as group (group.id)}
  <section class="mb-2" data-command-group={group.id}>
    <div class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {group.heading}
    </div>
    {#each group.items as item (item.id)}
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
        data-command-item={item.id}
        onclick={() => onSelect(item)}
      >
        {#if renderIcon}{@render renderIcon(item)}{/if}
        <span class="min-w-0 flex-1 truncate">{item.label}</span>
        {#if renderTrailing}{@render renderTrailing(item)}{/if}
      </button>
    {/each}
  </section>
{/each}
