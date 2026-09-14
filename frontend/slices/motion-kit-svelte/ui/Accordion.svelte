<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import { setAccordionContext, type AccordionType } from "./accordion-context";

  type Props = {
    type?: AccordionType;
    collapsible?: boolean;
    defaultValue?: string | string[];
    className?: string;
    children: Snippet;
  };
  let {
    type = "single",
    collapsible = true,
    defaultValue,
    className = "",
    children,
  }: Props = $props();
  const initialValue = untrack(() => defaultValue);
  setAccordionContext({
    type: () => type,
    collapsible: () => collapsible,
    defaultValue: initialValue,
  });
</script>

<div data-slot="accordion" class={className}>{@render children()}</div>
