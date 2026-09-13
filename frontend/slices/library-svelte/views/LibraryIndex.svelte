<script lang="ts">
  import {
    ALL_KINDS,
    collectLibraryTools,
    filterLibraryItems,
    resolveKindLabels,
    resolveLibraryCopy,
    type LibraryKindFilter,
  } from "@/features/library/lib/core";
  import type {
    KindLabelMap,
    LibraryCopy,
    LibraryRow,
  } from "@/features/library/lib/types";

  let {
    items,
    copy: copyOverride,
    kindLabels: kindLabelsOverride,
  }: {
    items: LibraryRow[];
    copy?: Partial<LibraryCopy>;
    kindLabels?: KindLabelMap;
  } = $props();

  let kind = $state<LibraryKindFilter>("all");
  let tool = $state("");
  let copy = $derived(resolveLibraryCopy(copyOverride));
  let kindLabels = $derived(resolveKindLabels(kindLabelsOverride));
  let allTools = $derived(collectLibraryTools(items));
  let filtered = $derived(filterLibraryItems(items, kind, tool));

  function chip(active: boolean): string {
    return `h-auto rounded-md border-2 px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${active ? "border-current bg-foreground text-background" : "border-current/40 hover:border-current"}`;
  }
</script>

<section class="py-12 lg:py-20">
  <div class="container mx-auto space-y-8 px-4 lg:px-8">
    <header class="space-y-3">
      <div class="text-[10px] uppercase tracking-wider opacity-60">{copy.eyebrow}</div>
      <h1 class="font-serif text-4xl leading-tight lg:text-6xl">{copy.title}</h1>
      {#if copy.body}<p class="max-w-2xl text-base opacity-70">{copy.body}</p>{/if}
    </header>

    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class={chip(kind === "all")} onclick={() => (kind = "all")}>{copy.allLabel}</button>
        {#each ALL_KINDS as value (value)}
          <button type="button" class={chip(kind === value)} onclick={() => (kind = value)}>
            {kindLabels[value] ?? value}
          </button>
        {/each}
      </div>

      {#if allTools.length > 0}
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[10px] uppercase tracking-wider opacity-50">{copy.toolLabel}</span>
          <button
            type="button"
            class={`px-1 py-0 text-[11px] underline underline-offset-4 ${tool === "" ? "font-bold" : "opacity-60"}`}
            onclick={() => (tool = "")}
          >{copy.toolAllLabel}</button>
          {#each allTools as value (value)}
            <button
              type="button"
              class={`px-1 py-0 text-[11px] underline underline-offset-4 ${tool === value ? "font-bold" : "opacity-60"}`}
              onclick={() => (tool = value === tool ? "" : value)}
            >{value}</button>
          {/each}
        </div>
      {/if}
    </div>

    {#if filtered.length === 0}
      <p class="text-sm opacity-60">{copy.emptyText}</p>
    {:else}
      <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each filtered as item (item._id)}
          <li class="rounded-md border-2 border-current transition-shadow hover:shadow-md">
            <a href={`/library/${item.slug}`} class="group block space-y-3 p-4">
              <div class="flex items-baseline justify-between gap-2">
                <span class="rounded-sm border-2 border-current px-2 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
                  {kindLabels[item.kind] ?? item.kind}
                </span>
                {#if typeof item.upvotes === "number" && item.upvotes > 0}
                  <span class="text-[11px] tabular-nums opacity-60">▲ {item.upvotes}</span>
                {/if}
              </div>
              <h3 class="text-base font-bold leading-tight underline-offset-4 group-hover:underline">{item.title}</h3>
              <p class="line-clamp-3 text-sm opacity-70">{item.excerpt}</p>
              {#if (item.tools ?? []).length > 0}
                <div class="flex flex-wrap gap-1">
                  {#each (item.tools ?? []).slice(0, 4) as itemTool (itemTool)}
                    <span class="rounded border border-current/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">{itemTool}</span>
                  {/each}
                </div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
