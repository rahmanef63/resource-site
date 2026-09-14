<script lang="ts">
  import AppConsole from "./AppConsole.svelte";
  import { isHttpUrl, type AppManifest } from "../../app-store/lib/runtime-core";

  type Props = { manifest?: AppManifest; payload?: unknown };
  let { manifest, payload }: Props = $props();
  let current = $derived(manifest ?? (payload as AppManifest | undefined));
</script>

{#if !current}
  <div class="grid h-full place-items-center text-sm text-muted-foreground">No app manifest.</div>
{:else if current.runtime === "html" && isHttpUrl(current.entry)}
  <iframe title={current.title} src={current.entry} class="size-full border-0 bg-white" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
{:else if current.runtime !== "html" && current.entry && !isHttpUrl(current.entry)}
  <AppConsole manifest={current} />
{:else}
  <div class="grid h-full place-items-center p-6">
    <div class="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card/60 p-6 text-center">
      <span class="mx-auto grid size-12 place-items-center rounded-xl bg-secondary text-muted-foreground">□</span>
      <div><h2 class="text-base font-bold">{current.title}</h2><p class="text-xs text-muted-foreground">{current.source === "store" ? "Installed app" : "Custom app"} · {current.runtime}</p></div>
      <dl class="space-y-1 rounded-lg bg-secondary/50 p-3 text-left text-xs">
        <div class="flex justify-between gap-3"><dt class="text-muted-foreground">runtime</dt><dd class="font-mono">{current.runtime}</dd></div>
        <div class="flex justify-between gap-3"><dt class="text-muted-foreground">entry</dt><dd class="truncate font-mono">{current.entry || "—"}</dd></div>
      </dl>
      {#if isHttpUrl(current.entry)}<a href={current.entry} target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">Open entry ↗</a>{/if}
    </div>
  </div>
{/if}
