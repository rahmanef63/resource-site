<script lang="ts">
  import { activityStatItems } from "../../activity/lib/stats";
  import type { ActivityCopy, ActivityStats, CategoryLabelMap } from "../../activity/lib/types";

  type Props = {
    stats: ActivityStats;
    copy: ActivityCopy;
    categoryLabels: CategoryLabelMap;
  };

  let { stats, copy, categoryLabels }: Props = $props();
  let items = $derived(activityStatItems(stats, copy, categoryLabels));
</script>

<div class="mb-8 rounded-lg border-2 bg-background p-4 lg:p-6">
  <div class="mb-3 text-[10px] uppercase tracking-wider opacity-60">
    {copy.statsHeading}
  </div>
  <div class="flex flex-wrap items-center gap-3">
    {#each items as item (item.key)}
      <div class="rounded-md border-2 px-3 py-2">
        <div class="text-[10px] uppercase tracking-wider opacity-60">{item.label}</div>
        <div class="font-serif text-2xl">{item.value}</div>
      </div>
    {/each}
  </div>
</div>
