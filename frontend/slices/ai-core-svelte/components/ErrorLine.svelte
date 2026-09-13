<script lang="ts">
  import { presentError } from "../../ai-core/lib/error-core";

  type Props = {
    e: unknown;
    isAdmin: boolean;
    labels?: Record<string, string>;
  };

  let { e, isAdmin, labels }: Props = $props();
  let copied = $state(false);
  let view = $derived(presentError(e, labels));

  async function copyError() {
    await navigator.clipboard?.writeText(view.full);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="err">
  <span>{view.headline}</span>
  {#if isAdmin && view.adminLine}
    <span class="mono muted" style="display:block;font-size:.72rem;margin-top:.3rem">{view.adminLine}</span>
  {/if}
  <details style="margin-top:.3rem">
    <summary class="link" style="font-size:.72rem;padding:0;min-height:0;list-style:revert">details / copy</summary>
    <pre class="mono muted" style="white-space:pre-wrap;overflow-x:auto;font-size:.7rem;margin:.3rem 0 0;max-height:12rem">{view.full}</pre>
    <button type="button" class="link" style="font-size:.72rem;padding:0;min-height:0" onclick={copyError}>
      {copied ? "copied ✓" : "copy error"}
    </button>
  </details>
</div>
