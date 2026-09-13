<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import StudioToolbar from "./components/StudioToolbar.svelte";
  import SavedPages from "./components/SavedPages.svelte";
  import StudioPane from "./components/StudioPane.svelte";
  import {
    DEVICE_NEXT,
    SPLIT_MIN,
    STARTER,
    htmlStudioApi,
    payloadSlug,
    shareUrl,
    type Device,
    type PageRow,
    type View,
    type Visibility,
  } from "@/features/html-studio/lib/core";

  let { payload = undefined }: { payload?: unknown } = $props();
  let html = $state(STARTER);
  let preview = $state(STARTER);
  let title = $state("Untitled");
  let slug = $state<string | null>(null);
  let visibility = $state<Visibility>("public");
  let rows = $state<PageRow[]>([]);
  let saving = $state(false);
  let listOpen = $state(false);
  let view = $state<View>("split");
  let device = $state<Device>("full");
  let bodyWidth = $state(0);
  let error = $state("");

  let narrow = $derived(bodyWidth > 0 && bodyWidth < SPLIT_MIN);
  let effectiveView = $derived<View>(narrow && view === "split" ? "preview" : view);
  let showEditor = $derived(effectiveView === "code" || effectiveView === "split");
  let showPreview = $derived(effectiveView === "preview" || effectiveView === "split");

  let previewTimer: ReturnType<typeof setTimeout> | undefined;

  function updateHtml(nextHtml: string) {
    html = nextHtml;
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      preview = nextHtml;
      previewTimer = undefined;
    }, 250);
  }

  onDestroy(() => {
    if (previewTimer) clearTimeout(previewTimer);
  });

  async function refreshList() {
    if (!htmlStudioApi.hasList) return;
    rows = await htmlStudioApi.list();
  }

  async function openPage(nextSlug: string) {
    const page = await htmlStudioApi.load(nextSlug);
    if (!page) return;
    html = page.html;
    preview = page.html;
    title = page.title;
    slug = page.slug;
    visibility = page.visibility;
    listOpen = false;
  }

  async function save() {
    if (!htmlStudioApi.canSave || saving) return;
    saving = true;
    error = "";
    try {
      const result = await htmlStudioApi.save({ slug: slug ?? undefined, title, html, visibility });
      slug = result.slug;
      await refreshList();
      await copyLink(result.slug);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Unable to save page.";
    } finally {
      saving = false;
    }
  }

  function newPage() {
    slug = null;
    title = "Untitled";
    html = STARTER;
    preview = STARTER;
    visibility = "public";
  }

  async function removePage(nextSlug: string) {
    await htmlStudioApi.remove(nextSlug);
    if (nextSlug === slug) newPage();
    await refreshList();
  }

  async function copyLink(nextSlug: string | null = slug) {
    if (!nextSlug || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(shareUrl(nextSlug));
    } catch {
      // Clipboard can be denied in embedded previews; publishing still succeeds.
    }
  }

  onMount(() => {
    void refreshList();
    const initialSlug = payloadSlug(payload);
    if (initialSlug) void openPage(initialSlug);
  });
</script>

<div class="relative flex h-full flex-col bg-background text-foreground">
  <StudioToolbar
    bind:title
    bind:view
    bind:visibility
    {narrow}
    {saving}
    canSave={htmlStudioApi.canSave}
    hasList={htmlStudioApi.hasList}
    {listOpen}
    rowCount={rows.length}
    {slug}
    onNew={newPage}
    onToggleList={() => { listOpen = !listOpen; void refreshList(); }}
    onSave={() => void save()}
    onCopy={() => void copyLink()}
  />

  {#if slug}
    <button type="button" class="flex shrink-0 items-center gap-2 border-b border-border bg-muted/40 px-3 py-1 text-left text-[11px] text-muted-foreground" onclick={() => void copyLink()}>
      <span class="truncate font-mono">{shareUrl(slug)}</span>
      {#if visibility === "private"}<span class="rounded bg-muted px-1 text-[10px]">private</span>{/if}
    </button>
  {/if}

  {#if error}
    <p class="border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
  {/if}

  <div class="flex min-h-0 flex-1">
    {#if listOpen && htmlStudioApi.hasList}
      <SavedPages {rows} {slug} onOpen={(value) => void openPage(value)} onRemove={(value) => void removePage(value)} />
    {/if}
    <div class="flex min-h-0 min-w-0 flex-1" bind:clientWidth={bodyWidth}>
      <StudioPane
        {html}
        onHtmlChange={updateHtml}
        {preview}
        {showEditor}
        {showPreview}
        {device}
        onCycleDevice={() => (device = DEVICE_NEXT[device])}
      />
    </div>
  </div>
</div>
