<script lang="ts">
  import {
    blankSection,
    LANDING_KIND_LABEL,
    moveLandingSection,
    sortedLandingSections,
    visibleLandingCount,
    type LandingStore,
  } from "../../sections/lib/core";
  import { useLandingStore } from "../lib/context";

  type Props = { store?: LandingStore; onEdit?: (id: string) => void };
  let { store, onEdit }: Props = $props();
  let contextual: (() => LandingStore) | undefined;
  try { contextual = useLandingStore(); } catch { contextual = undefined; }
  let resolved = $derived(store ?? contextual?.());
  let items = $derived(resolved ? sortedLandingSections(resolved.items) : []);
  let visible = $derived(visibleLandingCount(items));

  function requireStore(): LandingStore {
    if (!resolved) throw new Error("LandingView requires a store prop or LandingProvider.");
    return resolved;
  }

  function createSection() {
    const current = requireStore();
    const next = blankSection(items.at(-1)?.order ?? 0);
    current.create(next);
    onEdit?.(next.id);
  }
</script>

{#if resolved}
  <section class="space-y-4">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Landing</p>
        <h2 class="text-xl font-semibold tracking-tight">Landing sections</h2>
        <p class="mt-1 text-sm text-muted-foreground">{visible}/{items.length} sections visible</p>
      </div>
      <div class="flex gap-2">
        <a class="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted" href={resolved.publicBase}>View public</a>
        <button class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" type="button" onclick={createSection}>New section</button>
      </div>
    </header>

    <div class="overflow-x-auto rounded-lg border">
      <table class="w-full min-w-[680px] text-sm">
        <thead class="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr><th class="p-3">Title</th><th class="p-3">Kind</th><th class="p-3">#</th><th class="p-3">Visible</th><th class="p-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {#each items as item, index (item.id)}
            <tr class="border-t">
              <td class="p-3"><div class="font-medium">{item.title}</div><div class="max-w-sm truncate text-xs text-muted-foreground">{item.subtitle ?? ""}</div></td>
              <td class="p-3"><span class="rounded-full border px-2 py-1 text-xs">{LANDING_KIND_LABEL[item.kind]}</span></td>
              <td class="p-3 font-mono text-xs">{String(item.order).padStart(2, "0")}</td>
              <td class="p-3"><button type="button" class="rounded-full border px-2 py-1 text-xs" onclick={() => resolved?.update(item.id, { enabled: !item.enabled })}>{item.enabled ? "on" : "off"}</button></td>
              <td class="p-3"><div class="flex justify-end gap-1">
                <button type="button" aria-label={`Move ${item.title} up`} disabled={index === 0} class="rounded border px-2 py-1 disabled:opacity-30" onclick={() => moveLandingSection(requireStore(), item.id, -1)}>↑</button>
                <button type="button" aria-label={`Move ${item.title} down`} disabled={index === items.length - 1} class="rounded border px-2 py-1 disabled:opacity-30" onclick={() => moveLandingSection(requireStore(), item.id, 1)}>↓</button>
                {#if onEdit}<button type="button" class="rounded border px-2 py-1" onclick={() => onEdit?.(item.id)}>Edit</button>{:else}<a class="rounded border px-2 py-1" href={`${resolved.adminBase}/landing/${item.id}`}>Edit</a>{/if}
                <button type="button" class="rounded border px-2 py-1 text-destructive" onclick={() => resolved?.remove(item.id)}>Delete</button>
              </div></td>
            </tr>
          {:else}
            <tr><td class="p-8 text-center text-muted-foreground" colspan="5">No landing sections yet.</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{/if}
