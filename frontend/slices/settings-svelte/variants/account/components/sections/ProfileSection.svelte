<script lang="ts">
  import {
    settingsProfileInitials,
  } from "@/features/settings/variants/account/lib/core";
  import type { SettingsProfile } from "@/features/settings/variants/account/lib/adapter";

  let {
    value,
    saving = false,
    onSave,
  } = $props<{
    value: SettingsProfile;
    saving?: boolean;
    onSave: (profile: SettingsProfile) => void | Promise<void>;
  }>();

  let draft = $state<SettingsProfile>({ name: "", email: "", avatarUrl: undefined, bio: "" });
  let dirty = $derived(JSON.stringify(draft) !== JSON.stringify(value));

  $effect(() => {
    draft = { ...value };
  });

  function patch(next: Partial<SettingsProfile>) {
    draft = { ...draft, ...next };
  }
</script>

<section class="rounded-xl border bg-card text-card-foreground shadow-sm">
  <header class="space-y-1.5 border-b px-5 py-4">
    <h2 class="font-semibold">Profile</h2>
    <p class="text-sm text-muted-foreground">Your public identity and contact details.</p>
  </header>
  <div class="space-y-5 p-5">
    <div class="flex items-center gap-4">
      <div class="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-lg font-semibold">
        {#if draft.avatarUrl}
          <img src={draft.avatarUrl} alt={draft.name || "Profile avatar"} class="size-full object-cover" />
        {:else}
          {settingsProfileInitials(draft)}
        {/if}
      </div>
      <label class="flex-1 space-y-1.5 text-sm">
        <span class="font-medium">Avatar URL</span>
        <input
          value={draft.avatarUrl ?? ""}
          oninput={(event) => patch({ avatarUrl: event.currentTarget.value || undefined })}
          placeholder="https://…"
          class="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="space-y-1.5 text-sm">
        <span class="font-medium">Name</span>
        <input
          value={draft.name}
          oninput={(event) => patch({ name: event.currentTarget.value })}
          class="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <label class="space-y-1.5 text-sm">
        <span class="font-medium">Email</span>
        <input
          type="email"
          value={draft.email}
          oninput={(event) => patch({ email: event.currentTarget.value })}
          class="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
    </div>

    <label class="space-y-1.5 text-sm">
      <span class="font-medium">Bio</span>
      <textarea
        rows="3"
        value={draft.bio ?? ""}
        oninput={(event) => patch({ bio: event.currentTarget.value || undefined })}
        placeholder="A short bio…"
        class="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      ></textarea>
    </label>

    <div class="flex justify-end">
      <button
        type="button"
        disabled={saving || !dirty}
        onclick={() => onSave(draft)}
        class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  </div>
</section>
