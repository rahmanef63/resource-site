<script lang="ts">
  import {
    editablePageSnapshot,
    moveBlock,
    pageHref,
    removeBlock,
    replaceBlock,
  } from "../../pages-cms/lib/core";
  import { emptyBlock, type PageBlock, type PageBlockKind, type PageEntry } from "../../pages-cms/types";
  import { getPagesStore } from "../lib/context";
  import PageEditorBlocks from "./PageEditorBlocks.svelte";

  let { id, publicBase, adminBase }: { id: string; publicBase: string; adminBase: string } = $props();
  const store = getPagesStore();
  const page = $derived(store.pages.find((entry) => entry.id === id) ?? null);
  let draft = $state<PageEntry | null>(null);
  let loadedId = $state<string | null>(null);
  let addKind = $state<PageBlockKind>("hero");

  $effect(() => {
    if (!page) {
      draft = null;
      loadedId = null;
      return;
    }
    if (loadedId !== page.id) {
      draft = structuredClone(page);
      loadedId = page.id;
    }
  });

  const dirty = $derived(Boolean(draft && page && editablePageSnapshot(draft) !== editablePageSnapshot(page)));
  const patchDraft = (patch: Partial<PageEntry>) => {
    if (draft) draft = { ...draft, ...patch };
  };
  const patchBlock = (index: number, next: PageBlock) => {
    if (draft) draft = { ...draft, blocks: replaceBlock(draft.blocks, index, next) };
  };
  const deleteBlock = (index: number) => {
    if (draft) draft = { ...draft, blocks: removeBlock(draft.blocks, index) };
  };
  const addBlock = () => {
    if (draft) draft = { ...draft, blocks: [...draft.blocks, emptyBlock(addKind)] };
  };
  const moveDraftBlock = (from: number, to: number) => {
    if (draft) draft = { ...draft, blocks: moveBlock(draft.blocks, from, to) };
  };
  function save() {
    if (!draft) return;
    store.update(draft.id, {
      slug: draft.slug,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      blocks: draft.blocks,
    });
  }
</script>

{#if !page}
  <div class="space-y-3"><a class="text-xs text-muted-foreground" href={`${adminBase}/pages`}>← Pages</a><p class="text-sm text-muted-foreground">Page not found.</p></div>
{:else if page.systemPage}
  <div class="space-y-3"><a class="text-xs text-muted-foreground" href={`${adminBase}/pages`}>← Pages</a><div class="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm"><p class="font-medium">System page — read-only.</p><p class="mt-1 text-xs text-muted-foreground">Duplicate it from the Pages list to edit a custom copy.</p></div></div>
{:else if draft}
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <a class="text-xs text-muted-foreground hover:text-foreground" href={`${adminBase}/pages`}>← All pages</a>
      <div class="flex gap-2"><a class="rounded-md border px-3 py-2 text-xs" href={pageHref(publicBase, draft.slug)} target="_blank" rel="noreferrer">View public</a><button class="rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-40" type="button" disabled={!dirty} onclick={save}>Save{dirty ? " (unsaved)" : ""}</button></div>
    </div>

    <section class="rounded-lg border bg-card p-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1.5 text-xs"><span class="font-mono text-[10px] uppercase">Slug</span><input class="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs" value={draft.slug} oninput={(e) => patchDraft({ slug: e.currentTarget.value })} /><span class="block text-[10px] text-muted-foreground">Renders at {pageHref(publicBase, draft.slug)}</span></label>
        <label class="space-y-1.5 text-xs"><span>Title</span><input class="w-full rounded-md border bg-background px-3 py-2" value={draft.title} oninput={(e) => patchDraft({ title: e.currentTarget.value })} /></label>
        <label class="space-y-1.5 text-xs sm:col-span-2"><span>Description</span><textarea class="min-h-20 w-full rounded-md border bg-background px-3 py-2" value={draft.description} oninput={(e) => patchDraft({ description: e.currentTarget.value })}></textarea></label>
        <label class="space-y-1.5 text-xs"><span>Status</span><select class="w-full rounded-md border bg-background px-3 py-2" value={draft.status} onchange={(e) => patchDraft({ status: e.currentTarget.value as PageEntry["status"] })}><option value="draft">draft</option><option value="published">published</option></select></label>
        <div class="flex items-end gap-2">{#if draft.isLanding}<span class="rounded border px-2 py-1 text-[10px]">landing</span>{/if}{#if draft.duplicatedFrom}<span class="rounded border px-2 py-1 text-[10px]">duplicated from {draft.duplicatedFrom.slice(0, 12)}…</span>{/if}</div>
      </div>
    </section>

    <PageEditorBlocks
      blocks={draft.blocks}
      {addKind}
      setAddKind={(kind) => (addKind = kind)}
      onAdd={addBlock}
      onPatch={patchBlock}
      onRemove={deleteBlock}
      onMoveUp={(index) => moveDraftBlock(index, index - 1)}
      onMoveDown={(index) => moveDraftBlock(index, index + 1)}
    />
  </div>
{/if}
