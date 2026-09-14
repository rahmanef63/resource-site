<script lang="ts">
  import { onMount } from "svelte";
  import { getCodeFs, type FsEntry } from "../../code-editor/lib/fs-core";
  import { joinPath } from "../../code-editor/lib/util";

  type Props = {
    rootPath?: string;
    activePath?: string | null;
    onOpenFile: (path: string) => void;
  };
  let { rootPath = "~", activePath = null, onOpenFile }: Props = $props();
  const fs = getCodeFs();
  let entries = $state<Record<string, FsEntry[]>>({});
  let expanded = $state<Set<string>>(new Set());
  let loading = $state<Set<string>>(new Set());

  async function load(path: string) {
    loading = new Set(loading).add(path);
    try {
      const result = await fs.list(path);
      entries = { ...entries, [path]: result.entries };
    } catch {
      entries = { ...entries, [path]: [] };
    } finally {
      const next = new Set(loading);
      next.delete(path);
      loading = next;
    }
  }

  function toggle(path: string) {
    const next = new Set(expanded);
    if (next.has(path)) next.delete(path);
    else {
      next.add(path);
      if (!entries[path]) void load(path);
    }
    expanded = next;
  }

  onMount(() => { expanded = new Set([rootPath]); void load(rootPath); });
</script>

{#snippet branch(path: string, depth: number)}
  {#if loading.has(path) && !entries[path]}
    <p class="px-2 py-1 text-xs text-muted-foreground" style={`padding-left:${depth * 12 + 10}px`}>Loading…</p>
  {/if}
  {#each entries[path] ?? [] as entry (`${path}:${entry.name}`)}
    {@const child = joinPath(path, entry.name)}
    {#if entry.kind === "dir"}
      <button
        type="button"
        class="flex w-full items-center gap-1.5 py-1 pr-2 text-left text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
        style={`padding-left:${depth * 12 + 8}px`}
        onclick={() => toggle(child)}
      >
        <span aria-hidden="true" class="w-3">{expanded.has(child) ? "▾" : "▸"}</span>
        <span class="truncate">{entry.name}</span>
      </button>
      {#if expanded.has(child)}
        {@render branch(child, depth + 1)}
      {/if}
    {:else}
      <button
        type="button"
        class={`flex w-full items-center gap-1.5 py-1 pr-2 text-left text-xs hover:bg-white/5 ${activePath === child ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
        style={`padding-left:${depth * 12 + 23}px`}
        onclick={() => onOpenFile(child)}
      >
        <span class="truncate">{entry.name}</span>
      </button>
    {/if}
  {/each}
{/snippet}

<div class="min-h-0 overflow-auto py-1">
  {@render branch(rootPath, 0)}
</div>
