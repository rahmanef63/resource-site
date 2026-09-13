<script lang="ts">
  import type { MonitorVar } from "../../system-monitor/lib/palette";

  let { data, accent, max }: { data: number[]; accent: MonitorVar; max?: number } = $props();
  const width = 300;
  const height = 54;
  let peak = $derived(Math.max(max ?? 0, ...data, 1));
  let points = $derived(
    data.map((value, index) => `${(index / Math.max(1, data.length - 1)) * width},${height - (value / peak) * height}`).join(" "),
  );
</script>

<svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" class="h-[54px] w-full" aria-hidden="true">
  <polygon points={`0,${height} ${points} ${width},${height}`} fill={`var(${accent})`} opacity="0.14" />
  <polyline
    points={points}
    fill="none"
    stroke={`var(${accent})`}
    stroke-width="2"
    stroke-linejoin="round"
    vector-effect="non-scaling-stroke"
  />
</svg>
