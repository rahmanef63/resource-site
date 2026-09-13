<script lang="ts">
  import NotificationList from "./NotificationList.svelte";
  import type { Notification } from "../../notifications-center/lib/types";

  type Props = {
    notifications: Notification[];
    unreadCount?: number;
    now?: string;
    surface?: "popover" | "sheet";
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
    onDismiss?: (id: string) => void;
    onClear?: () => void;
    class?: string;
  };

  let {
    notifications,
    unreadCount,
    now,
    surface = "popover",
    onMarkRead,
    onMarkAllRead,
    onDismiss,
    onClear,
    class: className = "",
  }: Props = $props();

  let open = $state(false);
  let unread = $derived(
    unreadCount ?? notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
  );
</script>

<div class={`relative inline-flex ${className}`}>
  <button
    type="button"
    class="relative grid size-9 place-items-center rounded-md border bg-background text-sm"
    aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span aria-hidden="true">🔔</span>
    {#if unread > 0}
      <span class="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
        {unread > 9 ? "9+" : unread}
      </span>
    {/if}
  </button>

  {#if open && surface === "popover"}
    <div role="dialog" aria-label="Notifications" class="absolute right-0 top-11 z-50 w-80 rounded-lg border bg-background shadow-lg sm:w-96">
      <NotificationList
        {notifications}
        unreadCount={unread}
        {now}
        {onMarkRead}
        {onMarkAllRead}
        {onDismiss}
        {onClear}
      />
    </div>
  {:else if open}
    <button type="button" class="fixed inset-0 z-40 bg-black/30" aria-label="Close notifications" onclick={() => (open = false)}></button>
    <aside aria-label="Notifications" class="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-background shadow-xl">
      <div class="flex justify-end border-b p-2">
        <button type="button" class="rounded px-2 py-1 text-sm" onclick={() => (open = false)}>Close</button>
      </div>
      <NotificationList
        {notifications}
        unreadCount={unread}
        {now}
        {onMarkRead}
        {onMarkAllRead}
        {onDismiss}
        {onClear}
        maxHeight="calc(100vh - 3rem)"
      />
    </aside>
  {/if}
</div>
