<script lang="ts">
  import PayloadRender from "../components/PayloadRender.svelte";
  import UpvotePanel from "../components/UpvotePanel.svelte";
  import { resolveKindLabels, resolveLibraryCopy } from "@/features/library/lib/core";
  import type {
    KindLabelMap,
    LibraryCopy,
    LibraryItem,
    UpvoteHandler,
  } from "@/features/library/lib/types";

  let {
    item,
    onUpvote,
    copy: copyOverride,
    kindLabels: kindLabelsOverride,
  }: {
    item: LibraryItem;
    onUpvote?: UpvoteHandler;
    copy?: Partial<LibraryCopy>;
    kindLabels?: KindLabelMap;
  } = $props();

  let copy = $derived(resolveLibraryCopy(copyOverride));
  let kindLabels = $derived(resolveKindLabels(kindLabelsOverride));
</script>

<section class="py-12 lg:py-20">
  <div class="container mx-auto max-w-3xl space-y-8 px-4 lg:px-8">
    <div class="space-y-3">
      <a href="/library" class="text-[11px] uppercase tracking-wider opacity-60 hover:opacity-100">{copy.backLabel}</a>
      <div class="text-[10px] uppercase tracking-wider opacity-60">{kindLabels[item.kind] ?? item.kind}</div>
      <h1 class="font-serif text-4xl leading-tight lg:text-5xl">{item.title}</h1>
      <p class="text-base opacity-70">{item.excerpt}</p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      {#key item._id}
        <UpvotePanel itemId={item._id} initial={item.upvotes ?? 0} {onUpvote} label={copy.upvoteLabel} />
      {/key}
      {#each item.tools ?? [] as tool (tool)}
        <span class="rounded border-2 border-current/40 px-2 py-0.5 text-[11px] uppercase tracking-wider">{tool}</span>
      {/each}
    </div>

    <PayloadRender {item} {copy} />

    {#if item.description}
      <div class="prose prose-neutral max-w-none dark:prose-invert">
        <p class="whitespace-pre-wrap">{item.description}</p>
      </div>
    {/if}

    <footer class="space-y-3 border-t-2 border-current/30 pt-6">
      <h2 class="text-sm font-bold uppercase tracking-wider">{copy.attributionHeading}</h2>
      <dl class="grid gap-1.5 text-sm sm:grid-cols-[120px_1fr]">
        {#if item.sourceName}
          <dt class="opacity-60">{copy.sourceLabel}</dt>
          <dd>
            {#if item.sourceUrl}
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" class="underline underline-offset-4">
                {item.sourceName} ↗
              </a>
            {:else}
              {item.sourceName}
            {/if}
          </dd>
        {/if}
        {#if item.license}
          <dt class="opacity-60">{copy.licenseLabel}</dt>
          <dd>{item.license}</dd>
        {/if}
        {#if (item.tags ?? []).length > 0}
          <dt class="opacity-60">{copy.tagsLabel}</dt>
          <dd class="flex flex-wrap gap-1">
            {#each item.tags ?? [] as tag (tag)}<span class="text-xs">#{tag}</span>{/each}
          </dd>
        {/if}
      </dl>
    </footer>
  </div>
</section>
