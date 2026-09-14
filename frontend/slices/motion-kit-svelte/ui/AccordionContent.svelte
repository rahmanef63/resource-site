<script lang="ts">
  import type { Snippet } from "svelte";
  import { getAccordionContext, getAccordionItem } from "./accordion-context";

  type Props = { className?: string; children: Snippet };
  let { className = "", children }: Props = $props();
  const accordion = getAccordionContext();
  const item = getAccordionItem();
  const openStore = accordion.open;
  let open = $derived($openStore.has(item.value()));
</script>

{#if open}
  <div
    id={`accordion-${item.id()}-content`}
    data-slot="accordion-content"
    data-state="open"
    class="motion-accordion-content overflow-hidden text-sm"
  >
    <div class={`pt-0 pb-4 ${className}`.trim()}>{@render children()}</div>
  </div>
{/if}
