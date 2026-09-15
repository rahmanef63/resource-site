<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { createMockAdapter } from "@/features/file-explorer/adapter/mock";
  import type { FileExplorerAdapter, FsEntry, FsRoot, FsUsage, UploadFile } from "@/features/file-explorer/adapter/types";
  import { createFsHistory } from "@/features/file-explorer/lib/history-core";
  import { createFileOperations, TRASH_PATH } from "@/features/file-explorer/lib/ops-core";
  import { joinPath, uniqueName } from "@/features/file-explorer/lib/format";
  import { previewKind } from "@/features/file-explorer/lib/file-kinds";
  import { readDropEntries } from "@/features/file-explorer/lib/read-drop";
  import { sortEntries, type Clipboard, type SortKey, type ViewMode } from "@/features/file-explorer/lib/types";
  import { fileExplorerTools, type FileExplorerCtx } from "@/features/file-explorer/lib/tools";
  import Toolbar from "./Toolbar.svelte";
  import Sidebar from "./Sidebar.svelte";
  import EntryList from "./EntryList.svelte";
  import PreviewModal from "./PreviewModal.svelte";
  import PropertiesModal from "./PropertiesModal.svelte";
  import ContextMenu from "./ContextMenu.svelte";

  type Target = { path: string; entry: FsEntry };
  type RegisterTools = (collection: typeof fileExplorerTools, context: FileExplorerCtx) => void | (() => void);

  let { adapter = undefined, initialPath = "/", rootLabel = "Files", onOpenFile = undefined, registerTools = undefined } = $props<{
    adapter?: FileExplorerAdapter; initialPath?: string; rootLabel?: string;
    onOpenFile?: (path: string, entry: FsEntry) => void; registerTools?: RegisterTools;
  }>();
  const history = createFsHistory(untrack(() => initialPath));
  let nav = $state(history.getSnapshot());
  let activeAdapter = $state<FileExplorerAdapter | null>(untrack(() => adapter ?? null));
  let entries = $state<FsEntry[] | null>(null);
  let roots = $state<FsRoot[]>([]);
  let usage = $state<FsUsage | null>(null);
  let selected = $state<string[]>([]);
  let lastIndex = $state<number | null>(null);
  let clipboard = $state<Clipboard | null>(null);
  let view = $state<ViewMode>("grid");
  let sort = $state<SortKey>("name");
  let notice = $state("");
  let preview = $state<Target | null>(null);
  let properties = $state<Target | null>(null);
  let menu = $state<{ x: number; y: number; entry: FsEntry } | null>(null);
  let uploadInput: HTMLInputElement | undefined;
  let loadSeq = 0;
  let sorted = $derived(sortEntries(entries ?? [], sort));
  let selectedEntry = $derived(entries?.find((e) => e.name === selected[0]) ?? null);
  let readonly = $derived(activeAdapter?.mode === "readonly");

  function attachUploadInput(node: HTMLInputElement) { uploadInput = node; return () => { if (uploadInput === node) uploadInput = undefined; }; }
  function requireAdapter() { if (!activeAdapter) throw new Error("File Explorer adapter is not ready"); return activeAdapter; }
  async function load(path = nav.path) {
    const current = activeAdapter; if (!current) return;
    const token = ++loadSeq; entries = null; notice = "";
    try {
      const result = await current.list(path);
      if (token !== loadSeq) return;
      entries = result.entries; if (result.roots?.length) roots = result.roots;
      usage = await current.usage().catch(() => usage);
    } catch (cause) { if (token === loadSeq) { entries = []; notice = cause instanceof Error ? cause.message : String(cause); } }
  }
  function navigate(path: string) { history.navigate(path); nav = history.getSnapshot(); selected = []; lastIndex = null; void load(path); }
  function back() { history.goBack(); nav = history.getSnapshot(); selected = []; void load(nav.path); }
  function forward() { history.goForward(); nav = history.getSnapshot(); selected = []; void load(nav.path); }
  function ops() { return createFileOperations({ adapter: requireAdapter(), getPath: () => nav.path, getTaken: () => new Set((entries ?? []).map((e) => e.name)), getClipboard: () => clipboard, setClipboard: (value) => clipboard = value, afterMutation: async () => { selected = []; await load(); }, onNotice: (message) => notice = message }); }
  function select(event: MouseEvent, entry: FsEntry, index: number) {
    if (event.metaKey || event.ctrlKey) selected = selected.includes(entry.name) ? selected.filter((x) => x !== entry.name) : [...selected, entry.name];
    else if (event.shiftKey && lastIndex != null) { const a = Math.min(lastIndex, index); const b = Math.max(lastIndex, index); selected = sorted.slice(a, b + 1).map((x) => x.name); }
    else selected = [entry.name];
    lastIndex = index;
  }
  function open(entry: FsEntry) { const path = joinPath(nav.path, entry.name); if (entry.kind === "dir") navigate(path); else if (previewKind(entry)) preview = { path, entry }; else onOpenFile?.(path, entry); }
  function copy(mode: "copy" | "cut") { if (selected.length) clipboard = { mode, names: [...selected], from: nav.path }; }
  async function newFolder() { const name = window.prompt("Folder name", "untitled folder")?.trim(); if (name) await ops().mkdir(name); }
  async function newFile() { const fs = requireAdapter(); if (!fs.write) { notice = "This backend cannot create files"; return; } const name = window.prompt("File name", "untitled.txt")?.trim(); if (!name) return; const final = uniqueName(new Set((entries ?? []).map((e) => e.name)), name); await fs.write(joinPath(nav.path, final), ""); await load(); }
  async function rename() { if (!selectedEntry) return; const to = window.prompt("Rename", selectedEntry.name)?.trim(); if (to && to !== selectedEntry.name) await ops().rename(selectedEntry.name, to); }
  async function moveSelected() { if (!selected.length) return; const dest = window.prompt("Move to path", nav.path)?.trim(); if (dest) await ops().move([...selected], dest); }
  async function removeSelected() { if (selected.length && window.confirm(`Permanently delete ${selected.length} item(s)?`)) await ops().remove([...selected]); }
  function showProperties() { if (selectedEntry) properties = { path: joinPath(nav.path, selectedEntry.name), entry: selectedEntry }; }
  function context(event: MouseEvent, entry: FsEntry) { event.preventDefault(); if (!selected.includes(entry.name)) selected = [entry.name]; menu = { x: event.clientX, y: event.clientY, entry }; }
  async function uploadFiles(files: FileList | File[]) { const list = Array.from(files).map((file) => ({ relPath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name, file } satisfies UploadFile)); await ops().upload(list); }
  async function drop(event: DragEvent) { event.preventDefault(); if (!event.dataTransfer) return; await ops().upload(await readDropEntries(event.dataTransfer)); }

  const toolContext: FileExplorerCtx = {
    get path() { return nav.path; }, get entries() { return entries; }, get mode() { return activeAdapter?.mode; }, get error() { return notice || null; },
    navigate, mkdir: async (name) => (await ops().mkdir(name)) ?? undefined, rename: (a, b) => ops().rename(a, b), move: (a, b) => ops().move(a, b), trash: (a) => ops().trash(a), remove: (a) => ops().remove(a), emptyTrash: () => ops().emptyTrash(),
  };

  onMount(() => {
    if (!activeAdapter) activeAdapter = createMockAdapter();
    const unsubscribe = history.subscribe(() => nav = history.getSnapshot());
    void load();
    const unregister = registerTools?.(fileExplorerTools, toolContext);
    return () => { unsubscribe(); unregister?.(); };
  });
