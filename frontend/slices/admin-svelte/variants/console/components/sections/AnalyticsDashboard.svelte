<script lang="ts">
  import {
    MOCK_ANALYTICS,
    type AnalyticsData,
  } from "@/features/admin/variants/console/lib/mock";

  let { data = MOCK_ANALYTICS }: { data?: AnalyticsData } = $props();
  let maximum = $derived(Math.max(1, ...data.funnel.map((item) => item.count)));
</script>

<div class="space-y-6">
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {#each data.metrics as metric (metric.label)}
      <article class="rounded-xl border bg-card p-4 shadow-sm">
        <p class="text-xs font-medium text-muted-foreground">{metric.label}</p>
        <div class="mt-2 flex items-baseline justify-between gap-2">
          <strong class="text-2xl tabular-nums">{metric.value}</strong>
          <span class="rounded-full border px-2 py-0.5 text-xs tabular-nums">
            {metric.delta >= 0 ? "+" : ""}{metric.delta}%
          </span>
        </div>
      </article>
    {/each}
  </div>

  <article class="rounded-xl border bg-card p-4 shadow-sm">
    <h3 class="text-sm font-semibold">Conversion funnel</h3>
    <div class="mt-4 space-y-3">
      {#each data.funnel as item (item.step)}
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span>{item.step}</span>
            <span class="tabular-nums text-muted-foreground">{item.count.toLocaleString()}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-muted">
            <div class="h-full rounded-full bg-primary" style={`width:${(item.count / maximum) * 100}%`}></div>
          </div>
        </div>
      {/each}
    </div>
  </article>
</div>
