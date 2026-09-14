<script lang="ts">
  import type { SettingsNotifications } from "@/features/settings/variants/account/lib/adapter";

  type NotifKey = keyof SettingsNotifications;
  const rows: { key: NotifKey; label: string; description: string }[] = [
    { key: "emailDigest", label: "Email digest", description: "A weekly summary of activity delivered to your inbox." },
    { key: "productUpdates", label: "Product updates", description: "News about new features and improvements." },
    { key: "mentions", label: "Mentions", description: "Get notified when someone @-mentions you." },
    { key: "sms", label: "SMS alerts", description: "Critical alerts sent as text messages." },
  ];

  let {
    value,
    saving = false,
    onToggle,
  } = $props<{
    value: SettingsNotifications;
    saving?: boolean;
    onToggle: (patch: Partial<SettingsNotifications>) => void | Promise<void>;
  }>();
</script>

<section class="rounded-xl border bg-card text-card-foreground shadow-sm">
  <header class="space-y-1.5 border-b px-5 py-4">
    <h2 class="font-semibold">Notifications</h2>
    <p class="text-sm text-muted-foreground">Choose what reaches you and how.</p>
  </header>
  <div class="divide-y px-5">
    {#each rows as row}
      <label class="flex items-center justify-between gap-4 py-4">
        <span class="space-y-0.5">
          <span class="block text-sm font-medium">{row.label}</span>
          <span class="block text-sm text-muted-foreground">{row.description}</span>
        </span>
        <input
          type="checkbox"
          checked={value[row.key]}
          disabled={saving}
          onchange={(event) => onToggle({ [row.key]: event.currentTarget.checked })}
          class="size-4 shrink-0 accent-[var(--primary)]"
        />
      </label>
    {/each}
  </div>
</section>
