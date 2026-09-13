<script lang="ts">
  import { getContext } from "svelte";
  import { FILES_ADAPTER_CONTEXT, type FilesAdapterContext } from "../adapter/context";
  import { parseFileRef } from "../lib/parse";
  import { watchFileUrl } from "../lib/url";
  import type { FileRef } from "../types";

  type Props = { fileRef: FileRef; onRemove?: () => void; class?: string };
  let { fileRef, onRemove, class: className = "" }: Props = $props();
  const adapter = getContext<FilesAdapterContext | undefined>(FILES_ADAPTER_CONTEXT);
  if (!adapter) throw new Error("FileChip requires <FilesAdapterProvider adapter={...}>.");

  let href = $state<string | null>(null);
  let parsed = $derived(parseFileRef(fileRef));

  $effect(() => {
    if (parsed.kind === "url") {
      href = parsed.raw;
      return;
    }
    if (parsed.kind !== "storage") {
      href = null;
      return;
    }
    return watchFileUrl(adapter, parsed.storageId, (url) => (href = url));
  });
</script>

<div class={`group flex items-center gap-2 rounded border border-border bg-muted/40 px-2 py-1.5 text-xs ${className}`}>
  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
  </svg>
  {#if href}
    <a href={href} target="_blank" rel="noopener noreferrer" download={parsed.filename} class="min-w-0 flex-1 truncate text-brand hover:underline">
      {parsed.filename}
    </a>
    <a href={href} target="_blank" rel="noopener noreferrer" download={parsed.filename} class="text-muted-foreground hover:text-foreground" aria-label={parsed.kind === "url" ? "Open file" : "Download file"}>
      <span aria-hidden="true">{parsed.kind === "url" ? "↗" : "↓"}</span>
    </a>
  {:else}
    <span class={`min-w-0 flex-1 truncate ${parsed.kind === "storage" ? "text-muted-foreground" : ""}`}>{parsed.filename}</span>
  {/if}
  {#if onRemove}
    <button type="button" onclick={onRemove} aria-label="Remove" class="rounded p-0.5 text-muted-foreground opacity-0 hover:text-destructive focus:opacity-100 group-hover:opacity-100">×</button>
  {/if}
</div>
