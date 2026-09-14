<script lang="ts">
  import { editorFor } from "../../media-viewer/lib/media";
  import { openWindow, rawUrl } from "../../media-viewer/lib/host-core";
  import type { RemoteFile } from "../../media-viewer/lib/remote";

  let { file } = $props<{ file: RemoteFile }>();
  let failedPath = $state<string | null>(null);
  let failed = $derived(failedPath === file.path);
  let src = $derived(rawUrl(file.path));
  let editor = $derived(editorFor(file.kind));

  function markFailed() {
    failedPath = file.path;
  }

  function openEditor() {
    if (!editor) return;
    openWindow(editor.app, file.name, undefined, {
      path: file.path,
      name: file.name,
      kind: file.kind,
    });
  }
</script>

<div class="flex h-full min-h-0 w-full flex-col bg-background">
  <header class="flex items-center gap-2 border-b bg-background/60 px-3 py-2">
    <span class="min-w-0 flex-1 truncate text-sm font-semibold">{file.name}</span>
    <span class="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase text-secondary-foreground">{file.kind}</span>
    {#if editor}
      <button type="button" onclick={openEditor} aria-label={`Open in ${editor.label}`} class="rounded-md px-2 py-1 text-xs hover:bg-accent">Edit</button>
    {/if}
  </header>

  <div
    class={`flex min-h-0 flex-1 ${file.kind === "pdf" ? "" : "items-center justify-center overflow-hidden bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:24px_24px] p-3"}`}
  >
    {#if failed}
      <div class="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border bg-card/80 p-8 text-center text-muted-foreground shadow-2xl backdrop-blur">
        <div class="grid size-14 place-items-center rounded-2xl bg-muted text-2xl text-foreground" aria-hidden="true">
          {file.kind === "video" ? "▶" : file.kind === "audio" ? "♫" : file.kind === "pdf" ? "▤" : "▧"}
        </div>
        <div class="text-sm font-semibold text-foreground">{file.name}</div>
        <p class="max-w-[300px] text-xs leading-relaxed">
          {editor ? "Couldn't preview this file here — open it in the editor." : "Couldn't preview this file here."}
        </p>
        {#if editor}
          <button type="button" onclick={openEditor} class="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">Open in {editor.label}</button>
        {/if}
      </div>
    {:else if file.kind === "image"}
      <img src={src} alt={file.name} onerror={markFailed} class="h-full w-full object-contain" />
    {:else if file.kind === "video"}
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={src} controls onerror={markFailed} class="h-full w-full object-contain"></video>
    {:else if file.kind === "audio"}
      <div class="flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border bg-card/80 p-6 shadow-2xl backdrop-blur">
        <div class="grid size-14 place-items-center rounded-xl bg-[var(--accent)]/15 text-2xl text-[var(--accent)]">♫</div>
        <div class="w-full truncate text-center text-sm font-semibold">{file.name}</div>
        <audio src={src} controls onerror={markFailed} class="w-full"></audio>
      </div>
    {:else}
      <iframe src={src} title={file.name} class="h-full w-full border-0 bg-white"></iframe>
    {/if}
  </div>
</div>
