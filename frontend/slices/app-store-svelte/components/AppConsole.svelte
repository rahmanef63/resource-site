<script lang="ts">
  import { onMount } from "svelte";
  import { appStoreExecApi, getAppStoreExecRevision, subscribeAppStoreExec } from "../../app-store/lib/exec-core";
  import { splitConsoleLines, type AppManifest, type ConsoleLine } from "../../app-store/lib/runtime-core";

  type Props = { manifest: AppManifest };
  let { manifest }: Props = $props();
  let lines = $state<ConsoleLine[]>([]);
  let running = $state(false);
  let revision = $state(0);
  let body = $state<HTMLDivElement>();
  let mode = $derived((revision, appStoreExecApi.mode));

  onMount(() => {
    revision = getAppStoreExecRevision();
    return subscribeAppStoreExec(() => (revision = getAppStoreExecRevision()));
  });

  function append(next: ConsoleLine[]) {
    lines = [...lines, ...next];
    queueMicrotask(() => {
      if (body) body.scrollTop = body.scrollHeight;
    });
  }

  async function run() {
    if (running || !manifest.entry) return;
    running = true;
    append([{ kind: "sys", text: `$ ${manifest.entry}` }]);
    try {
      const result = await appStoreExecApi.exec.run(manifest.entry);
      const next: ConsoleLine[] = [];
      if (result.stdout) next.push(...splitConsoleLines(result.stdout, "out"));
      if (result.stderr) next.push(...splitConsoleLines(result.stderr, "err"));
      next.push({ kind: "exit", text: `exit ${result.code}` });
      append(next);
    } catch (cause) {
      append([{ kind: "err", text: cause instanceof Error ? cause.message : String(cause) }]);
    } finally {
      running = false;
    }
  }
</script>

<div class="flex h-full flex-col">
  <header class="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
    <h2 class="mr-auto truncate text-sm font-bold">{manifest.title}</h2>
    <span class="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{manifest.runtime}</span>
    <button class="rounded-md border px-3 py-1 text-xs" disabled={running || !manifest.entry} onclick={run}>{running ? "Running…" : "Run"}</button>
    <button class="rounded-md px-3 py-1 text-xs text-muted-foreground" disabled={running || lines.length === 0} onclick={() => (lines = [])}>Clear</button>
  </header>
  <div class="truncate border-b border-border bg-secondary/40 px-3 py-1 font-mono text-[11px] text-muted-foreground">entry: {manifest.entry || "—"}</div>
  <div bind:this={body} class="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
    {#if mode === "mock"}<p class="mb-2 text-[11px] text-muted-foreground">mock mode — output is simulated; wire configureAppStoreExec for a live host.</p>{/if}
    {#if lines.length === 0 && !running}<p class="text-muted-foreground">Press Run to execute {manifest.runtime} app.</p>{/if}
    {#each lines as line, i (`${i}-${line.kind}-${line.text}`)}
      <div class="whitespace-pre-wrap {line.kind === 'err' ? 'text-destructive' : line.kind === 'exit' ? 'text-muted-foreground' : line.kind === 'sys' ? 'text-primary' : 'text-foreground'}">{line.text}</div>
    {/each}
  </div>
</div>
