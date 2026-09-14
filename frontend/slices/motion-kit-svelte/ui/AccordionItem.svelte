<script lang="ts">
  import type { Snippet } from "svelte";
  import { setAccordionItem } from "./accordion-context";

  type Props = { value: string; className?: string; children: Snippet };
  let { value, className = "", children }: Props = $props();
  setAccordionItem(() => value);
</script>

<div data-slot="accordion-item" class={`border-b last:border-b-0 ${className}`.trim()}>
  {@render children()}
</div>
