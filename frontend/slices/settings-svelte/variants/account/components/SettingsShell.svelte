<script lang="ts">
  import {
    mergeSettingsValues,
  } from "@/features/settings/variants/account/lib/core";
  import {
    SETTINGS_SECTION_CORE,
    type SettingsSectionId,
  } from "@/features/settings/variants/account/lib/nav-core";
  import type {
    SettingsAdapter,
    SettingsValues,
  } from "@/features/settings/variants/account/lib/adapter";
  import {
    settingsPageTools,
    type SettingsPageCtx,
  } from "@/features/settings/variants/account/lib/tools";
  import DangerZone from "./sections/DangerZone.svelte";
  import NotificationsSection from "./sections/NotificationsSection.svelte";
  import PreferencesSection from "./sections/PreferencesSection.svelte";
  import ProfileSection from "./sections/ProfileSection.svelte";

  type RegisterTools = (
    collection: typeof settingsPageTools,
    context: SettingsPageCtx,
  ) => void | (() => void);

  let {
    adapter,
    active = undefined,
    onNavigate = undefined,
    onDeleteAccount = undefined,
    nav = true,
    registerTools = undefined,
  } = $props<{
    adapter: SettingsAdapter;
    active?: SettingsSectionId;
    onNavigate?: (section: SettingsSectionId) => void;
    onDeleteAccount?: () => void | Promise<void>;
    nav?: boolean;
    registerTools?: RegisterTools;
  }>();

  let internal = $state<SettingsSectionId>("profile");
  let values = $state<SettingsValues | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state<Error | null>(null);
  let current = $derived(active ?? internal);

  function go(section: SettingsSectionId) {
    if (onNavigate) onNavigate(section);
    else internal = section;
  }

  async function save(patch: Partial<SettingsValues>) {
    const previous = values;
    saving = true;
    error = null;
    if (values) values = mergeSettingsValues(values, patch);
    try {
      await adapter.save(patch);
    } catch (cause) {
      values = previous;
      error = cause as Error;
      throw cause;
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    const currentAdapter = adapter;
    let activeLoad = true;
    loading = true;
    error = null;
    currentAdapter
      .load()
      .then((loaded) => {
        if (activeLoad) values = loaded;
      })
      .catch((cause) => {
        if (activeLoad) error = cause as Error;
      })
      .finally(() => {
        if (activeLoad) loading = false;
      });
    return () => {
      activeLoad = false;
    };
  });

  $effect(() => {
    if (!registerTools) return;
    const cleanup = registerTools(settingsPageTools, { values, save });
    return typeof cleanup === "function" ? cleanup : undefined;
  });
</script>

<div class={nav ? "flex flex-col gap-6 md:flex-row" : "min-w-0"}>
  {#if nav}
    <nav class="md:w-56 md:shrink-0" aria-label="Settings sections">
      <select
        value={current}
        onchange={(event) => go(event.currentTarget.value as SettingsSectionId)}
        class="h-10 w-full rounded-md border bg-background px-3 text-sm md:hidden"
        aria-label="Settings section"
      >
        {#each SETTINGS_SECTION_CORE as section}
          <option value={section.id}>{section.label}</option>
        {/each}
      </select>

      <div class="hidden flex-col gap-1 md:flex">
        {#each SETTINGS_SECTION_CORE as section}
          <button
            type="button"
            onclick={() => go(section.id)}
            class={`rounded-md px-3 py-2 text-left text-sm ${current === section.id ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"} ${section.id === "danger-zone" ? "text-destructive hover:text-destructive" : ""}`}
          >
            {section.label}
          </button>
        {/each}
      </div>
    </nav>
  {/if}

  <main class="min-w-0 flex-1">
    {#if loading || !values}
      <section class="space-y-4 rounded-xl border p-5" aria-busy="true">
        <div class="h-5 w-32 animate-pulse rounded bg-muted"></div>
        <div class="h-4 w-64 max-w-full animate-pulse rounded bg-muted"></div>
        <div class="h-10 w-full animate-pulse rounded bg-muted"></div>
        <div class="h-10 w-full animate-pulse rounded bg-muted"></div>
      </section>
    {:else if current === "profile"}
      <ProfileSection value={values.profile} {saving} onSave={(profile) => save({ profile })} />
    {:else if current === "preferences"}
      <PreferencesSection value={values.preferences} {saving} onSave={(preferences) => save({ preferences })} />
    {:else if current === "notifications"}
      <NotificationsSection
        value={values.notifications}
        {saving}
        onToggle={(patch) => save({ notifications: { ...values.notifications, ...patch } })}
      />
    {:else}
      <DangerZone {onDeleteAccount} />
    {/if}

    {#if error}
      <p class="mt-3 text-sm text-destructive" role="alert">{error.message}</p>
    {/if}
  </main>
</div>
