<script lang="ts">
  import { fmtGiB } from "@/features/file-explorer/lib/format";
  import type { FsRoot, FsUsage } from "@/features/file-explorer/adapter/types";
  let { roots, usage, path, onNavigate, onTrash, onEmptyTrash } = $props<{
    roots: FsRoot[]; usage: FsUsage | null; path: string; onNavigate: (path: string) => void; onTrash: () => void; onEmptyTrash: () => void;
  }>();
</script>
<aside class="flex h-full w-48 shrink-0 flex-col border-r border-border bg-muted/20 p-2">
  <p class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Locations</p>
  <div class="space-y-1">
    {#each roots as root (root.path)}
      <button class="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-muted" class:bg-muted={path === root.path} onclick={() => onNavigate(root.path)}>📁 {root.label}</button>
    {/each}
    <button class="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-muted" class:bg-muted={path === "/.Trash"} onclick={onTrash}>🗑️ Trash</button>
  </div>
  <div class="mt-auto space-y-2 border-t border-border pt-3">
    {#if usage}
      <div class="px-2 text-[10px] text-muted-foreground">
        <div class="mb-1 flex justify-between"><span>{fmtGiB(usage.used)}</span><span>{fmtGiB(usage.total)}</span></div>
        <div class="h-1.5 overflow-hidden rounded bg-muted"><div class="h-full bg-primary" style={`width:${Math.min(100, usage.used / usage.total * 100)}%`}></div></div>
      </div>
    {/if}
    <button class="w-full rounded border px-2 py-1 text-xs" onclick={onEmptyTrash}>Empty Trash</button>
  </div>
</aside>
