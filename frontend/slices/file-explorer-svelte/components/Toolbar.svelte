<script lang="ts">
  import { crumbsFor } from "@/features/file-explorer/lib/format";
  import type { SortKey, ViewMode } from "@/features/file-explorer/lib/types";
  let { path, rootLabel = "Files", canBack, canForward, view, sort, selectedCount, hasClipboard, readonly = false, onBack, onForward, onNavigate, onRefresh, onNewFolder, onNewFile, onUpload, onCopy, onCut, onPaste, onTrash, onRemove, onProperties, onView, onSort } = $props<{
    path: string; rootLabel?: string; canBack: boolean; canForward: boolean; view: ViewMode; sort: SortKey; selectedCount: number; hasClipboard: boolean; readonly?: boolean;
    onBack: () => void; onForward: () => void; onNavigate: (path: string) => void; onRefresh: () => void; onNewFolder: () => void; onNewFile: () => void; onUpload: () => void; onCopy: () => void; onCut: () => void; onPaste: () => void; onTrash: () => void; onRemove: () => void; onProperties: () => void; onView: (view: ViewMode) => void; onSort: (sort: SortKey) => void;
  }>();
  let crumbs = $derived(crumbsFor(path, rootLabel));
</script>
<div class="border-b border-border bg-background/95 p-2">
  <div class="flex flex-wrap items-center gap-1.5">
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!canBack} onclick={onBack} aria-label="Back">←</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!canForward} onclick={onForward} aria-label="Forward">→</button>
    <button class="rounded border px-2 py-1 text-xs" onclick={onRefresh}>↻</button>
    <span class="mx-1 h-5 w-px bg-border"></span>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={readonly} onclick={onNewFolder}>+ Folder</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={readonly} onclick={onNewFile}>+ File</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={readonly} onclick={onUpload}>Upload</button>
    <span class="mx-1 h-5 w-px bg-border"></span>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!selectedCount} onclick={onCopy}>Copy</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!selectedCount || readonly} onclick={onCut}>Cut</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!hasClipboard || readonly} onclick={onPaste}>Paste</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!selectedCount || readonly} onclick={onTrash}>Trash</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!selectedCount || readonly} onclick={onRemove}>Delete</button>
    <button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={selectedCount !== 1} onclick={onProperties}>Properties</button>
    <span class="ml-auto"></span>
    <select class="rounded border bg-background px-2 py-1 text-xs" value={sort} onchange={(e) => onSort((e.currentTarget as HTMLSelectElement).value as SortKey)} aria-label="Sort files"><option value="name">Name</option><option value="size">Size</option><option value="kind">Kind</option></select>
    <button class="rounded border px-2 py-1 text-xs" aria-pressed={view === "grid"} onclick={() => onView("grid")}>▦</button>
    <button class="rounded border px-2 py-1 text-xs" aria-pressed={view === "list"} onclick={() => onView("list")}>☷</button>
  </div>
  <nav class="mt-2 flex min-w-0 items-center gap-1 overflow-x-auto text-xs" aria-label="Breadcrumb">
    {#each crumbs as crumb, i (crumb.path)}
      {#if i > 0}<span class="text-muted-foreground">/</span>{/if}
      <button class="whitespace-nowrap rounded px-1 py-0.5 hover:bg-muted" onclick={() => onNavigate(crumb.path)}>{crumb.name}</button>
    {/each}
  </nav>
</div>
