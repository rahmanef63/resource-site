<script lang="ts">
  import type { FsEntry } from "@/features/file-explorer/adapter/types";
  import { fileGlyph } from "@/features/file-explorer/lib/file-kinds";
  import { fmtSize } from "@/features/file-explorer/lib/format";
  import type { ViewMode } from "@/features/file-explorer/lib/types";
  let { entries, selected, view, onSelect, onOpen, onContext } = $props<{
    entries: FsEntry[]; selected: string[]; view: ViewMode;
    onSelect: (event: MouseEvent, entry: FsEntry, index: number) => void;
    onOpen: (entry: FsEntry) => void;
    onContext: (event: MouseEvent, entry: FsEntry) => void;
  }>();
</script>
{#if view === "grid"}
  <div class="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2 p-3">
    {#each entries as entry, i (entry.name)}
      <button class={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-transparent p-2 text-center hover:bg-muted/60 ${selected.includes(entry.name) ? "border-primary bg-primary/10" : ""}`} onclick={(event) => onSelect(event, entry, i)} ondblclick={() => onOpen(entry)} oncontextmenu={(event) => onContext(event, entry)}>
        <span class="text-3xl" aria-hidden="true">{entry.meta?.icon ?? fileGlyph(entry)}</span>
        <span class="max-w-full truncate text-xs font-medium">{entry.name}</span>
        {#if entry.kind === "file"}<span class="text-[10px] text-muted-foreground">{fmtSize(entry.size)}</span>{/if}
      </button>
    {/each}
  </div>
{:else}
  <div class="p-2">
    <div class="grid grid-cols-[32px_1fr_110px_90px] gap-2 border-b px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground"><span></span><span>Name</span><span>Kind</span><span class="text-right">Size</span></div>
    {#each entries as entry, i (entry.name)}
      <button class={`grid w-full grid-cols-[32px_1fr_110px_90px] items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-muted/60 ${selected.includes(entry.name) ? "bg-primary/10" : ""}`} onclick={(event) => onSelect(event, entry, i)} ondblclick={() => onOpen(entry)} oncontextmenu={(event) => onContext(event, entry)}>
        <span aria-hidden="true">{entry.meta?.icon ?? fileGlyph(entry)}</span>
        <span class="truncate font-medium">{entry.name}</span>
        <span class="truncate text-muted-foreground">{entry.kind === "dir" ? "Folder" : (entry.ext?.toUpperCase() || "File")}</span>
        <span class="text-right tabular-nums text-muted-foreground">{entry.kind === "file" ? fmtSize(entry.size) : "—"}</span>
      </button>
    {/each}
  </div>
{/if}
