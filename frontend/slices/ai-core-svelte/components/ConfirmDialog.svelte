<script lang="ts">
  import ResponsiveDialog from "./ResponsiveDialog.svelte";

  type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
    confirmLabel?: string;
    danger?: boolean;
  };

  let {
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Delete",
    danger = true,
  }: Props = $props();

  function confirm() {
    onConfirm();
    onClose();
  }
</script>

<ResponsiveDialog {open} {onClose} {title} size="sm">
  {#if message}<p class="sub" style="margin: 0">{message}</p>{/if}
  {#snippet footer()}
    <button type="button" class="btn" onclick={onClose}>Cancel</button>
    <button type="button" class:danger class:accent={!danger} class="btn" onclick={confirm}>{confirmLabel}</button>
  {/snippet}
</ResponsiveDialog>
