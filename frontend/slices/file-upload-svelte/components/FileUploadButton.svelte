<script lang="ts">
  import { getContext } from "svelte";
  import { FILES_ADAPTER_CONTEXT, type FilesAdapterContext } from "../adapter/context";
  import { uploadFiles } from "../lib/upload";
  import type { FileRef } from "../types";

  type Props = {
    onUploaded: (ref: FileRef) => void;
    onError?: (error: unknown) => void;
    multiple?: boolean;
    label?: string;
    accept?: string;
    disabled?: boolean;
    class?: string;
  };

  let {
    onUploaded,
    onError,
    multiple = false,
    label = "Upload",
    accept,
    disabled = false,
    class: className = "",
  }: Props = $props();
  const adapter = getContext<FilesAdapterContext | undefined>(FILES_ADAPTER_CONTEXT);
  if (!adapter) throw new Error("FileUploadButton requires <FilesAdapterProvider adapter={...}>.");

  let picker: HTMLInputElement;
  let uploading = $state(false);

  async function onPick(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length === 0) return;
    uploading = true;
    try {
      await uploadFiles(adapter, files, (ref) => onUploaded(ref));
    } catch (error) {
      onError?.(error);
      if (!onError) console.error("Upload failed", error);
    } finally {
      uploading = false;
      input.value = "";
    }
  }
</script>

<input bind:this={picker} type="file" {multiple} {accept} class="sr-only" onchange={onPick} />
<button
  type="button"
  class={`inline-flex h-auto items-center gap-1 p-0 text-xs font-normal text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  disabled={disabled || uploading}
  onclick={() => picker?.click()}
  aria-busy={uploading}
>
  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 3v12m0-12-4 4m4-4 4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </svg>
  {uploading ? "Uploading…" : label}
</button>
