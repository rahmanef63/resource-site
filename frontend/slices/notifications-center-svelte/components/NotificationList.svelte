<script lang="ts">
  import NotificationItem from "./NotificationItem.svelte";
  import type { Notification } from "../../notifications-center/lib/types";
  import {
    filterNotifications,
    type NotificationTab,
  } from "../../notifications-center/lib/state";

  type Props = {
    notifications: Notification[];
    unreadCount?: number;
    now?: string;
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
    onDismiss?: (id: string) => void;
    onClear?: () => void;
    maxHeight?: string;
    class?: string;
  };

  let {
    notifications,
    unreadCount,
    now,
    onMarkRead,
    onMarkAllRead,
    onDismiss,
    onClear,
    maxHeight = "22rem",
    class: className = "",
  }: Props = $props();

  let tab = $state<NotificationTab>("all");
  let unread = $derived(
    unreadCount ?? notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
  );
  let rows = $derived(filterNotifications(notifications, tab));
</script>

<div class={`flex flex-col ${className}`}>
  <div class="flex items-center justify-between gap-2 px-4 py-3">
    <p class="text-sm font-semibold">Notifications</p>
    <div class="flex items-center gap-2">
      <button type="button" class="text-xs underline underline-offset-2 disabled:opacity-50" disabled={unread === 0} onclick={() => onMarkAllRead?.()}>Mark all read</button>
      <button type="button" class="text-xs text-muted-foreground underline underline-offset-2 disabled:opacity-50" disabled={notifications.length === 0} onclick={() => onClear?.()}>Clear</button>
    </div>
  </div>

  <div class="flex gap-1 px-4 pb-2" role="tablist" aria-label="Notification filters">
    <button type="button" role="tab" aria-selected={tab === "all"} class={`rounded px-2 py-1 text-xs ${tab === "all" ? "bg-muted font-medium" : ""}`} onclick={() => (tab = "all")}>All</button>
    <button type="button" role="tab" aria-selected={tab === "unread"} class={`rounded px-2 py-1 text-xs ${tab === "unread" ? "bg-muted font-medium" : ""}`} onclick={() => (tab = "unread")}>Unread{unread > 0 ? ` (${unread})` : ""}</button>
  </div>

  <div class="border-t"></div>

  {#if rows.length === 0}
    <div class="px-4 py-10 text-center text-sm text-muted-foreground">
      {tab === "unread" ? "No unread notifications" : "You're all caught up"}
    </div>
  {:else}
    <ul class="divide-y overflow-auto" style:max-height={maxHeight}>
      {#each rows as item (item.id)}
        <li>
          <NotificationItem
            notification={item}
            {now}
            {onMarkRead}
            {onDismiss}
          />
        </li>
      {/each}
    </ul>
  {/if}
</div>
