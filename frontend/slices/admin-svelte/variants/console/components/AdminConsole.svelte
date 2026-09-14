<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import {
    ADMIN_CONSOLE_SECTIONS,
    type AdminAccess,
    type AdminConsoleSection,
    type AdminTier,
  } from "@/features/admin/variants/console/lib/sections";
  import {
    canSeeAdmin,
    filterSections,
  } from "@/features/admin/variants/console/lib/access";
  import {
    groupSections,
    normalizeActiveSection,
    readSectionFromSearch,
    sectionHref,
  } from "@/features/admin/variants/console/lib/section-core";
  import AnalyticsDashboard from "./sections/AnalyticsDashboard.svelte";
  import AuditLogViewer from "./sections/AuditLogViewer.svelte";
  import LeadsInbox from "./sections/LeadsInbox.svelte";
  import NavConfigManager from "./sections/NavConfigManager.svelte";
  import SeoHealthPanel from "./sections/SeoHealthPanel.svelte";

  export type AdminPanelMap = Record<string, Snippet>;

  type Props = {
    access: AdminAccess;
    tier?: AdminTier;
    sections?: readonly AdminConsoleSection[];
    panels?: AdminPanelMap;
    activeId?: string;
    onNavigate?: (id: string) => void;
    header?: Snippet;
    nav?: boolean;
  };

  let {
    access,
    tier = "org",
    sections = ADMIN_CONSOLE_SECTIONS,
    panels = {},
    activeId,
    onNavigate,
    header,
    nav = true,
  }: Props = $props();

  let visible = $derived(filterSections(sections, access, tier));
  let internalActive = $state("");
  let active = $derived(activeId ?? normalizeActiveSection(visible, internalActive));
  let section = $derived(visible.find((item) => item.id === active));
  let groups = $derived(groupSections(visible));
  let injected = $derived(section ? panels[section.id] : undefined);

  $effect(() => {
    if (activeId !== undefined) return;
    const next = normalizeActiveSection(visible, internalActive);
    if (next !== internalActive) internalActive = next;
  });

  onMount(() => {
    if (activeId === undefined) {
      internalActive = normalizeActiveSection(
        visible,
        readSectionFromSearch(window.location.search),
      );
    }
    const onPop = () => {
      if (activeId !== undefined) return;
      internalActive = normalizeActiveSection(
        visible,
        readSectionFromSearch(window.location.search),
      );
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });

  function go(id: string) {
    onNavigate?.(id);
    if (activeId !== undefined) return;
    internalActive = id;
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", sectionHref(window.location.href, id));
    }
  }
</script>

{#snippet body()}
  <main class="min-w-0 overflow-y-auto p-4">
    {#if section || header}
      <div class="mb-4 flex items-center justify-between gap-2">
        <h2 class="text-lg font-semibold tracking-tight">{section?.label ?? "Admin"}</h2>
        {#if header}{@render header()}{/if}
      </div>
    {/if}

    {#if !section}
      <p class="text-sm text-muted-foreground">Select a section.</p>
    {:else if injected}
      {@render injected()}
    {:else if section.id === "analytics"}
      <AnalyticsDashboard />
    {:else if section.id === "audit-log"}
      <AuditLogViewer />
    {:else if section.id === "nav-config"}
      <NavConfigManager />
    {:else if section.id === "seo-health"}
      <SeoHealthPanel />
    {:else if section.id === "leads"}
      <LeadsInbox />
    {:else}
      <div class="rounded-lg border border-dashed p-8 text-center">
        <p class="text-sm font-medium">{section.label} not mounted</p>
        <p class="mt-1 text-xs text-muted-foreground">
          Install the <code>{section.provider}</code> slice and pass a Svelte snippet via
          <code>panels["{section.id}"]</code>.
        </p>
      </div>
    {/if}
  </main>
{/snippet}

{#if access.isLoading}
  <div class="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
{:else if !canSeeAdmin(access)}
  <div class="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
    <p class="text-sm font-medium">Admin console unavailable</p>
    <p class="max-w-md text-xs text-muted-foreground">
      You don't have admin access. Ask an owner to grant a permission, or configure
      <code>PLATFORM_ADMIN_EMAILS</code> on the backend.
    </p>
  </div>
{:else if !nav}
  {@render body()}
{:else}
  <div class="grid h-full w-full min-w-0 grid-cols-[220px_minmax(0,1fr)]">
    <nav class="overflow-y-auto border-r bg-muted/30 p-2" aria-label="Admin sections">
      {#each groups as group (group.id)}
        <div class="mb-3">
          <p class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{group.id}</p>
          {#each group.items as item (item.id)}
            <button
              type="button"
              class={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${item.id === active ? "bg-accent font-medium" : "hover:bg-accent/60"}`}
              aria-current={item.id === active ? "page" : undefined}
              onclick={() => go(item.id)}
            >
              <span class="grid size-5 shrink-0 place-items-center rounded bg-muted text-[10px]" title={item.icon}>{item.label.slice(0, 1)}</span>
              <span class="min-w-0 flex-1 truncate">{item.label}</span>
              {#if item.provider === "self"}<span class="rounded-full border px-1 text-[9px]">new</span>{/if}
            </button>
          {/each}
        </div>
      {/each}
    </nav>
    {@render body()}
  </div>
{/if}
