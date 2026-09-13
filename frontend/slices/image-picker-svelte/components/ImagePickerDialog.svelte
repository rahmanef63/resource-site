<script lang="ts">
  import { onMount } from "svelte";
  import GalleryTab from "./GalleryTab.svelte";
  import LinkTab from "./LinkTab.svelte";
  import UnsplashTab from "./UnsplashTab.svelte";
  import UploadTab from "./UploadTab.svelte";
  import { pickerTabLabel, pickerTabs, type ImagePickerTab } from "@/features/image-picker/lib/core";
  import type { ImageValue, UnsplashSearchFn, UploadFn } from "@/features/image-picker/types";

  let {
    open = $bindable(false),
    onSelect,
    onUpload,
    searchUnsplash,
    title = "Choose image",
    defaultQuery,
  }: {
    open?: boolean;
    onSelect: (image: ImageValue) => void;
    onUpload?: UploadFn;
    searchUnsplash?: UnsplashSearchFn;
    title?: string;
    defaultQuery?: string;
  } = $props();

  let tab = $state<ImagePickerTab>("gallery");
  let tabs = $derived(pickerTabs(Boolean(onUpload)));
  let visibleTab = $derived<ImagePickerTab>(tabs.includes(tab) ? tab : "gallery");

  function close() {
    open = false;
  }

  function choose(image: ImageValue) {
    onSelect(image);
    close();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (open && event.key === "Escape") close();
  }

  onMount(() => {
    if (defaultQuery) tab = "unsplash";
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50 grid place-items-center p-4">
    <button
      type="button"
      class="absolute inset-0 bg-black/55"
      aria-label="Close image picker"
      onclick={close}
    ></button>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      class="relative z-10 flex max-h-[min(88vh,620px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
    >
      <header class="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 class="text-sm font-semibold">{title}</h2>
        <button type="button" class="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" onclick={close} aria-label="Close">×</button>
      </header>

      <div class="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
        {#each tabs as item (item)}
          <button
            type="button"
            class={visibleTab === item
              ? "rounded-md bg-accent px-3 py-1 text-xs font-medium text-foreground"
              : "rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent/50"}
            onclick={() => (tab = item)}
          >
            {pickerTabLabel(item)}
          </button>
        {/each}
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        {#if visibleTab === "gallery"}
          <GalleryTab onSelect={choose} />
        {:else if visibleTab === "upload" && onUpload}
          <UploadTab onSelect={choose} {onUpload} />
        {:else if visibleTab === "link"}
          <LinkTab onSelect={choose} />
        {:else}
          <UnsplashTab onSelect={choose} {searchUnsplash} {defaultQuery} />
        {/if}
      </div>
    </div>
  </div>
{/if}
