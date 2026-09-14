<script lang="ts">
  import { LANDING_FIELDS_CORE } from "../../sections/lib/fields";
  import { blankSection, type LandingStore } from "../../sections/lib/core";
  import type { LandingSection } from "../../sections/types";
  import { useLandingStore } from "../lib/context";

  type Props = { id: string; store?: LandingStore; onSaved?: (id: string) => void; onBack?: () => void };
  let { id, store, onSaved, onBack }: Props = $props();
  let contextual: (() => LandingStore) | undefined;
  try { contextual = useLandingStore(); } catch { contextual = undefined; }
  let resolved = $derived(store ?? contextual?.());
  let draft = $state<LandingSection | null>(null);
  let loadedKey = $state("");

  $effect(() => {
    if (!resolved) return;
    const key = `${id}:${resolved.items.map((item) => `${item.id}:${item.order}`).join("|")}`;
    if (loadedKey === key) return;
    const existing = resolved.items.find((item) => item.id === id);
    draft = structuredClone(existing ?? blankSection(resolved.items.at(-1)?.order ?? 0, id === "new" ? undefined : id));
    loadedKey = key;
  });

  function setField(key: keyof LandingSection, value: unknown) {
    if (!draft) return;
    draft = { ...draft, [key]: value } as LandingSection;
  }

  function save() {
    if (!resolved || !draft) return;
    const exists = resolved.items.some((item) => item.id === draft?.id);
    if (exists) {
      const { id: _id, ...patch } = draft;
      resolved.update(draft.id, patch);
    } else resolved.create(draft);
    onSaved?.(draft.id);
  }
</script>

{#if resolved && draft}
  <section class="mx-auto max-w-3xl space-y-5">
    <header class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Landing section</p>
        <h2 class="text-xl font-semibold tracking-tight">{draft.title || "New section"}</h2>
      </div>
      {#if onBack}<button type="button" class="rounded border px-3 py-2 text-sm" onclick={onBack}>Back</button>{:else}<a class="rounded border px-3 py-2 text-sm" href={`${resolved.adminBase}/landing`}>Back</a>{/if}
    </header>

    <div class="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
      {#each LANDING_FIELDS_CORE as field (field.key)}
        <label class={(field.kind === "textarea" || field.wide) ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
          <span class="text-sm font-medium">{field.label}</span>
          {#if field.kind === "switch"}
            <input type="checkbox" checked={Boolean(draft[field.key])} onchange={(event) => setField(field.key, event.currentTarget.checked)} />
          {:else if field.kind === "select"}
            <select class="w-full rounded-md border bg-background px-3 py-2 text-sm" value={String(draft[field.key] ?? "")} onchange={(event) => setField(field.key, event.currentTarget.value)}>
              {#each field.options as option (option.value)}<option value={option.value}>{option.label}</option>{/each}
            </select>
          {:else if field.kind === "position"}
            <select class="w-full rounded-md border bg-background px-3 py-2 text-sm" value={draft.order} onchange={(event) => setField("order", Number(event.currentTarget.value))}>
              {#each Array.from({ length: Math.max(1, resolved.items.length + (resolved.items.some((item) => item.id === draft?.id) ? 0 : 1)) }, (_, i) => i + 1) as position}
                <option value={position}>{position}</option>
              {/each}
            </select>
          {:else if field.kind === "textarea"}
            <textarea rows={field.rows ?? 3} class={`w-full rounded-md border bg-background px-3 py-2 text-sm ${field.mono ? "font-mono" : ""}`} placeholder={field.placeholder ?? ""} value={String(draft[field.key] ?? "")} oninput={(event) => setField(field.key, event.currentTarget.value)}></textarea>
          {:else}
            <input class={`w-full rounded-md border bg-background px-3 py-2 text-sm ${field.mono ? "font-mono" : ""}`} placeholder={field.placeholder ?? ""} value={String(draft[field.key] ?? "")} oninput={(event) => setField(field.key, event.currentTarget.value)} />
          {/if}
          {#if field.hint}<span class="block text-xs text-muted-foreground">{field.hint}</span>{/if}
        </label>
      {/each}
    </div>

    <footer class="flex justify-between gap-3">
      {#if resolved.items.some((item) => item.id === draft?.id)}<button type="button" class="rounded-md border px-4 py-2 text-sm text-destructive" onclick={() => resolved?.remove(draft!.id)}>Delete</button>{:else}<span></span>{/if}
      <button type="button" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" onclick={save}>Save section</button>
    </footer>
  </section>
{/if}
