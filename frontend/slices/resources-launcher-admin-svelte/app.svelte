<script lang="ts">
  import { onMount } from "svelte";
  import ResourceEditor from "./components/ResourceEditor.svelte";
  import {
    readResourcesState,
    resourcesApi,
    swapResourceOrder,
    type Resource,
  } from "@/features/resources-launcher-admin/lib/core";

  let rows = $state<Resource[]>([]);
  let editing = $state<Resource | "new" | null>(null);
  let canManage = $state(false);
  let loading = $state(false);
  let error = $state("");

  async function reload() {
    loading = true;
    error = "";
    try {
      const state = await readResourcesState();
      rows = state.rows;
      canManage = state.canManage;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Unable to load resources.";
    } finally {
      loading = false;
    }
  }

  async function removeResource(resource: Resource) {
    await resourcesApi.remove(resource.id);
    await reload();
  }

  async function move(index: number, direction: -1 | 1) {
    const swap = swapResourceOrder(rows, index, direction);
    if (!swap) return;
    await resourcesApi.upsert(swap[0]);
    await resourcesApi.upsert(swap[1]);
    await reload();
  }

  function finishEditing() {
    editing = null;
    void reload();
  }

  onMount(() => {
    void reload();
  });
</script>

<div class="h-full overflow-y-auto bg-background text-foreground">
  <div class="mx-auto w-full max-w-3xl p-5">
    <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Launcher</p>
        <h1 class="text-lg font-semibold">Resources Admin</h1>
      </div>
      {#if canManage}
        <div class="flex items-center gap-2">
          <button type="button" class="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted" onclick={() => (editing = "new")}>New</button>
          <button type="button" class="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50" onclick={() => void reload()} disabled={loading}>
            {loading ? "Reloading…" : "Reload"}
          </button>
        </div>
      {/if}
    </header>

    {#if !canManage && !loading}
      <p class="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
        Read-only. Configure a live adapter with upsert, remove and canManage to enable owner actions.
      </p>
    {/if}

    {#if error}
      <p class="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
    {/if}

    {#if editing && canManage}
      {#key editing === "new" ? "new" : editing.id}
        <ResourceEditor row={editing === "new" ? null : editing} onDone={finishEditing} onCancel={() => (editing = null)} />
      {/key}
    {/if}

    <ul class="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {#if loading && rows.length === 0}
        <li class="p-4 text-sm text-muted-foreground">Loading resources…</li>
      {:else if rows.length === 0}
        <li class="p-4 text-sm text-muted-foreground">No links yet. Add one with the New button.</li>
      {:else}
        {#each rows as resource, index (resource.id)}
          <li class="flex flex-wrap items-center gap-3 px-3 py-3">
            <span class="grid min-w-14 place-items-center rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground" title={`Icon: ${resource.icon}`}>{resource.icon}</span>
            <div class="min-w-44 flex-1">
              <p class="text-sm font-medium">{resource.label}</p>
              <p class="truncate text-xs text-muted-foreground">{resource.group} · {resource.url}</p>
            </div>
            <a href={resource.url} target="_blank" rel="noreferrer noopener" class="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Open ↗</a>
            {#if canManage}
              <div class="flex items-center gap-1">
                <button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-muted disabled:opacity-40" aria-label="Move up" disabled={index === 0} onclick={() => void move(index, -1)}>↑</button>
                <button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-muted disabled:opacity-40" aria-label="Move down" disabled={index === rows.length - 1} onclick={() => void move(index, 1)}>↓</button>
                <button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-muted" onclick={() => (editing = resource)}>Edit</button>
                <button type="button" class="rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10" onclick={() => void removeResource(resource)}>Delete</button>
              </div>
            {/if}
          </li>
        {/each}
      {/if}
    </ul>
  </div>
</div>
