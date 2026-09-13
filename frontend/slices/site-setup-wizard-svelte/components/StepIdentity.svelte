<script lang="ts">
  import Field from "./Field.svelte";
  import {
    isValidOptionalEmail,
    type OnboardingFields,
  } from "../../site-setup-wizard/lib/core";

  let {
    fields,
    setField,
  }: {
    fields: OnboardingFields;
    setField: (key: keyof OnboardingFields, value: string) => void;
  } = $props();

  let emailInvalid = $derived(!isValidOptionalEmail(fields.contactEmail));
</script>

<div class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold tracking-tight">Identitas situs</h1>
    <p class="text-sm text-muted-foreground">Bisa diganti kapan saja.</p>
  </div>

  <Field label="Nama situs / brand">
    <input
      class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      value={fields.siteName}
      placeholder="mis. Studio Saya"
      oninput={(event) => setField("siteName", event.currentTarget.value)}
    />
  </Field>
  <Field label="Tagline">
    <input
      class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      value={fields.tagline}
      placeholder="Satu kalimat tentang kamu"
      oninput={(event) => setField("tagline", event.currentTarget.value)}
    />
  </Field>
  <Field label="Nama pemilik">
    <input
      class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      value={fields.ownerName}
      placeholder="Nama kamu"
      oninput={(event) => setField("ownerName", event.currentTarget.value)}
    />
  </Field>
  <Field label="Email kontak">
    <input
      type="email"
      class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      value={fields.contactEmail}
      placeholder="halo@situ.kamu"
      aria-invalid={emailInvalid || undefined}
      oninput={(event) => setField("contactEmail", event.currentTarget.value)}
    />
    {#if emailInvalid}
      <p class="text-xs text-destructive">Format email belum valid.</p>
    {/if}
  </Field>
</div>
