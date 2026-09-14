<script lang="ts">
  import { parseSpec, seriesKeys, type ChartSpec } from "../../markdown/components/chart-spec";

  const WIDTH = 640;
  const HEIGHT = 260;
  const PAD_X = 44;
  const PAD_TOP = 18;
  const PAD_BOTTOM = 38;
  const PLOT_W = WIDTH - PAD_X * 2;
  const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

  let { text }: { text: string } = $props();
  const spec = $derived(parseSpec(text));
  const keys = $derived(spec ? seriesKeys(spec) : []);
  const xKey = $derived(spec?.xKey ?? "name");
  const maxValue = $derived(spec ? findMax(spec, keys) : 1);

  function findMax(value: ChartSpec, series: string[]) {
    let max = 0;
    for (const row of value.data) for (const key of series) max = Math.max(max, Number(row[key]) || 0);
    return max || 1;
  }
  function y(value: number) {
    return PAD_TOP + PLOT_H - (Math.max(0, value) / maxValue) * PLOT_H;
  }
  function pointsFor(key: string) {
    if (!spec) return "";
    const step = spec.data.length > 1 ? PLOT_W / (spec.data.length - 1) : PLOT_W / 2;
    return spec.data.map((row, index) => `${PAD_X + index * step},${y(Number(row[key]) || 0)}`).join(" ");
  }
  function pieSlices() {
    if (!spec || !keys.length) return [];
    const key = keys[0]!;
    const values = spec.data.map((row) => Math.max(0, Number(row[key]) || 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    if (!total) return [];
    let angle = -Math.PI / 2;
    return values.map((value, index) => {
      const next = angle + (value / total) * Math.PI * 2;
      const path = arcPath(320, 128, 92, angle, next);
      angle = next;
      return { path, index, label: String(spec!.data[index]?.[xKey] ?? index + 1), value };
    });
  }
  function arcPath(cx: number, cy: number, radius: number, start: number, end: number) {
    const a = { x: cx + Math.cos(start) * radius, y: cy + Math.sin(start) * radius };
    const b = { x: cx + Math.cos(end) * radius, y: cy + Math.sin(end) * radius };
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${a.x} ${a.y} A ${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y} Z`;
  }
</script>

{#if !spec || keys.length === 0}
  <pre class="my-3 overflow-x-auto rounded-md border border-destructive/40 bg-muted/40 p-3 text-xs"><code class="font-mono">{text}</code></pre>
{:else}
  <figure class="my-3 rounded-md border border-border bg-background p-3">
    {#if spec.title}<figcaption class="mb-2 text-center text-xs font-medium text-muted-foreground">{spec.title}</figcaption>{/if}
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} class="h-64 w-full" role="img" aria-label={spec.title ?? `${spec.type} chart`}>
      {#if spec.type === "pie"}
        {#each pieSlices() as slice}
          <path d={slice.path} fill={`var(--chart-${(slice.index % 5) + 1})`} stroke="var(--background)" stroke-width="2" />
        {/each}
      {:else}
        <line x1={PAD_X} y1={PAD_TOP + PLOT_H} x2={WIDTH - PAD_X} y2={PAD_TOP + PLOT_H} stroke="var(--border)" />
        {#if spec.type === "bar"}
          {@const groupWidth = PLOT_W / spec.data.length}
          {@const barWidth = Math.max(4, (groupWidth * 0.72) / Math.max(1, keys.length))}
          {#each spec.data as row, rowIndex}
            {#each keys as key, keyIndex}
              {@const value = Number(row[key]) || 0}
              <rect
                x={PAD_X + rowIndex * groupWidth + groupWidth * 0.14 + keyIndex * barWidth}
                y={y(value)}
                width={barWidth - 1}
                height={PAD_TOP + PLOT_H - y(value)}
                rx="2"
                fill={`var(--chart-${(keyIndex % 5) + 1})`}
              />
            {/each}
          {/each}
        {:else}
          {#each keys as key, keyIndex}
            {#if spec.type === "area"}
              <polygon points={`${PAD_X},${PAD_TOP + PLOT_H} ${pointsFor(key)} ${WIDTH - PAD_X},${PAD_TOP + PLOT_H}`} fill={`var(--chart-${(keyIndex % 5) + 1})`} fill-opacity="0.18" />
            {/if}
            <polyline points={pointsFor(key)} fill="none" stroke={`var(--chart-${(keyIndex % 5) + 1})`} stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
          {/each}
        {/if}
        {#each spec.data as row, rowIndex}
          {@const x = PAD_X + (spec.data.length > 1 ? rowIndex * (PLOT_W / (spec.data.length - 1)) : PLOT_W / 2)}
          <text x={x} y={HEIGHT - 12} text-anchor="middle" font-size="11" fill="var(--muted-foreground)">{String(row[xKey] ?? rowIndex + 1)}</text>
        {/each}
      {/if}
    </svg>
    {#if keys.length > 1 && spec.type !== "pie"}
      <div class="mt-1 flex flex-wrap justify-center gap-3 text-[11px] text-muted-foreground">
        {#each keys as key, index}<span class="inline-flex items-center gap-1"><span class="size-2 rounded-full" style={`background:var(--chart-${(index % 5) + 1})`}></span>{key}</span>{/each}
      </div>
    {/if}
  </figure>
{/if}
