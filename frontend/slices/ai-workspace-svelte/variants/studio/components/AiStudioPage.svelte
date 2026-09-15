<script lang="ts">
  import VersionTree from "./VersionTree.svelte";
  import { runGeneration } from "@/features/ai-workspace/variants/studio/stub";
  import type { Generation, OutputKind } from "@/features/ai-workspace/variants/studio/types";

  const OUTPUT_KINDS: Array<{ value: OutputKind; label: string }> = [
    { value: "image", label: "Image" }, { value: "text", label: "Text" },
    { value: "code", label: "Code" }, { value: "audio", label: "Audio" },
  ];
  let prompt = $state("");
  let kind = $state<OutputKind>("image");
  let generating = $state(false);
  let history = $state<Generation[]>([]);
  let activeId = $state<string | null>(null);
  let active = $derived(history.find((generation) => generation.id === activeId) ?? null);

  function generate(parentId?: string) {
    const trimmed = prompt.trim();
    if (!trimmed || generating) return;
    generating = true;
    setTimeout(() => {
      const generation = runGeneration({ prompt: trimmed, kind, parentId });
      history = [generation, ...history];
      activeId = generation.id;
      generating = false;
    }, 400);
  }
</script>

<div class="flex min-h-[34rem] flex-col gap-4 lg:flex-row">
  <VersionTree {history} {activeId} onSelect={(id) => activeId = id} />
  <section class="flex min-h-0 flex-1 flex-col gap-4">
    <div class="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
      <header class="flex items-center justify-between border-b px-4 py-3"><span class="text-sm font-medium">{active?.prompt ?? "Generation canvas"}</span><span class="rounded-full bg-muted px-2 py-0.5 text-[10px]">scaffold</span></header>
      {#if active}
        <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          {#each active.variants as variant (variant.id)}
            <article class="flex min-h-40 flex-col justify-between gap-2 rounded-lg border p-4 text-sm">
              <div class="flex items-center justify-between text-xs text-muted-foreground"><span>Variant {variant.index + 1}</span><span class="rounded-full border px-2 py-0.5 text-[10px]">{active.kind}</span></div>
              <p class="text-muted-foreground">{variant.outputInline}</p>
              <button type="button" class="self-start text-xs underline" onclick={() => generate(active.id)}>⑂ Branch from this</button>
            </article>
          {/each}
        </div>
      {:else}
        <div class="grid min-h-64 flex-1 place-items-center p-8 text-center"><div><div class="text-3xl">✦</div><p class="mt-2 text-sm font-medium">Start a generation</p><p class="mt-1 max-w-sm text-xs text-muted-foreground">Describe what you want and pick an output kind. This scaffold returns placeholder variants — no model is called.</p></div></div>
      {/if}
    </div>
    <div class="rounded-lg border bg-card p-3"><div class="flex flex-col gap-2 sm:flex-row sm:items-end">
      <textarea class="min-h-16 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm" bind:value={prompt} placeholder="Describe what you want to generate…" aria-label="Generation prompt"></textarea>
      <div class="flex gap-2"><select class="rounded-md border bg-background px-3 py-2 text-sm" bind:value={kind} aria-label="Output kind">{#each OUTPUT_KINDS as entry (entry.value)}<option value={entry.value}>{entry.label}</option>{/each}</select><button type="button" class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onclick={() => generate()} disabled={!prompt.trim() || generating}>{generating ? "Generating…" : "Generate"}</button></div>
    </div></div>
  </section>
</div>
