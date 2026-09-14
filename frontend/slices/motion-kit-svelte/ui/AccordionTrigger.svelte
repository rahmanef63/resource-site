<script lang="ts">
  import type { Snippet } from "svelte";
  import { getAccordionContext, getAccordionItem } from "./accordion-context";

  type Props = { className?: string; disabled?: boolean; children: Snippet };
  let { className = "", disabled = false, children }: Props = $props();
  const accordion = getAccordionContext();
  const item = getAccordionItem();
  const openStore = accordion.open;
  let open = $derived($openStore.has(item.value()));
</script>

<button
  type="button"
  data-slot="accordion-trigger"
  data-state={open ? "open" : "closed"}
  class={`flex w-full items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`.trim()}
  aria-expanded={open}
  aria-controls={`accordion-${item.id()}-content`}
  {disabled}
  onclick={() => accordion.toggle(item.value())}
>
  <span>{@render children()}</span>
  <svg
    viewBox="0 0 24 24"
    class={`size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`.trim()}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</button>
