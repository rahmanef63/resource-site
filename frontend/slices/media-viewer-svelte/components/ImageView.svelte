<script lang="ts">
  import type { Sample } from "../../media-viewer/lib/samples";
  let { file, zoom } = $props<{ file: Sample; zoom: number }>();
</script>

<div class="flex flex-col items-center gap-3">
  {#if file.src}
    <img
      src={file.src}
      alt={file.name}
      class="max-h-full max-w-full rounded-lg shadow-2xl transition-transform duration-200"
      style:transform={`scale(${zoom})`}
    />
  {:else}
    <div class="grid aspect-video w-[min(70vw,520px)] place-items-center rounded-lg border bg-card text-xs text-muted-foreground shadow-2xl">
      No preview
    </div>
  {/if}
  {#if file.dims}
    <span class="font-mono text-[11px] text-muted-foreground">{file.dims.w} × {file.dims.h}</span>
  {/if}
</div>
