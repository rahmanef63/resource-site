<script lang="ts">
  import { editorFor } from "../../media-viewer/lib/media";
  import { openWindow } from "../../media-viewer/lib/host-core";
  import type { Sample } from "../../media-viewer/lib/samples";

  let {
    file,
    index,
    count,
    zoom,
    onPrev,
    onNext,
    onZoomIn,
    onZoomOut,
    onDownload,
  } = $props<{
    file: Sample;
    index: number;
    count: number;
    zoom: number;
    onPrev: () => void;
    onNext: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onDownload: () => void;
  }>();

  let editor = $derived(editorFor(file.kind));

  function openEditor() {
    if (!editor) return;
    openWindow(editor.app, file.name, undefined, {
      path: file.name,
      name: file.name,
      kind: file.kind,
    });
  }
</script>

<header class="flex flex-wrap items-center gap-x-2 gap-y-1 border-b bg-background/60 px-3 py-2 backdrop-blur">
  <span class="min-w-0 flex-1 truncate text-sm font-semibold @max-[480px]:basis-full">{file.name}</span>
  <span class="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase text-secondary-foreground">{file.kind}</span>

  {#if file.kind === "image"}
    <span class="mx-1 h-5 w-px bg-border @max-[480px]:hidden" aria-hidden="true"></span>
    <button type="button" title="Zoom out" aria-label="Zoom out" disabled={zoom <= 0.4} onclick={onZoomOut} class="grid size-8 place-items-center rounded-md hover:bg-accent disabled:opacity-40">−</button>
    <span class="w-10 text-center font-mono text-[11px] tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
    <button type="button" title="Zoom in" aria-label="Zoom in" disabled={zoom >= 3} onclick={onZoomIn} class="grid size-8 place-items-center rounded-md hover:bg-accent disabled:opacity-40">+</button>
  {/if}

  <span class="mx-1 h-5 w-px bg-border @max-[480px]:hidden" aria-hidden="true"></span>
  <button type="button" title="Download" aria-label="Download" onclick={onDownload} class="grid size-8 place-items-center rounded-md hover:bg-accent">↓</button>
  {#if editor}
    <button type="button" title={`Open in ${editor.label}`} aria-label={`Open in ${editor.label}`} onclick={openEditor} class="rounded-md px-2 py-1 text-xs hover:bg-accent">Edit</button>
  {/if}

  <span class="mx-1 h-5 w-px bg-border @max-[480px]:hidden" aria-hidden="true"></span>
  <button type="button" title="Previous" aria-label="Previous" onclick={onPrev} class="grid size-8 place-items-center rounded-md hover:bg-accent">←</button>
  <span class="font-mono text-[11px] tabular-nums text-muted-foreground">{index + 1}/{count}</span>
  <button type="button" title="Next" aria-label="Next" onclick={onNext} class="grid size-8 place-items-center rounded-md hover:bg-accent">→</button>
</header>
