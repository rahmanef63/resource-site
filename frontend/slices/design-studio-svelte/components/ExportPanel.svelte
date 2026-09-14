<script lang="ts">
  import { buildDoc, downloadText, type Layer } from "@/features/design-studio/lib/model-core";
  import type { Adjustments } from "@/features/design-studio/lib/filters";
  import { buildHTML, importFile } from "@/features/design-studio/lib/serialize";
  import { canSaveToHost, saveDocToHost } from "@/features/design-studio/lib/host-core";

  type Tab = "json" | "html";
  let { layers, aspect, adjustments, onClose, onImport, notify }: {
    layers: Layer[]; aspect: string; adjustments: Adjustments; onClose: () => void;
    onImport: (result: { layers: Layer[]; aspect?: string; adjustments?: Adjustments }) => void;
    notify: (message: string) => void;
  } = $props();
  let tab = $state<Tab>("json");
  let text = $derived(tab === "json" ? JSON.stringify(buildDoc(layers, aspect, adjustments), null, 2) : buildHTML(layers, aspect));
  const mime = $derived(tab === "json" ? "application/json" : "text/html");
  function download() { downloadText(`design.${tab}`, text, mime); }
  async function copy() { try { await navigator.clipboard.writeText(text); notify("Copied to clipboard"); } catch { notify("Copy failed"); } }
  async function save() { try { const path = await saveDocToHost(text, `design.${tab}`, mime); notify(path ? `Saved → ${path}` : "No host writer wired"); } catch (error) { notify(error instanceof Error ? error.message : "save failed"); } }
  async function load(file?: File) { if (!file) return; try { const result = await importFile(file); onImport(result); notify(`Imported ${file.name}`); onClose(); } catch (error) { notify(error instanceof Error ? error.message : "import failed"); } }
</script>

<div class="absolute inset-0 z-40 grid place-items-center bg-background/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Export design">
  <section class="flex max-h-[80%] w-full max-w-2xl flex-col rounded-xl border bg-card shadow-xl">
    <header class="flex items-center justify-between border-b p-3"><div><h2 class="font-semibold">Export / Import</h2><p class="text-xs text-muted-foreground">os-rr/layers@1 or standalone HTML</p></div><button type="button" class="rounded-md px-2 py-1 hover:bg-accent" onclick={onClose}>×</button></header>
    <div class="flex items-center gap-2 border-b p-3"><button type="button" class={`rounded-md px-3 py-1.5 text-xs ${tab === "json" ? "bg-primary text-primary-foreground" : "border"}`} onclick={() => (tab = "json")}>JSON</button><button type="button" class={`rounded-md px-3 py-1.5 text-xs ${tab === "html" ? "bg-primary text-primary-foreground" : "border"}`} onclick={() => (tab = "html")}>HTML</button><label class="ml-auto cursor-pointer rounded-md border px-3 py-1.5 text-xs hover:bg-accent">Import<input type="file" accept=".json,.html,.txt" class="sr-only" onchange={(event) => load(event.currentTarget.files?.[0])} /></label></div>
    <textarea readonly value={text} class="min-h-64 flex-1 resize-none bg-muted/40 p-3 font-mono text-xs"></textarea>
    <footer class="flex flex-wrap justify-end gap-2 border-t p-3"><button type="button" class="rounded-md border px-3 py-1.5 text-xs" onclick={copy}>Copy</button>{#if canSaveToHost()}<button type="button" class="rounded-md border px-3 py-1.5 text-xs" onclick={save}>Save to host</button>{/if}<button type="button" class="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground" onclick={download}>Download</button></footer>
  </section>
</div>
