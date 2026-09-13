<script lang="ts">
  import type { Snippet } from "svelte";
  import StepIdentity from "./StepIdentity.svelte";
  import StepBranding from "./StepBranding.svelte";
  import StepContent from "./StepContent.svelte";
  import StepDone from "./StepDone.svelte";
  import {
    ONBOARDING_STEPS,
    buildOnboardingSavePayload,
    createOnboardingStore,
    normalizePresetOptions,
    type OnboardingFields,
    type OnboardingSavePayload,
    type PresetOption,
  } from "../../site-setup-wizard/lib/core";

  let {
    onDone,
    save,
    seedSample,
    seeded = false,
    presetOptions,
    defaultPresetLabel,
    onPresetPreview,
    defaultBrandColor = "#c4583a",
    imageField,
  }: {
    onDone: () => void;
    save: (fields: OnboardingSavePayload) => Promise<unknown>;
    seedSample?: () => Promise<unknown>;
    seeded?: boolean;
    presetOptions?: ReadonlyArray<string | PresetOption>;
    defaultPresetLabel?: string;
    onPresetPreview?: (name: string | null) => void;
    defaultBrandColor?: string;
    imageField?: Snippet<[kind: "logo" | "favicon", current: string, onUploaded: (url: string) => void]>;
  } = $props();

  function createInitialStore() { return createOnboardingStore(defaultBrandColor); }
  const store = createInitialStore();
  let snapshot = $state(store.getSnapshot());
  let busy = $state(false);
  let presets = $derived(normalizePresetOptions(presetOptions));
  let alreadySeeded = $derived(snapshot.justSeeded || seeded);
  let progress = $derived(((snapshot.step + 1) / ONBOARDING_STEPS.length) * 100);

  $effect(() => {
    snapshot = store.getSnapshot();
    return store.subscribe(() => {
      snapshot = store.getSnapshot();
    });
  });

  const setField = (key: keyof OnboardingFields, value: string) => store.setField(key, value);

  async function finish() {
    busy = true;
    try {
      await save(buildOnboardingSavePayload(snapshot.fields));
      onDone();
    } finally {
      busy = false;
    }
  }

  async function skip() {
    onPresetPreview?.(null);
    busy = true;
    try {
      await save({ markOnboarded: true });
      onDone();
    } finally {
      busy = false;
    }
  }

  async function doSeed() {
    if (!seedSample) return;
    busy = true;
    try {
      await seedSample();
      store.markSeeded();
    } finally {
      busy = false;
    }
  }
</script>

<div class="grid min-h-screen place-items-center bg-background px-6 py-10">
  <section class="w-full max-w-lg rounded-xl border border-border/60 bg-card p-7 text-card-foreground shadow-sm">
    <div class="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
      Setup · {snapshot.step + 1}/{ONBOARDING_STEPS.length}
    </div>
    <div class="mb-5 mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`Progress ${Math.round(progress)}%`}>
      <div class="h-full bg-primary transition-[width]" style:width={`${progress}%`}></div>
    </div>

    {#if snapshot.step === 0}
      <StepIdentity fields={snapshot.fields} {setField} />
    {:else if snapshot.step === 1}
      <StepBranding
        fields={snapshot.fields}
        {setField}
        presetOptions={presets}
        {defaultPresetLabel}
        {onPresetPreview}
        {imageField}
      />
    {:else if snapshot.step === 2}
      <StepContent {alreadySeeded} {busy} onSeed={doSeed} />
    {:else}
      <StepDone siteName={snapshot.fields.siteName} />
    {/if}

    <div class="mt-7 flex items-center justify-between gap-3">
      {#if snapshot.step > 0}
        <button
          type="button"
          class="h-9 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent"
          disabled={busy}
          onclick={store.prev}
        >
          ← Kembali
        </button>
      {:else}
        <button
          type="button"
          class="h-9 rounded-md px-0 text-xs text-muted-foreground underline-offset-4 hover:underline"
          disabled={busy}
          onclick={skip}
        >
          Lewati setup
        </button>
      {/if}

      {#if snapshot.step < ONBOARDING_STEPS.length - 1}
        <button
          type="button"
          class="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={busy}
          onclick={store.next}
        >
          Lanjut →
        </button>
      {:else}
        <button
          type="button"
          class="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={busy}
          onclick={finish}
        >
          {busy ? "Menyimpan…" : "Selesai ✓"}
        </button>
      {/if}
    </div>
  </section>
</div>
