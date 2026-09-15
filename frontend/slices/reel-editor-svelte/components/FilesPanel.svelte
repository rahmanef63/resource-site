<script lang="ts">
  import { onMount } from "svelte";
  import { createMediaRef, mediaTypeFromName, SAMPLES } from "@/features/reel-editor/lib/import-core";
  import { getReelFsAdapter, normalizeReelPath } from "@/features/reel-editor/lib/host-core";
  import { getSettings } from "@/features/reel-editor/lib/settings";
  import type { FsList } from "@/features/reel-editor/lib/host-core";
  import type { MediaRef, MediaType } from "@/features/reel-editor/lib/mock-timeline";

  let { onAdd } = $props<{ onAdd: (media: MediaRef, name: string) => void }>();
  const fs = getReelFsAdapter();
  let data = $state<FsList | null>(null);
  let loading = $state(false);
  let error = $state("");
  let input = $state<HTMLInputElement>();
  let path = $derived(data?.path ?? getSettings().projectDir);
  let entries = $derived((data?.entries ?? []).filter((e) => e.kind === "dir" || mediaTypeFromName(e.name, e.mime)));
  const join = (dir: string, name: string) => dir.endsWith("/") ? dir + name : `${dir}/${name}`;

  async function load(target: string) {
    loading = true; error = "";
    try { data = await fs.list(target); }
    catch (cause) { error = cause instanceof Error ? cause.message : String(cause); }
    finally { loading = false; }
  }
  async function ensureBase() {
    const base = getSettings().projectDir;
    try { await fs.list(base); }
    catch { try { await fs.mkdir(base); } catch {} }
    await load(base).catch(() => load("/"));
  }
  async function importUrl(url: string, type: MediaType, name: string) {
    onAdd(await createMediaRef(url, type), name);
  }
  async function openEntry(entry: NonNullable<FsList["entries"]>[number]) {
    const full = join(path, entry.name);
    if (entry.kind === "dir") return load(full);
    const type = mediaTypeFromName(entry.name, entry.mime);
    if (type) await importUrl(fs.rawUrl(full), type, entry.name);
  }
  async function filesChanged(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      const type = mediaTypeFromName(file.name, file.type);
      if (type) await importUrl(URL.createObjectURL(file), type, file.name);
    }
    if (input) input.value = "";
  }
  onMount(() => { void ensureBase(); });
</script>
<div class="flex h-full min-h-0 flex-col">
  <header class="flex items-center gap-2 border-b px-3 py-2"><strong class="text-xs uppercase tracking-wide text-muted-foreground">Project files</strong><button class="ml-auto rounded border px-2 py-1 text-xs" onclick={() => input?.click()}>Import</button></header>
  <div class="flex items-center gap-1 border-b px-2 py-1"><button class="rounded border px-2 py-1 text-xs disabled:opacity-40" disabled={!data?.parent} onclick={() => data?.parent && void load(data.parent)}>↑</button><span class="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground">{path}</span></div>
  <div class="flex gap-1 overflow-x-auto border-b p-2">{#each SAMPLES as sample}<button class="whitespace-nowrap rounded border px-2 py-1 text-[10px]" onclick={() => void importUrl(sample.url,sample.type,sample.label)}>{sample.label}</button>{/each}</div>
  <div class="min-h-0 flex-1 overflow-y-auto">
    {#if loading}<p class="p-4 text-xs text-muted-foreground">Loading…</p>{:else if error}<p class="p-4 text-xs text-destructive">{error}</p>{:else if !entries.length}<p class="p-4 text-xs text-muted-foreground">No media here.</p>{:else}
      {#each entries as entry (entry.name)}<button class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted" onclick={() => void openEntry(entry)}><span>{entry.kind === "dir" ? "📁" : mediaTypeFromName(entry.name,entry.mime)==="audio" ? "🎵" : mediaTypeFromName(entry.name,entry.mime)==="video" ? "🎬" : "🖼️"}</span><span class="min-w-0 flex-1 truncate">{entry.name}</span></button>{/each}
    {/if}
  </div>
  <input class="hidden" type="file" multiple accept="image/*,video/*,audio/*" bind:this={input} onchange={(e) => void filesChanged(e.currentTarget.files)} />
</div>
