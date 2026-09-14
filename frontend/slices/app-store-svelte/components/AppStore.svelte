<script lang="ts">
  import { onMount } from "svelte";
  import {
    getAppsSnapshot,
    setInstalled,
    subscribeApps,
    type AppRow,
  } from "../../app-store/lib/apps-core";
  import {
    getDisabledSnapshot,
    setEnabled,
    subscribeDisabled,
  } from "../../app-store/lib/enabled-core";
  import { glyphSymbol } from "../../app-store/lib/glyph-core";
  import {
    CATEGORIES,
    FEATURED_ID,
    mergeCatalog,
    type CatalogApp,
    type StoreCategory,
  } from "../../app-store/lib/store-catalog";
  import {
    SYSTEM_CATALOG_CORE,
    systemGlyphSymbol,
    type SystemEntryCore,
  } from "../../app-store/lib/system-catalog-core";
  import { appStoreTools, type AppStoreCtx } from "../../app-store/lib/tools";

  type StoreFilter = "Featured" | StoreCategory | "Apps" | "Features";
  type Props = {
    registerTools?: (
      collection: typeof appStoreTools,
      getCtx: () => AppStoreCtx,
    ) => void | (() => void);
  };

  let { registerTools }: Props = $props();
  let rows = $state<AppRow[]>([]);
  let disabled = $state<string[]>([]);
  let query = $state("");
  let filter = $state<StoreFilter>("Featured");
  let busy = $state<string | null>(null);

  let catalog = $derived(mergeCatalog(rows));
  let off = $derived(new Set(disabled));
  let isSystem = $derived(filter === "Apps" || filter === "Features");
  let normalizedQuery = $derived(query.trim().toLowerCase());
  let list = $derived(
    catalog.filter((app) => {
      if (filter !== "Featured" && app.category !== filter) return false;
      if (!normalizedQuery) return true;
      return app.title.toLowerCase().includes(normalizedQuery) || app.desc.toLowerCase().includes(normalizedQuery);
    }),
  );
  let systemList = $derived(
    SYSTEM_CATALOG_CORE.filter((entry) => {
      const kind = filter === "Features" ? "feature" : "app";
      return entry.kind === kind && (!normalizedQuery || entry.title.toLowerCase().includes(normalizedQuery) || entry.desc.toLowerCase().includes(normalizedQuery));
    }),
  );
  let featured = $derived(catalog.find((app) => app.appId === FEATURED_ID) ?? catalog[0]);
  let count = $derived(isSystem ? systemList.length : list.length);

  onMount(() => {
    rows = getAppsSnapshot();
    disabled = getDisabledSnapshot();
    const stopApps = subscribeApps(() => (rows = getAppsSnapshot()));
    const stopDisabled = subscribeDisabled(() => (disabled = getDisabledSnapshot()));
    const stopTools = registerTools?.(appStoreTools, () => ({ apps: getAppsSnapshot() }));
    return () => {
      stopApps();
      stopDisabled();
      stopTools?.();
    };
  });

  async function toggle(app: CatalogApp) {
    busy = app.appId;
    try {
      setInstalled({ appId: app.appId, installed: !app.installed, title: app.title, glyph: app.glyph, gradient: app.gradient, runtime: app.runtime, entry: app.entry });
    } finally {
      busy = null;
    }
  }

  const toggleSystem = (entry: SystemEntryCore) => setEnabled(entry.id, off.has(entry.id));
  const filters: StoreFilter[] = ["Featured", ...CATEGORIES, "Apps", "Features"];
</script>

<div class="flex h-full min-h-0 bg-background text-foreground">
  <aside class="hidden w-44 shrink-0 border-r border-border p-3 sm:block">
    <p class="mb-2 px-2 text-xs font-semibold">App Store</p>
    <nav class="space-y-1" aria-label="Store filters">
      {#each filters as item}
        <button class="w-full rounded-md px-2 py-2 text-left text-xs {filter === item ? 'bg-secondary font-medium' : 'text-muted-foreground hover:bg-secondary/60'}" onclick={() => (filter = item)}>{item}</button>
      {/each}
    </nav>
  </aside>

  <section class="flex min-w-0 flex-1 flex-col">
    <header class="space-y-3 border-b border-border p-4">
      <div class="flex items-center gap-2">
        <span aria-hidden="true">▦</span>
        <h2 class="text-sm font-semibold">App Store</h2>
        <span class="ml-auto text-[11px] text-muted-foreground">{count} {isSystem ? (filter === "Features" ? "features" : "apps") : "apps"}</span>
      </div>
      <input class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" bind:value={query} placeholder={isSystem ? `Search ${filter.toLowerCase()}` : "Search apps"} aria-label="Search apps" />
      <div class="flex gap-1 overflow-x-auto sm:hidden">
        {#each filters as item}
          <button class="whitespace-nowrap rounded-full border px-3 py-1 text-xs {filter === item ? 'bg-foreground text-background' : 'bg-background'}" onclick={() => (filter = item)}>{item}</button>
        {/each}
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-auto p-4">
      {#if isSystem}
        <p class="mb-3 text-xs text-muted-foreground">Optional {filter === "Features" ? "system features" : "apps"}. Disabled items disappear from host navigation until re-enabled.</p>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {#each systemList as entry (entry.id)}
            <article class="flex gap-3 rounded-lg border bg-card p-3.5">
              <div class="grid size-12 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white" style:background={entry.gradient}>{systemGlyphSymbol(entry.glyph)}</div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <div><h3 class="text-sm font-semibold">{entry.title}</h3><p class="text-[10px] uppercase text-muted-foreground">{entry.kind}</p></div>
                  <button class="rounded-md border px-2.5 py-1 text-xs" disabled={entry.required} onclick={() => toggleSystem(entry)}>{entry.required ? "Required" : off.has(entry.id) ? "Install" : "Installed"}</button>
                </div>
                <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{entry.desc}</p>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        {#if filter === "Featured" && featured && !query}
          <article class="mb-4 rounded-xl border bg-card p-5">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Featured</p>
            <div class="mt-2 flex items-center gap-4">
              <div class="grid size-14 place-items-center rounded-xl text-white" style:background={featured.gradient}>{glyphSymbol(featured.glyph)}</div>
              <div class="min-w-0 flex-1"><h3 class="font-semibold">{featured.title}</h3><p class="text-sm text-muted-foreground">{featured.desc}</p></div>
              <button class="rounded-md border px-3 py-1.5 text-sm" disabled={busy === featured.appId} onclick={() => toggle(featured)}>{featured.installed ? "Installed" : "Get"}</button>
            </div>
          </article>
        {/if}
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {#each list as app (app.appId)}
            <article class="flex gap-3 rounded-lg border bg-card p-3.5">
              <div class="grid size-12 shrink-0 place-items-center rounded-xl text-white" style:background={app.gradient}>{glyphSymbol(app.glyph)}</div>
              <div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><div><h3 class="text-sm font-semibold">{app.title}</h3><p class="text-[10px] uppercase text-muted-foreground">{app.category} · {app.runtime}</p></div><button class="rounded-md border px-2.5 py-1 text-xs" disabled={busy === app.appId} onclick={() => toggle(app)}>{app.installed ? "Uninstall" : "Get"}</button></div><p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{app.desc}</p></div>
            </article>
          {:else}
            <p class="col-span-full py-10 text-center text-sm text-muted-foreground">No apps match “{query}”.</p>
          {/each}
        </div>
      {/if}
    </div>
  </section>
</div>
