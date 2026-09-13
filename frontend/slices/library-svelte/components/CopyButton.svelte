<script lang="ts">
  import { onDestroy } from "svelte";

  let {
    text,
    label = "Copy",
    copiedLabel = "Copied",
    class: className = "",
  }: {
    text: string;
    label?: string;
    copiedLabel?: string;
    class?: string;
  } = $props();

  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copied = false;
        resetTimer = undefined;
      }, 1500);
    } catch {
      // Clipboard can be unavailable in sandboxed or insecure contexts.
    }
  }

  onDestroy(() => {
    if (resetTimer) clearTimeout(resetTimer);
  });
</script>

<button
  type="button"
  onclick={copy}
  class={`inline-flex items-center gap-2 rounded-md border-2 border-current px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors hover:bg-current hover:text-background ${className}`}
>
  {copied ? copiedLabel : label}
</button>
