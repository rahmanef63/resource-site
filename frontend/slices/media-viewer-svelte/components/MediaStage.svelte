<script lang="ts">
  import type { Sample } from "../../media-viewer/lib/samples";
  import AudioPlayer from "./AudioPlayer.svelte";
  import ImageView from "./ImageView.svelte";
  import VideoPlayer from "./VideoPlayer.svelte";

  let { file, zoom } = $props<{ file: Sample; zoom: number }>();
  let stageClass = $derived(
    file.kind === "image"
      ? "bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:24px_24px]"
      : "bg-[#0c0d10]",
  );
</script>

<div class={`flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 @md:p-6 ${stageClass}`}>
  {#if file.kind === "image"}
    <ImageView {file} {zoom} />
  {:else if file.kind === "video"}
    <VideoPlayer {file} />
  {:else if file.kind === "audio"}
    <AudioPlayer {file} />
  {:else}
    <div class="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-2xl">
      <div class="text-3xl" aria-hidden="true">{file.kind === "pdf" ? "▤" : "?"}</div>
      <div class="text-sm font-semibold text-foreground">{file.name}</div>
      <div class="text-xs">
        {file.kind === "pdf" ? "PDF preview is not available in the mock filesystem." : "No preview available for this file type."}
        {file.meta ? ` · ${file.meta}` : ""}
      </div>
    </div>
  {/if}
</div>
