<script lang="ts">
  import type { MembersLabels } from "../../user-management/types";
  let { canManage, onRemove, labels }: { canManage: boolean; onRemove?: () => void | Promise<void>; labels: MembersLabels } = $props();
</script>

{#if canManage && onRemove}
  <button type="button" class="rounded-md px-2 py-1 text-xs text-destructive hover:bg-muted" onclick={() => onRemove?.()}>
    {labels.remove}
  </button>
{/if}
