<script lang="ts">
  import { createDialogDefaults, type CreateDialogMode } from "../../pages-cms/lib/core";

  let {
    dialog,
    onClose,
    onConfirm,
  }: {
    dialog: CreateDialogMode;
    onClose: () => void;
    onConfirm: (values: { slug: string; title: string }) => void;
  } = $props();

  let slug = $state("");
  let title = $state("");

  $effect(() => {
    const initial = createDialogDefaults(dialog);
    slug = initial.slug;
    title = initial.title;
  });
</script>

{#if dialog}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
    role="presentation"
    onclick={(event) => { if (event.target === event.currentTarget) onClose(); }}
  >
    <div
      class="w-full max-w-md rounded-xl border bg-background p-5 shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-dialog-title"
    >
      <h2 id="page-dialog-title" class="text-lg font-semibold">
        {dialog.mode === "dup" ? "Duplicate page" : "New page"}
      </h2>
      <p class="mt-1 text-xs text-muted-foreground">
        {dialog.mode === "dup"
          ? `Cloning “${dialog.source.title}”. Edit slug + title for the new copy.`
          : "Enter the new page slug + title."}
      </p>

      <div class="mt-4 space-y-3">
        <label class="block space-y-1.5 text-xs">
          <span>Slug</span>
          <input class="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs" bind:value={slug} />
          <span class="block text-[10px] text-muted-foreground">
            URL segment. Slashes are allowed for nesting.
          </span>
        </label>
        <label class="block space-y-1.5 text-xs">
          <span>Title</span>
          <input class="w-full rounded-md border bg-background px-3 py-2 text-sm" bind:value={title} />
        </label>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <button class="rounded-md border px-3 py-2 text-xs font-medium" type="button" onclick={onClose}>Cancel</button>
        <button
          class="rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50"
          type="button"
          disabled={!slug || !title}
          onclick={() => onConfirm({ slug, title })}
        >
          {dialog.mode === "dup" ? "Duplicate" : "Create"}
        </button>
      </div>
    </div>
  </div>
{/if}
