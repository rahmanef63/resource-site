<script lang="ts">
  import ImagePickerDialog from "./ImagePickerDialog.svelte";
  import { imageStyle } from "@/features/image-picker/lib/imageStyle";
  import { parseImage } from "@/features/image-picker/lib/parseImage";
  import { positionYFromClient } from "@/features/image-picker/lib/core";
  import type { ImageField, ImageValue, UnsplashSearchFn, UploadFn } from "@/features/image-picker/types";

  let {
    image,
    onChange,
    resolvedUrl,
    class: className = "",
    onUpload,
    searchUnsplash,
  }: {
    image: ImageField;
    onChange: (image: ImageValue | null) => void;
    resolvedUrl?: string | null;
    class?: string;
    onUpload?: UploadFn;
    searchUnsplash?: UnsplashSearchFn;
  } = $props();

  let pickerOpen = $state(false);
  let reposition = $state(false);
  let bannerElement: HTMLDivElement | undefined;
  let dragging = false;

  function captureBanner(element: HTMLDivElement) {
    bannerElement = element;
    return () => {
      if (bannerElement === element) bannerElement = undefined;
    };
  }
  let data = $derived(parseImage(image));
  let style = $derived(data ? imageStyle(data, resolvedUrl) : {});

  function updatePosition(clientY: number) {
    if (!data || !bannerElement) return;
    const rect = bannerElement.getBoundingClientRect();
    onChange({
      ...data,
      positionY: positionYFromClient(clientY, rect.top, rect.height),
    });
  }

  function startReposition(event: PointerEvent) {
    if (!reposition) return;
    dragging = true;
    updatePosition(event.clientY);
  }

  function moveReposition(event: PointerEvent) {
    if (dragging && reposition) updatePosition(event.clientY);
  }

  function stopReposition() {
    dragging = false;
  }
</script>

<svelte:window onpointermove={moveReposition} onpointerup={stopReposition} onpointercancel={stopReposition} />

{#if data}
  <div class="group/banner relative w-full shrink-0">
    <div
      {@attach captureBanner}
      onpointerdown={startReposition}
      class={`h-44 w-full md:h-56 ${reposition ? "cursor-ns-resize ring-2 ring-inset ring-primary" : ""} ${className}`}
      style:background={style.background}
      style:background-image={style.backgroundImage}
      style:background-size={style.backgroundSize}
      style:background-position={style.backgroundPosition}
      style:background-repeat={style.backgroundRepeat}
      role="slider"
      tabindex="0"
      aria-disabled={!reposition}
      aria-label="Image vertical focal point"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={Math.round(data.positionY ?? 50)}
      onkeydown={(event) => {
        if (!reposition) return;
        const delta = event.key === "ArrowUp" ? -5 : event.key === "ArrowDown" ? 5 : 0;
        if (!delta) return;
        event.preventDefault();
        onChange({ ...data, positionY: Math.max(0, Math.min(100, (data.positionY ?? 50) + delta)) });
      }}
    ></div>

    <div class={`absolute bottom-3 right-3 flex gap-1.5 transition ${reposition ? "opacity-100" : "opacity-0 group-hover/banner:opacity-100"}`}>
      {#if reposition}
        <button type="button" class="rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground" onclick={() => (reposition = false)}>Save position</button>
      {:else}
        <button type="button" class="rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground" onclick={() => (pickerOpen = true)}>Change</button>
        <button type="button" class="rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground" onclick={() => (reposition = true)}>Reposition</button>
        <button type="button" class="rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground" aria-label="Remove image" onclick={() => onChange(null)}>Remove</button>
      {/if}
    </div>

    <ImagePickerDialog bind:open={pickerOpen} onSelect={onChange} {onUpload} {searchUnsplash} />
  </div>
{/if}
