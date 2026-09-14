<script lang="ts">
  import { untrack } from "svelte";
  import {
    MOCK_LEADS,
    type Lead,
    type LeadStatus,
  } from "@/features/admin/variants/console/lib/mock";

  const STATUSES: LeadStatus[] = ["new", "open", "won", "lost"];

  type Props = {
    leads?: Lead[];
    onUpdateStatus?: (id: string, status: LeadStatus) => void;
    onAddNote?: (id: string, note: string) => void;
  };

  let {
    leads = MOCK_LEADS,
    onUpdateStatus,
    onAddNote,
  }: Props = $props();

  let list = $state<Lead[]>(untrack(() => leads.map((lead) => ({ ...lead, notes: [...lead.notes] }))));
  let activeId = $state<string | null>(null);
  let note = $state("");
  let active = $derived(list.find((lead) => lead.id === activeId) ?? null);

  function setStatus(id: string, status: LeadStatus) {
    list = list.map((lead) => (lead.id === id ? { ...lead, status } : lead));
    onUpdateStatus?.(id, status);
  }

  function addNote() {
    const text = note.trim();
    if (!active || !text) return;
    list = list.map((lead) =>
      lead.id === active.id ? { ...lead, notes: [...lead.notes, text] } : lead,
    );
    onAddNote?.(active.id, text);
    note = "";
  }
</script>

<div class="space-y-3">
  <div class="overflow-x-auto rounded-md border">
    <table class="w-full text-sm">
      <thead class="border-b bg-muted/40 text-left text-xs text-muted-foreground">
        <tr><th class="p-3">Name</th><th>Source</th><th>Status</th><th class="w-16"></th></tr>
      </thead>
      <tbody>
        {#each list as lead (lead.id)}
          <tr class="border-b last:border-0">
            <td class="p-3"><div class="font-medium">{lead.name}</div><div class="text-xs text-muted-foreground">{lead.email}</div></td>
            <td><span class="rounded-full border px-2 py-0.5 text-xs">{lead.source}</span></td>
            <td>
              <select
                class="h-8 rounded-md border bg-background px-2 text-sm"
                value={lead.status}
                onchange={(event) => setStatus(lead.id, event.currentTarget.value as LeadStatus)}
                aria-label={`Status for ${lead.name}`}
              >
                {#each STATUSES as status}
                  <option value={status}>{status}</option>
                {/each}
              </select>
            </td>
            <td><button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-accent" onclick={() => (activeId = lead.id)}>Open</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if active}
    <aside class="rounded-xl border bg-card p-4 shadow-sm" aria-label="Lead details">
      <div class="flex items-start justify-between gap-3">
        <div><h3 class="font-semibold">{active.name}</h3><p class="text-xs text-muted-foreground">{active.email}</p></div>
        <button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-accent" onclick={() => (activeId = null)}>Close</button>
      </div>
      <p class="mt-4 rounded bg-muted p-3 text-sm">{active.message}</p>
      <div class="mt-4 space-y-2">
        <p class="text-xs font-medium text-muted-foreground">Notes</p>
        {#each active.notes as existing, index (`${active.id}-${index}`)}
          <p class="rounded border px-2 py-1 text-sm">{existing}</p>
        {:else}
          <p class="text-sm text-muted-foreground">No notes yet.</p>
        {/each}
      </div>
      <div class="mt-4 space-y-2">
        <label class="block"><span class="sr-only">Add lead note</span><textarea bind:value={note} class="min-h-20 w-full rounded-md border bg-background p-2 text-sm" placeholder="Add a note…"></textarea></label>
        <button type="button" class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={!note.trim()} onclick={addNote}>Add note</button>
      </div>
    </aside>
  {/if}
</div>
