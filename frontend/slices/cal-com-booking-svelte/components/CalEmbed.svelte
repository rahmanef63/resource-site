<script lang="ts">
  import { onMount } from "svelte";
  import {
    DEFAULT_CAL_ORIGIN,
    mountCalInline,
    normalizeCalLink,
    type CalEmbedConfig,
  } from "../../cal-com-booking/lib/embed-core";

  type Props = {
    calLink?: string;
    calOrigin?: string;
    config?: CalEmbedConfig;
  };

  let {
    calLink,
    calOrigin = DEFAULT_CAL_ORIGIN,
    config = { layout: "month_view" },
  }: Props = $props();
  let host = $state<HTMLDivElement>();
  let error = $state("");
  let ready = $state(false);
  let link = $derived(normalizeCalLink(calLink));

  onMount(() => {
    if (!link || !host) return;
    let active = true;
    let cleanup: (() => void) | undefined;

    void mountCalInline(host, { calLink: link, calOrigin, config })
      .then((dispose) => {
        if (!active) return dispose();
        cleanup = dispose;
        ready = true;
      })
      .catch((cause: unknown) => {
        if (!active) return;
        error = cause instanceof Error ? cause.message : "Cal.com embed failed to load.";
      });

    return () => {
      active = false;
      cleanup?.();
      host?.replaceChildren();
    };
  });
</script>

<main class="mx-auto min-h-[650px] max-w-5xl p-4 sm:p-8">
  {#if !link}
    <div
      class="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
      role="status"
    >
      Configure a Cal.com <code>calLink</code> such as <code>team/event-type</code> to render booking.
    </div>
  {:else}
    {#if error}
      <div
        class="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        role="alert"
      >
        {error}
      </div>
    {:else if !ready}
      <p class="mb-3 text-sm text-muted-foreground" role="status">Loading Cal.com booking…</p>
    {/if}
    <div class="min-h-[650px] w-full" bind:this={host}></div>
  {/if}
</main>
