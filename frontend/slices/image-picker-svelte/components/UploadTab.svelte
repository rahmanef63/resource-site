<script lang="ts">
  import { onDestroy } from "svelte";
  import { validateUploadFile } from "@/features/image-picker/lib/core";
  import type { ImageValue, UploadFn } from "@/features/image-picker/types";

  let { onSelect, onUpload }: { onSelect: (image: ImageValue) => void; onUpload: UploadFn } = $props();
  let file = $state<File | null>(null);
  let preview = $state<string | null>(null);
  let busy = $state(false);
  let error = $state<string | null>(null);

  function pick(next: File | undefined) {
    if (!next) return;
    const problem = validateUploadFile(next);
    if (problem) {
      error = problem;
      return;
    }
    error = null;
    file = next;
    if (preview) URL.revokeObjectURL(preview);
    preview = URL.createObjectURL(next);
  }

  async function apply() {
    if (!file || busy) return;
    busy = true;
    error = null;
    try {
      const ref = await onUpload(file);
      onSelect({ type: "upload", value: ref, positionY: 50, metadata: { filename: file.name } });
    } catch (cause) {
      error = `Upload failed: ${cause instanceof Error ? cause.message : String(cause)}`;
    } finally {
      busy = false;
    }
  }

  onDestroy(() => {
    if (preview) URL.revokeObjectURL(preview);
  });

  function drop(event: DragEvent) {
    event.preventDefault();
    pick(event.dataTransfer?.files?.[0]);
  }
</script>

<div class="space-y-3 p-4">
  <label class="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed border-border text-sm text-muted-foreground transition hover:border-primary" ondragover={(event) => event.preventDefault()} ondrop={drop}>
    <input class="sr-only" type="file" accept="image/*" onchange={(event) => pick(event.currentTarget.files?.[0])} />
    {#if preview}
      <img src={preview} alt="Selected upload preview" class="h-full w-full object-cover" />
    {:else}
      <span class="text-lg" aria-hidden="true">⇧</span>
      <span>Drag an image or click to choose (≤ 8 MB)</span>
    {/if}
  </label>
  {#if error}<p class="text-xs text-destructive">{error}</p>{/if}
  <button type="button" class="h-9 w-full rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50" disabled={!file || busy} onclick={() => void apply()}>
    {busy ? "Uploading…" : "Upload & set image"}
  </button>
</div>
