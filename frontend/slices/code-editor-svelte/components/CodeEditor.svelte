<script lang="ts">
  import { onMount } from "svelte";
  import { createEditorContext, createEditorCore, type CodeEditorContext, type EditorSnapshot } from "../../code-editor/lib/editor-core";
  import { codeEditorTools } from "../../code-editor/lib/tools";
  import { baseName, langOf } from "../../code-editor/lib/util";
  import EditorSurface from "./EditorSurface.svelte";
  import FileTree from "./FileTree.svelte";
  import NewFilePanel from "./NewFilePanel.svelte";

  type RegisterTools = (collection: typeof codeEditorTools, ctx: CodeEditorContext) => void | (() => void);
  type Props = { payload?: unknown; registerTools?: RegisterTools };
  let { payload, registerTools }: Props = $props();

  const core = createEditorCore();
  const ctx = createEditorContext(core);
  let snapshot = $state<EditorSnapshot>(core.getSnapshot());
  let explorerOpen = $state(false);
  let newOpen = $state(false);
  let cursor = $state({ ln: 1, col: 1 });
  let active = $derived(snapshot.active);
  let value = $derived(active == null ? "" : (snapshot.buffers[active] ?? ""));
  let dirty = $derived(active != null && snapshot.buffers[active] !== snapshot.disk[active]);
  let lang = $derived(active ? langOf(active) : "txt");

  function payloadPath(input: unknown): string | null {
    if (!input || typeof input !== "object" || !("path" in input)) return null;
    const path = (input as { path?: unknown }).path;
    return typeof path === "string" && path.length ? path : null;
  }

  onMount(() => {
    const unsubscribe = core.subscribe(() => { snapshot = core.getSnapshot(); });
    const disposeTools = registerTools?.(codeEditorTools, ctx);
    const path = payloadPath(payload);
    path ? ctx.openPath(path) : ctx.open("/Projects/hello.ts");
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s" && ctx.active) {
        event.preventDefault();
        void ctx.save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unsubscribe();
      if (typeof disposeTools === "function") disposeTools();
      window.removeEventListener("keydown", onKey);
    };
  });
</script>

<div class="relative flex h-full min-h-[420px] overflow-hidden bg-[#1e1e22] text-[#d4d4d4]">
  <aside class="hidden w-56 shrink-0 border-r border-[#2a2a30] bg-[#16161a] md:block">
    <div class="border-b border-[#2a2a30] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#7d8590]">Explorer</div>
    <FileTree activePath={active} onOpenFile={(path) => ctx.open(path)} />
  </aside>

  {#if explorerOpen}
    <div class="absolute inset-0 z-20 bg-black/40 md:hidden" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) explorerOpen = false; }}>
      <aside class="h-full w-64 border-r border-[#2a2a30] bg-[#16161a]">
        <div class="flex items-center justify-between border-b border-[#2a2a30] px-3 py-2 text-xs text-[#9aa0aa]">
          <strong>Explorer</strong><button type="button" aria-label="Close explorer" onclick={() => { explorerOpen = false; }}>×</button>
        </div>
        <FileTree activePath={active} onOpenFile={(path) => { ctx.open(path); explorerOpen = false; }} />
      </aside>
    </div>
  {/if}

  <section class="flex min-w-0 flex-1 flex-col">
    <div class="flex min-h-9 items-stretch overflow-x-auto border-b border-[#2a2a30] bg-[#16161a]" role="tablist" aria-label="Open files">
      {#each snapshot.tabs as path (path)}
        <div class={`flex max-w-52 shrink-0 items-center gap-2 border-r border-[#2a2a30] px-3 text-xs ${path === active ? "border-t-2 border-t-primary bg-[#1e1e22] text-[#e6e6e6]" : "border-t-2 border-t-transparent text-[#9aa0aa]"}`}>
          <button type="button" role="tab" aria-selected={path === active} class="min-w-0 flex-1 truncate text-left" onclick={() => ctx.setActive(path)}>{baseName(path)}</button>
          <button type="button" aria-label={`Close ${baseName(path)}`} class="text-[#9aa0aa] hover:text-white" onclick={() => ctx.close(path)}>{snapshot.buffers[path] !== snapshot.disk[path] ? "●" : "×"}</button>
        </div>
      {/each}
      <button type="button" aria-label="New file" class="w-9 shrink-0 text-[#9aa0aa] hover:bg-white/5" onclick={() => { newOpen = true; }}>＋</button>
    </div>

    <header class="flex items-center gap-2 border-b border-[#2a2a30] bg-[#16161a] px-2 py-1.5">
      <button type="button" class="rounded px-2 py-1 text-xs text-[#9aa0aa] hover:bg-white/5 md:hidden" onclick={() => { explorerOpen = true; }}>Explorer</button>
      <span class="ml-auto rounded bg-[#2a2a30] px-2 py-1 font-mono text-[10px] uppercase text-[#b7bdc7]">{lang}</span>
      <button type="button" disabled={!active || !dirty} class="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40" onclick={() => void ctx.save()}>Save</button>
    </header>

    {#if active}
      <EditorSurface {value} {lang} onChange={ctx.edit} onCursor={(pos) => { cursor = pos; }} />
    {:else}
      <div class="grid flex-1 place-items-center text-center text-[#7d8590]">
        <div><div class="text-sm font-semibold text-[#c7ccd4]">No file open</div><p class="mt-1 text-xs">Open a file from Explorer or create one.</p></div>
      </div>
    {/if}

    <footer class="flex min-h-6 items-center gap-3 border-t border-[#2a2a30] bg-[#16161a] px-3 font-mono text-[11px] text-[#7d8590]">
      <span class="truncate">{active ?? "—"}</span>
      {#if active}<span class="ml-auto">Ln {cursor.ln}, Col {cursor.col}</span><span>Spaces: 2</span><span>{snapshot.saveState === "error" ? "Read-only · saved locally" : dirty ? "● Unsaved" : "Saved"}</span>{/if}
    </footer>
  </section>

  <NewFilePanel open={newOpen} onClose={() => { newOpen = false; }} onCreate={ctx.create} />
</div>
