<script lang="ts">
  import { editorFor } from "../../media-viewer/lib/media";
  import { openWindow } from "../../media-viewer/lib/host-core";
  import { remoteFile } from "../../media-viewer/lib/remote";
  import { SAMPLES } from "../../media-viewer/lib/samples";
  import { mediaViewerTools, type MediaViewerCtx } from "../../media-viewer/lib/tools";
  import MediaStage from "./MediaStage.svelte";
  import RemoteView from "./RemoteView.svelte";
  import ViewerToolbar from "./ViewerToolbar.svelte";

  type RegisterTools = (
    collection: typeof mediaViewerTools,
    context: MediaViewerCtx,
  ) => void | (() => void);

  let {
    payload = undefined,
    registerTools = undefined,
  } = $props<{ payload?: unknown; registerTools?: RegisterTools }>();

  let index = $state(0);
  let zoom = $state(1);
  let remote = $derived(remoteFile(payload));
  let file = $derived(SAMPLES[index]);

  function go(delta: number) {
    index = (index + delta + SAMPLES.length) % SAMPLES.length;
    zoom = 1;
  }

  function setZoom(next: number) {
    zoom = Math.min(3, Math.max(0.4, next));
  }

  function download() {
    if (!file.src || typeof document === "undefined") return;
    const anchor = document.createElement("a");
    anchor.href = file.src;
    anchor.download = file.name;
    anchor.click();
  }

  $effect(() => {
    if (!registerTools || remote) return;
    const cleanup = registerTools(mediaViewerTools, {
      current: () => ({ name: file.name, kind: file.kind, meta: file.meta }),
      count: () => SAMPLES.length,
      go,
      zoom: () => zoom,
      setZoom,
    });
    return typeof cleanup === "function" ? cleanup : undefined;
  });
</script>

{#if remote}
  <RemoteView file={remote} />
{:else}
  <div class="flex h-full min-h-0 w-full flex-col bg-background">
    <ViewerToolbar
      {file}
      {index}
      count={SAMPLES.length}
      {zoom}
      onPrev={() => go(-1)}
      onNext={() => go(1)}
      onZoomIn={() => setZoom(+(zoom + 0.2).toFixed(2))}
      onZoomOut={() => setZoom(+(zoom - 0.2).toFixed(2))}
      onDownload={download}
    />
    <MediaStage {file} {zoom} />
    {#if editorFor(file.kind)}
      <span class="sr-only">Editor handoff available through configureMediaOpener.</span>
    {/if}
  </div>
{/if}
