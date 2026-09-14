<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import DynamicIcon from "./DynamicIcon.svelte";
  import IconPickerInline from "./IconPickerInline.svelte";

  let {
    value,
    onchange,
    onclear = undefined,
    onselect = undefined,
    open: controlledOpen = undefined,
    onopenchange = undefined,
    side = "bottom",
    trigger = undefined,
  } = $props<{
    value: string | null | undefined;
    onchange: (next: string) => void;
    onclear?: () => void;
    onselect?: () => void;
    open?: boolean;
    onopenchange?: (open: boolean) => void;
    side?: "top" | "bottom";
    trigger?: Snippet;
  }>();

  let internalOpen = $state(false);
  let triggerEl = $state<HTMLButtonElement>();
  let layout = $state<"popover" | "dialog">("popover");
  let panelStyle = $state("");
  let isOpen = $derived(controlledOpen ?? internalOpen);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) internalOpen = next;
    onopenchange?.(next);
  };

  const chooseLayout = () => {
    if (!triggerEl || typeof window === "undefined") return;
    const rect = triggerEl.getBoundingClientRect();
    const edge = 12;
    const minHeight = 340;
    const above = rect.top - edge;
    const below = window.innerHeight - rect.bottom - edge;
    const useDialog = window.innerWidth < 360 || (above < minHeight && below < minHeight);
    layout = useDialog ? "dialog" : "popover";
    if (useDialog) return;
    const useTop = side === "top" ? above >= minHeight || below < minHeight : below < minHeight && above >= minHeight;
    const top = useTop ? Math.max(edge, rect.top - 526) : Math.min(window.innerHeight - edge - 520, rect.bottom + 6);
    const left = Math.max(edge, Math.min(window.innerWidth - edge - 360, rect.left));
    panelStyle = `top:${top}px;left:${left}px;max-height:${Math.max(340, useTop ? above : below)}px`;
  };

  const selected = () => {
    setOpen(false);
    onselect?.();
  };

  onMount(() => {
    const resize = () => { if (isOpen) chooseLayout(); };
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  });

  $effect(() => {
    if (isOpen) queueMicrotask(chooseLayout);
  });
</script>

<button
  bind:this={triggerEl}
  type="button"
  class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-2xl transition hover:bg-accent"
  aria-label="Change icon"
  aria-expanded={isOpen}
  onclick={() => setOpen(!isOpen)}
>
  {#if trigger}{@render trigger()}{:else}<DynamicIcon {value} size={24} />{/if}
</button>

{#if isOpen}
  <button class="fixed inset-0 z-40 cursor-default" aria-label="Close icon picker" onclick={() => setOpen(false)}></button>
  {#if layout === "dialog"}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div class="flex h-[min(560px,88dvh)] w-[min(400px,92vw)] flex-col rounded-xl border bg-background p-3 shadow-xl" role="dialog" aria-modal="true" aria-label="Choose an icon">
        <IconPickerInline {value} {onchange} {onclear} onselect={selected} />
      </div>
    </div>
  {:else}
    <section class="fixed z-50 flex w-[360px] flex-col overflow-hidden rounded-xl border bg-background p-3 shadow-xl" style={panelStyle} aria-label="Choose an icon">
      <IconPickerInline {value} {onchange} {onclear} onselect={selected} />
    </section>
  {/if}
{/if}
