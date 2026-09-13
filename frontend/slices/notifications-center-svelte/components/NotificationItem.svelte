<script lang="ts">
  import type { Notification } from "../../notifications-center/lib/types";
  import { relativeTime } from "../../notifications-center/lib/relativeTime";

  type Props = {
    notification: Notification;
    now?: string;
    onMarkRead?: (id: string) => void;
    onDismiss?: (id: string) => void;
  };

  let { notification: item, now, onMarkRead, onDismiss }: Props = $props();
  let initials = $derived(item.actor?.name.slice(0, 2).toUpperCase() ?? "");
  let kindLabel = $derived(item.kind.charAt(0).toUpperCase() + item.kind.slice(1));
</script>

<article class={`relative flex gap-3 px-4 py-3 text-sm ${item.read ? "" : "bg-muted/30"}`}>
  {#if !item.read}
    <span aria-hidden="true" class="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-primary"></span>
  {/if}
  {#if item.actor}
    <div class="mt-0.5 grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-[10px]" aria-label={item.actor.name}>
      {#if item.actor.avatarUrl}
        <img src={item.actor.avatarUrl} alt={item.actor.name} class="size-full object-cover" />
      {:else}
        {initials}
      {/if}
    </div>
  {:else}
    <span class="mt-0.5 shrink-0 text-xs font-medium text-muted-foreground" aria-label={kindLabel}>{kindLabel.slice(0, 1)}</span>
  {/if}

  <div class="min-w-0 flex-1">
    <div class="flex items-start gap-2">
      <p class={`min-w-0 flex-1 leading-snug ${item.read ? "" : "font-medium"}`}>{item.title}</p>
      <time class="shrink-0 text-xs text-muted-foreground">{relativeTime(item.createdAt, now)}</time>
    </div>
    {#if item.body}
      <p class="mt-0.5 text-xs text-muted-foreground">{item.body}</p>
    {/if}
    <div class="mt-2 flex gap-2">
      {#if !item.read && onMarkRead}
        <button type="button" class="text-xs underline underline-offset-2" onclick={() => onMarkRead?.(item.id)}>Mark read</button>
      {/if}
      {#if onDismiss}
        <button type="button" class="text-xs text-muted-foreground underline underline-offset-2" onclick={() => onDismiss?.(item.id)}>Dismiss</button>
      {/if}
    </div>
  </div>
</article>
