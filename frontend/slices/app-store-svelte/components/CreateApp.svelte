<script lang="ts">
  import {
    APP_GRADIENTS,
    APP_RUNTIMES,
    DEFAULT_ENTRY,
    appManifestJson,
    slugifyAppName,
    type AppRuntime,
  } from "../../app-store/lib/create-core";
  import { createApp } from "../../app-store/lib/apps-core";
  import { GLYPH_KEYS, glyphSymbol } from "../../app-store/lib/glyph-core";

  let name = $state("");
  let runtime = $state<AppRuntime>("html");
  let entry = $state(DEFAULT_ENTRY.html);
  let gradient = $state<string>(APP_GRADIENTS[0]);
  let glyph = $state<string>(GLYPH_KEYS[0]);
  let created = $state(false);
  let error = $state("");
  let slug = $derived(slugifyAppName(name) || "untitled");
  let manifest = $derived(appManifestJson({ name, runtime, entry, glyph, gradient }));

  function pickRuntime(next: AppRuntime) {
    runtime = next;
    entry = DEFAULT_ENTRY[next];
  }

  function submit() {
    if (created) return;
    error = "";
    try {
      createApp({ appId: slug, title: name.trim() || "New app", glyph, gradient, runtime, entry });
      created = true;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Gagal membuat app";
    }
  }
</script>

<div class="h-full overflow-auto">
  <div class="mx-auto max-w-md space-y-5 p-5">
    <header class="flex items-center gap-3">
      <div class="grid size-12 place-items-center rounded-xl text-sm font-semibold text-white" style:background={gradient}>{glyphSymbol(glyph)}</div>
      <div class="min-w-0"><h2 class="truncate text-sm font-semibold">{name.trim() || "New app"}</h2><p class="truncate font-mono text-[11px] text-muted-foreground">/apps/{slug}</p></div>
    </header>

    <label class="block space-y-1.5"><span class="text-xs font-medium text-muted-foreground">Name</span><input class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" bind:value={name} placeholder="My App" /></label>

    <fieldset class="space-y-1.5"><legend class="text-xs font-medium text-muted-foreground">Runtime</legend><div class="grid grid-cols-4 gap-1">{#each APP_RUNTIMES as option}<button type="button" class="rounded-md border px-2 py-1.5 text-xs {runtime === option.value ? 'bg-foreground text-background' : 'bg-background'}" onclick={() => pickRuntime(option.value)}>{option.label}</button>{/each}</div></fieldset>

    <label class="block space-y-1.5"><span class="text-xs font-medium text-muted-foreground">Entry point</span><input class="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs" bind:value={entry} /></label>

    <fieldset class="space-y-1.5"><legend class="text-xs font-medium text-muted-foreground">Glyph</legend><div class="grid grid-cols-4 gap-2">{#each GLYPH_KEYS as key}<button type="button" class="rounded-md border p-2 text-xs {glyph === key ? 'ring-2 ring-foreground' : ''}" onclick={() => (glyph = key)}><span class="mr-1">{glyphSymbol(key)}</span>{key}</button>{/each}</div></fieldset>

    <fieldset class="space-y-1.5"><legend class="text-xs font-medium text-muted-foreground">Accent</legend><div class="flex gap-2">{#each APP_GRADIENTS as color}<button type="button" aria-label="accent" class="size-7 rounded-full border {gradient === color ? 'ring-2 ring-foreground ring-offset-2' : ''}" style:background={color} onclick={() => (gradient = color)}></button>{/each}</div></fieldset>

    <div class="space-y-1.5"><p class="text-xs font-medium text-muted-foreground">manifest.json</p><pre class="overflow-x-auto rounded-md border bg-secondary/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{manifest}</pre></div>

    <button class="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50" disabled={created} onclick={submit}>{created ? "✓ Created" : "Create app"}</button>
    {#if error}<p class="text-center text-xs text-destructive" role="alert">{error}</p>{/if}
    {#if created}<p class="text-center text-xs text-muted-foreground" role="status">Added to the local app registry.</p>{/if}
  </div>
</div>
