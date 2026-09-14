<script lang="ts">
  import { blankPage, duplicatePage } from "../../pages-cms/lib/duplicate";
  import {
    orderPagesForAdmin,
    pageHref,
    type CreateDialogMode,
  } from "../../pages-cms/lib/core";
  import type { PageEntry } from "../../pages-cms/types";
  import { getPagesStore } from "../lib/context";
  import PageCreateDialog from "./PageCreateDialog.svelte";

  let { publicBase, adminBase }: { publicBase: string; adminBase: string } = $props();
  const store = getPagesStore();
  let dialog = $state<CreateDialogMode>(null);
  const ordered = $derived(orderPagesForAdmin(store.pages));
  const systemCount = $derived(store.pages.filter((page) => page.systemPage).length);

  function removePage(page: PageEntry) {
    if (page.systemPage) return;
    if (typeof window === "undefined" || window.confirm(`Delete page “${page.title}”?`)) {
      store.remove(page.id);
    }
  }

  function confirmCreate(values: { slug: string; title: string }) {
    const next = dialog?.mode === "dup"
      ? duplicatePage(dialog.source, values)
      : { ...blankPage(values.slug), title: values.title };
    store.create(next);
    dialog = null;
    if (typeof window !== "undefined") window.location.href = `${adminBase}/pages/${next.id}`;
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between gap-2">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Pages</h1>
      <p class="text-xs text-muted-foreground">
        {store.pages.length} total · {systemCount} system · {store.pages.length - systemCount} custom
      </p>
    </div>
    <button class="rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background" type="button" onclick={() => (dialog = { mode: "new" })}>
      + New page
    </button>
  </div>

  <div class="overflow-x-auto rounded-lg border bg-card">
    <table class="w-full text-left text-xs">
      <thead class="border-b text-muted-foreground">
        <tr><th class="p-3">Slug</th><th class="p-3">Title</th><th class="p-3">Status</th><th class="p-3">Type</th><th class="p-3 text-right">Actions</th></tr>
      </thead>
      <tbody>
        {#each ordered as page (page.id)}
          <tr class="border-b last:border-b-0">
            <td class="p-3 font-mono">{page.slug || "/"}</td>
            <td class="p-3"><div class="font-medium">{page.title}</div>{#if page.description}<div class="max-w-sm truncate text-muted-foreground">{page.description}</div>{/if}</td>
            <td class="p-3"><span class="rounded border px-2 py-1 text-[10px]">{page.status}</span></td>
            <td class="p-3"><span class="rounded border px-2 py-1 text-[10px]">{page.systemPage ? "system" : "custom"}</span></td>
            <td class="p-3"><div class="flex justify-end gap-1">
              <a class="rounded px-2 py-1 hover:bg-muted" href={pageHref(publicBase, page.slug)} target="_blank" rel="noreferrer">View</a>
              {#if page.systemPage}
                <button class="rounded px-2 py-1 opacity-40" type="button" disabled>Edit</button>
              {:else}
                <a class="rounded px-2 py-1 hover:bg-muted" href={`${adminBase}/pages/${page.id}`}>Edit</a>
              {/if}
              <button class="rounded px-2 py-1 hover:bg-muted" type="button" onclick={() => (dialog = { mode: "dup", source: page })}>Duplicate</button>
              <button class="rounded px-2 py-1 text-destructive hover:bg-muted disabled:opacity-40" type="button" disabled={page.systemPage} onclick={() => removePage(page)}>Delete</button>
            </div></td>
          </tr>
        {:else}
          <tr><td colspan="5" class="p-8 text-center text-muted-foreground">No pages yet. Create the first page.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<PageCreateDialog {dialog} onClose={() => (dialog = null)} onConfirm={confirmCreate} />
