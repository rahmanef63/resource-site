<script lang="ts">
  import { untrack } from "svelte";
  import {
    MOCK_NAV,
    type NavItem,
  } from "@/features/admin/variants/console/lib/mock";

  let { items = MOCK_NAV, onChange }: {
    items?: NavItem[];
    onChange?: (items: NavItem[]) => void;
  } = $props();

  let list = $state<NavItem[]>(untrack(() => [...items].sort((a, b) => a.order - b.order)));

  function commit(next: NavItem[]) {
    list = next.map((item, order) => ({ ...item, order }));
    onChange?.(list);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  function patch(id: string, changes: Partial<NavItem>) {
    commit(list.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  function add() {
    commit([...list, { id: `n${Date.now()}`, label: "New link", href: "/", order: list.length, visible: true }]);
  }
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between gap-3">
    <p class="text-sm text-muted-foreground">{list.length} navigation items</p>
    <button type="button" class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onclick={add}>Add</button>
  </div>

  {#each list as item, index (item.id)}
    <div class="grid gap-2 rounded-xl border bg-card p-2 shadow-sm sm:grid-cols-[auto_1fr_1fr_auto_auto] sm:items-center">
      <div class="flex gap-1 sm:flex-col">
        <button type="button" class="rounded px-2 py-1 hover:bg-accent disabled:opacity-40" disabled={index === 0} onclick={() => move(index, -1)} aria-label={`Move ${item.label} up`}>↑</button>
        <button type="button" class="rounded px-2 py-1 hover:bg-accent disabled:opacity-40" disabled={index === list.length - 1} onclick={() => move(index, 1)} aria-label={`Move ${item.label} down`}>↓</button>
      </div>
      <label><span class="sr-only">Label</span><input class="h-9 w-full rounded-md border bg-background px-2 text-sm" value={item.label} oninput={(event) => patch(item.id, { label: event.currentTarget.value })} /></label>
      <label><span class="sr-only">Path</span><input class="h-9 w-full rounded-md border bg-background px-2 font-mono text-xs" value={item.href} oninput={(event) => patch(item.id, { href: event.currentTarget.value })} /></label>
      <button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-accent" onclick={() => patch(item.id, { visible: !item.visible })}>{item.visible ? "Visible" : "Hidden"}</button>
      <button type="button" class="rounded-md px-2 py-1 text-xs text-destructive hover:bg-accent" onclick={() => commit(list.filter((entry) => entry.id !== item.id))}>Delete</button>
    </div>
  {/each}
</div>
