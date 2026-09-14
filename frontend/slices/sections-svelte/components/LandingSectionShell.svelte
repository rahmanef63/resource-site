<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LandingSection } from "../../sections/types";
  type Props = { section: LandingSection; defaultClassName?: string; children: Snippet };
  let { section, defaultClassName = "", children }: Props = $props();
  let classes = $derived(["relative", defaultClassName, section.className ?? "", section.bgImageUrl ? "isolate overflow-hidden text-foreground" : ""].filter(Boolean).join(" "));
</script>

<section class={classes}>
  {#if section.bgImageUrl}
    <img src={section.bgImageUrl} alt="" aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover" onerror={(event) => { event.currentTarget.style.display = "none"; }} />
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/10 to-background/60"></div>
  {/if}
  {@render children()}
</section>
