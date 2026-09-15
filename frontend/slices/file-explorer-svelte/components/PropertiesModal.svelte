<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { FileExplorerAdapter, FsEntry } from "@/features/file-explorer/adapter/types";
  import { previewKind } from "@/features/file-explorer/lib/file-kinds";
  import { fmtSize } from "@/features/file-explorer/lib/format";

  type Row = { id: number; k: string; v: string };
  const RESERVED = new Set(["icon", "endpoint"]);
  let { adapter, path, entry, onClose, onSaved } = $props<{
    adapter: FileExplorerAdapter; path: string; entry: FsEntry; onClose: () => void; onSaved: () => void | Promise<void>;
  }>();
  let content = $state<string | null>(null);
  let original = $state<string | null>(null);
  let icon = $state(untrack(() => entry.meta?.icon ?? ""));
  let endpoint = $state(untrack(() => entry.meta?.endpoint ?? ""));
  let rows = $state<Row[]>(untrack(() => Object.entries(entry.meta ?? {}).filter(([k]) => !RESERVED.has(k)).map(([k, v], i) => ({ id: i, k, v }))));
  let nextRowId = untrack(() => rows.length);
  let busy = $state(false);
  let error = $state("");
  let canEditBody = $derived(entry.kind === "file" && previewKind(entry) === "text" && !!adapter.write);
  let canEditMeta = $derived(!!adapter.setMeta);

  onMount(() => {
    if (!canEditBody) return;
    void adapter.read?.(path).then((doc) => {
      const value = doc?.content ?? "";
      content = value; original = value;
    }).catch(() => { content = ""; original = ""; });
  });

  function patchRow(i: number, patch: Partial<Row>) {
    rows = rows.map((row, j) => j === i ? { ...row, ...patch } : row);
  }
  async function save() {
    busy = true; error = "";
    try {
      if (canEditBody && content != null && content !== original) await adapter.write?.(path, content);
      if (canEditMeta) {
        const meta: Record<string, string> = {};
        if (icon.trim()) meta.icon = icon.trim();
        if (endpoint.trim()) meta.endpoint = endpoint.trim();
        for (const row of rows) {
          const key = row.k.trim();
          if (key && !RESERVED.has(key)) meta[key] = row.v;
        }
        await adapter.setMeta?.(path, meta);
      }
      await onSaved(); onClose();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
      busy = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 grid place-items-center p-4">
  <button class="absolute inset-0 bg-black/60" aria-label="Close properties" onclick={onClose}></button>
  <div class="relative z-10 max-h-[85vh] w-full max-w-xl overflow-auto rounded-xl border bg-background shadow-xl" role="dialog" aria-modal="true" aria-label={`Properties ${entry.name}`} tabindex="-1">
    <header class="flex items-center border-b px-4 py-2"><strong class="truncate text-sm">Properties — {entry.name}</strong><button class="ml-auto rounded border px-2 py-1 text-xs" onclick={onClose}>Close</button></header>
    <div class="space-y-4 p-4">
      <dl class="grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 text-xs">
        <dt class="text-muted-foreground">Path</dt><dd class="truncate font-mono">{path}</dd>
        <dt class="text-muted-foreground">Kind</dt><dd>{entry.kind === "dir" ? "Folder" : (entry.ext?.toUpperCase() || "File")}</dd>
        {#if entry.kind === "file"}<dt class="text-muted-foreground">Size</dt><dd>{fmtSize(entry.size)}</dd>{/if}
      </dl>
      {#if canEditMeta}
        <div class="grid grid-cols-2 gap-2">
          <label class="space-y-1 text-xs"><span class="text-muted-foreground">Icon</span><input class="w-full rounded border bg-background px-2 py-1" bind:value={icon} placeholder="🌐" /></label>
          <label class="space-y-1 text-xs"><span class="text-muted-foreground">Endpoint</span><input class="w-full rounded border bg-background px-2 py-1" bind:value={endpoint} placeholder="https://…" /></label>
        </div>
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground">Custom fields</span>
          {#each rows as row, i (row.id)}
            <div class="flex gap-2">
              <input class="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-xs" value={row.k} oninput={(e) => patchRow(i, { k: e.currentTarget.value })} placeholder="key" />
              <input class="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-xs" value={row.v} oninput={(e) => patchRow(i, { v: e.currentTarget.value })} placeholder="value" />
              <button class="rounded border px-2 text-xs" aria-label="Remove field" onclick={() => rows = rows.filter((_, j) => j !== i)}>×</button>
            </div>
          {/each}
          <button class="rounded border px-2 py-1 text-xs" onclick={() => rows = [...rows, { id: nextRowId++, k: "", v: "" }]}>+ Field</button>
        </div>
      {/if}
      {#if canEditBody}
        <label class="block space-y-1 text-xs"><span class="text-muted-foreground">Content</span>{#if content == null}<p>Loading…</p>{:else}<textarea class="min-h-56 w-full resize-y rounded border bg-background p-2 font-mono text-xs" bind:value={content} spellcheck="false"></textarea>{/if}</label>
      {/if}
      {#if !canEditBody && !canEditMeta}<p class="text-xs text-muted-foreground">This backend does not expose editable properties.</p>{/if}
      {#if error}<p class="text-xs text-destructive">{error}</p>{/if}
    </div>
    <footer class="flex justify-end gap-2 border-t px-4 py-2"><button class="rounded border px-3 py-1.5 text-xs" onclick={onClose}>Cancel</button><button class="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-40" disabled={busy || (!canEditBody && !canEditMeta)} onclick={save}>{busy ? "Saving…" : "Save"}</button></footer>
  </div>
</div>
