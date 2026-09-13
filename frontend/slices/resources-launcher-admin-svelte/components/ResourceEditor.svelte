<script lang="ts">
  import {
    RESOURCE_ICON_NAMES,
    resourcesApi,
    type Resource,
  } from "@/features/resources-launcher-admin/lib/core";

  let { row, onDone, onCancel }: {
    row: Resource | null;
    onDone: () => void;
    onCancel: () => void;
  } = $props();

  class EditorForm {
    label = $state("");
    icon = $state<string>(RESOURCE_ICON_NAMES[0]);
    url = $state("");
    group = $state("Links");
    order = $state("0");

    constructor(getResource: () => Resource | null) {
      const resource = getResource();
      this.label = resource?.label ?? "";
      this.icon = resource?.icon ?? RESOURCE_ICON_NAMES[0];
      this.url = resource?.url ?? "";
      this.group = resource?.group ?? "Links";
      this.order = String(resource?.order ?? 0);
    }
  }

  const form = new EditorForm(() => row);
  let busy = $state(false);
  let error = $state("");
  let valid = $derived(Boolean(form.label.trim() && form.url.trim()));

  async function save() {
    if (!valid || busy) return;
    busy = true;
    error = "";
    try {
      await resourcesApi.upsert({
        id: row?.id,
        label: form.label,
        icon: form.icon,
        url: form.url,
        group: form.group,
        order: Number(form.order) || 0,
      });
      onDone();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Unable to save resource.";
    } finally {
      busy = false;
    }
  }
</script>

<section class="mb-4 rounded-xl border border-border bg-muted/30 p-4" aria-label={row ? `Edit ${row.label}` : "Add resource"}>
  <div class="grid gap-3 sm:grid-cols-2">
    <label class="grid gap-1 text-xs font-medium text-muted-foreground">
      Label
      <input class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" bind:value={form.label} placeholder="Docs" />
    </label>
    <label class="grid gap-1 text-xs font-medium text-muted-foreground">
      Icon
      <select class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" bind:value={form.icon}>
        {#each RESOURCE_ICON_NAMES as name (name)}
          <option value={name}>{name}</option>
        {/each}
      </select>
    </label>
    <label class="grid gap-1 text-xs font-medium text-muted-foreground sm:col-span-2">
      URL
      <input class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" bind:value={form.url} placeholder="https:// or mailto:" />
    </label>
    <label class="grid gap-1 text-xs font-medium text-muted-foreground">
      Group
      <input class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" bind:value={form.group} placeholder="Links" />
    </label>
    <label class="grid gap-1 text-xs font-medium text-muted-foreground">
      Order
      <input class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" bind:value={form.order} type="number" inputmode="numeric" />
    </label>
  </div>
  {#if error}
    <p class="mt-3 text-xs text-destructive">{error}</p>
  {/if}
  <div class="mt-3 flex gap-2">
    <button type="button" class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50" onclick={() => void save()} disabled={!valid || busy}>{busy ? "Saving…" : "Save"}</button>
    <button type="button" class="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" onclick={onCancel}>Cancel</button>
  </div>
</section>
