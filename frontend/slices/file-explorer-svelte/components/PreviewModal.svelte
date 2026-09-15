<script lang="ts">
  import { onMount } from "svelte";
  import type { FileExplorerAdapter, FsEntry } from "@/features/file-explorer/adapter/types";
  import { fileGlyph, previewKind } from "@/features/file-explorer/lib/file-kinds";
  import { fmtSize } from "@/features/file-explorer/lib/format";

  let { adapter, path, entry, onClose } = $props<{
    adapter: FileExplorerAdapter; path: string; entry: FsEntry; onClose: () => void;
  }>();
  let status = $state<"loading" | "ready" | "empty" | "error">("loading");
  let src = $state("");
  let text = $state<string | null>(null);
  let kind = $derived(previewKind(entry));

  onMount(() => {
    let active = true;
    void (async () => {
      try {
        if (kind === "text") {
          const doc = await adapter.read?.(path);
          if (!active) return;
          if (doc?.content != null) { text = doc.content; status = "ready"; return; }
          const url = (await adapter.readUrl?.(path)) || adapter.rawUrl(path);
          if (!url) { status = "empty"; return; }
          text = await fetch(url).then((r) => r.text());
          if (active) status = "ready";
          return;
        }
        const url = (await adapter.readUrl?.(path)) || adapter.rawUrl(path);
        if (!active) return;
        if (!url) { status = "empty"; return; }
        src = url; status = "ready";
      } catch { if (active) status = "error"; }
    })();
    return () => { active = false; };
  });
</script>

<div class="fixed inset-0 z-50 grid place-items-center p-4">
  <button class="absolute inset-0 bg-black/60" aria-label="Close preview" onclick={onClose}></button>
  <div class="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-background shadow-xl" role="dialog" aria-modal="true" aria-label={`Preview ${entry.name}`} tabindex="-1">
    <header class="flex items-center gap-3 border-b px-4 py-2">
      <span class="truncate text-sm font-medium">{entry.name}</span>
      <span class="ml-auto text-xs text-muted-foreground">{fmtSize(entry.size)}</span>
      <button class="rounded border px-2 py-1 text-xs" onclick={onClose}>Close</button>
    </header>
    <div class="flex min-h-72 flex-1 items-center justify-center overflow-auto bg-muted/20 p-3">
      {#if status === "loading"}<span class="text-sm text-muted-foreground">Loading…</span>{/if}
      {#if status === "empty" || status === "error" || !kind}
        <div class="flex flex-col items-center gap-2 text-center"><span class="text-5xl">{fileGlyph(entry)}</span><span class="text-sm">No preview available</span></div>
      {/if}
      {#if status === "ready" && kind === "image" && src}<img src={src} alt={entry.name} class="max-h-[72vh] max-w-full object-contain" />{/if}
      {#if status === "ready" && kind === "audio" && src}<audio src={src} controls autoplay class="w-full max-w-xl"><track kind="captions" /></audio>{/if}
      {#if status === "ready" && kind === "video" && src}<video src={src} controls class="max-h-[72vh] max-w-full"><track kind="captions" /></video>{/if}
      {#if status === "ready" && kind === "pdf" && src}<iframe src={src} title={entry.name} sandbox="allow-same-origin" referrerpolicy="no-referrer" class="h-[72vh] w-full rounded border bg-white"></iframe>{/if}
      {#if status === "ready" && kind === "text" && text != null}<pre class="max-h-[72vh] w-full overflow-auto rounded bg-background p-3 text-left text-xs whitespace-pre-wrap">{text}</pre>{/if}
    </div>
  </div>
</div>
