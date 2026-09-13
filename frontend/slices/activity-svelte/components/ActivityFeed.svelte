<script lang="ts">
  import ActivityItem from "./ActivityItem.svelte";
  import StatsPanel from "./StatsPanel.svelte";
  import { DEFAULT_CATEGORY_LABELS, DEFAULT_COPY } from "../../activity/lib/defaults";
  import { groupByWeek } from "../../activity/lib/grouping";
  import type {
    ActivityCopy,
    ActivityFeedProps,
    CategoryLabelMap,
  } from "../../activity/lib/types";

  let {
    rows,
    stats = null,
    copy: copyOverride,
    categoryLabels: categoryLabelsOverride,
    locale = "en-US",
  }: ActivityFeedProps = $props();

  let copy = $derived<ActivityCopy>({ ...DEFAULT_COPY, ...copyOverride });
  let categoryLabels = $derived<CategoryLabelMap>({
    ...DEFAULT_CATEGORY_LABELS,
    ...categoryLabelsOverride,
  });
  let groups = $derived(groupByWeek(rows, copy.weekLabelTemplate));
</script>

<section class="py-12 lg:py-20">
  <div class="container mx-auto max-w-5xl px-4 lg:px-8">
    <div class="mb-8 space-y-4">
      <div class="text-[10px] uppercase tracking-wider opacity-60">{copy.eyebrow}</div>
      <h1 class="font-serif text-4xl leading-tight lg:text-6xl">{copy.title}</h1>
      {#if copy.body}
        <p class="max-w-2xl text-base leading-relaxed opacity-80">{copy.body}</p>
      {/if}
    </div>

    {#if stats}
      <StatsPanel {stats} {copy} {categoryLabels} />
    {/if}

    {#if groups.length === 0}
      <div class="rounded-lg border-2 border-dashed p-12 text-center">
        <p class="font-serif text-2xl">{copy.emptyTitle}</p>
        <p class="mt-3 text-sm opacity-70">{copy.emptyBody}</p>
      </div>
    {:else}
      <div class="space-y-12">
        {#each groups as group (group.key)}
          <section>
            <div class="mb-6 flex items-baseline justify-between border-b-2 pb-3">
              <h2 class="font-serif text-2xl lg:text-3xl">{group.label}</h2>
              <span class="text-[10px] uppercase tracking-wider opacity-60">
                {group.rows.length} {copy.entriesSuffix}
              </span>
            </div>
            <ol class="space-y-0 overflow-hidden rounded-lg border-2">
              {#each group.rows as row, index (row._id)}
                <ActivityItem
                  {row}
                  {copy}
                  {categoryLabels}
                  {locale}
                  isLast={index === group.rows.length - 1}
                />
              {/each}
            </ol>
          </section>
        {/each}
      </div>
    {/if}
  </div>
</section>