</script>

<div class="flex h-full min-h-[420px] w-full overflow-hidden rounded-xl border bg-background" role="region" aria-label="File explorer drop area" ondragover={(e) => e.preventDefault()} ondrop={drop}>
  <Sidebar {roots} {usage} path={nav.path} onNavigate={navigate} onTrash={() => navigate(TRASH_PATH)} onEmptyTrash={() => window.confirm("Empty Trash permanently?") && void ops().emptyTrash()} />
  <section class="flex min-w-0 flex-1 flex-col">
    <Toolbar path={nav.path} {rootLabel} canBack={nav.canBack} canForward={nav.canForward} {view} {sort} selectedCount={selected.length} hasClipboard={!!clipboard} {readonly} onBack={back} onForward={forward} onNavigate={navigate} onRefresh={() => void load()} onNewFolder={() => void newFolder()} onNewFile={() => void newFile()} onUpload={() => uploadInput?.click()} onCopy={() => copy("copy")} onCut={() => copy("cut")} onPaste={() => void ops().paste()} onTrash={() => void ops().trash([...selected])} onRemove={() => void removeSelected()} onProperties={showProperties} onView={(v) => view = v} onSort={(v) => sort = v} />
    {#if notice}<p class="border-b border-border bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700">{notice}</p>{/if}
    <main class="min-h-0 flex-1 overflow-auto">
      {#if entries == null}<p class="p-6 text-sm text-muted-foreground">Loading…</p>{:else if !entries.length}<p class="p-6 text-sm text-muted-foreground">This folder is empty.</p>{:else}<EntryList entries={sorted} {selected} {view} onSelect={select} onOpen={open} onContext={context} />{/if}
    </main>
    <footer class="flex items-center gap-3 border-t px-3 py-1.5 text-[10px] text-muted-foreground"><span>{entries?.length ?? 0} items</span><span>{selected.length} selected</span><span class="ml-auto">{activeAdapter?.mode ?? "loading"}</span></footer>
  </section>
  <input class="hidden" type="file" multiple {@attach attachUploadInput} onchange={(e) => { const files = e.currentTarget.files; if (files) void uploadFiles(files); e.currentTarget.value = ""; }} />
</div>
{#if activeAdapter && preview}<PreviewModal adapter={activeAdapter} path={preview.path} entry={preview.entry} onClose={() => preview = null} />{/if}
{#if activeAdapter && properties}<PropertiesModal adapter={activeAdapter} path={properties.path} entry={properties.entry} onClose={() => properties = null} onSaved={load} />{/if}
{#if menu}<ContextMenu x={menu.x} y={menu.y} {readonly} onOpen={() => { open(menu!.entry); menu = null; }} onRename={() => { menu = null; void rename(); }} onMove={() => { menu = null; void moveSelected(); }} onCopy={() => { copy("copy"); menu = null; }} onCut={() => { copy("cut"); menu = null; }} onTrash={() => { menu = null; void ops().trash([...selected]); }} onRemove={() => { menu = null; void removeSelected(); }} onProperties={() => { showProperties(); menu = null; }} onClose={() => menu = null} />{/if}
