<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    open: boolean;
    onClose: () => void;
    title?: string;
    titleContent?: Snippet;
    children?: Snippet;
    footer?: Snippet;
    size?: "sm" | "md";
    labelledBy?: string;
  };

  let {
    open,
    onClose,
    title,
    titleContent,
    children,
    footer,
    size = "sm",
    labelledBy,
  }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    const current = dialog;
    if (!current) return;
    if (open && !current.open) current.showModal();
    else if (!open && current.open) current.close();
  });

  function handleCancel(event: Event) {
    event.preventDefault();
    onClose();
  }

  function handleBackdrop(event: MouseEvent) {
    if (event.target === dialog) onClose();
  }
</script>

{#if open}
  <dialog
    bind:this={dialog}
    class="rd"
    data-size={size}
    aria-labelledby={labelledBy}
    oncancel={handleCancel}
    onclick={handleBackdrop}
  >
    <div class="rd-panel" role="document">
      <span class="rd-grab" aria-hidden="true"></span>
      {#if title !== undefined || titleContent}
        <div class="rd-head">
          {#if titleContent}
            <strong>{@render titleContent()}</strong>
          {:else}
            <strong>{title}</strong>
          {/if}
          <button type="button" class="more-x" onclick={onClose} aria-label="Close">×</button>
        </div>
      {/if}
      <div class="rd-body">
        {#if children}{@render children()}{/if}
      </div>
      {#if footer}
        <div class="rd-foot">{@render footer()}</div>
      {/if}
    </div>
  </dialog>
{/if}
