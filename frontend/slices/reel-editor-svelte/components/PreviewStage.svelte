<script lang="ts">
  import type { Clip, Composition } from "@/features/reel-editor/lib/mock-timeline";
  import type { MediaCache } from "@/features/reel-editor/lib/media-cache";
  import { drawFrame } from "@/features/reel-editor/lib/draw";

  let { comp, frame, playing, monitor, cache } = $props<{
    comp: Composition;
    frame: number;
    playing: boolean;
    monitor: boolean;
    cache: MediaCache;
  }>();
  let canvas = $state<HTMLCanvasElement>();
  let tick = $state(0);
  let hasActive = $derived(comp.clips.some((clip: Clip) => clip.kind !== "audio" && frame >= clip.start && frame < clip.start + clip.len));

  $effect(() => {
    const current = canvas;
    comp; frame; playing; monitor; tick;
    if (!current) return;
    const ctx = current.getContext("2d");
    if (!ctx) return;
    cache.ensure(comp);
    cache.syncPlayback(comp, frame, playing, monitor);
    drawFrame(ctx, comp, frame, cache);
  });

  $effect(() => cache.onFrame(() => tick += 1));
</script>

<div class="grid min-h-0 flex-1 place-items-center overflow-hidden bg-black/5 p-3">
  <div class="relative max-h-full max-w-full overflow-hidden rounded-lg bg-black shadow-2xl" style={`aspect-ratio:${comp.w}/${comp.h};${comp.h > comp.w ? "height:100%" : "width:100%;max-width:48rem"}`}>
    <canvas bind:this={canvas} width={comp.w} height={comp.h} class="absolute inset-0 h-full w-full"></canvas>
    {#if !hasActive}<div class="absolute inset-0 grid place-items-center text-sm text-white/35">No clip at playhead</div>{/if}
  </div>
</div>
