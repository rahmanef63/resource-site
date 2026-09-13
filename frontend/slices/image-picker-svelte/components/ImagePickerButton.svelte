<script lang="ts">
  import type { Snippet } from "svelte";
  import ImagePickerDialog from "./ImagePickerDialog.svelte";
  import type { ImageValue, UnsplashSearchFn, UploadFn } from "@/features/image-picker/types";

  type Variant = "default" | "outline" | "secondary" | "ghost";
  type Size = "sm" | "default";

  let {
    onChange,
    label = "Choose image",
    title,
    trigger,
    class: className = "",
    variant = "outline",
    size = "sm",
    onUpload,
    searchUnsplash,
    defaultQuery,
  }: {
    onChange: (image: ImageValue) => void;
    label?: string;
    title?: string;
    trigger?: Snippet<[() => void]>;
    class?: string;
    variant?: Variant;
    size?: Size;
    onUpload?: UploadFn;
    searchUnsplash?: UnsplashSearchFn;
    defaultQuery?: string;
  } = $props();

  let open = $state(false);
  let variantClass = $derived(
    variant === "default"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : variant === "secondary"
        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        : variant === "ghost"
          ? "hover:bg-muted"
          : "border border-input bg-background hover:bg-muted",
  );
  let sizeClass = $derived(size === "default" ? "h-10 px-4" : "h-8 px-3 text-xs");

  function openPicker() {
    open = true;
  }
</script>

{#if trigger}
  {@render trigger(openPicker)}
{:else}
  <button
    type="button"
    class={`inline-flex items-center justify-center rounded-md text-sm font-medium transition ${variantClass} ${sizeClass} ${className}`}
    onclick={openPicker}
  >
    <span class="mr-1.5" aria-hidden="true">▧</span>{label}
  </button>
{/if}

<ImagePickerDialog
  bind:open
  onSelect={onChange}
  {onUpload}
  {searchUnsplash}
  {title}
  {defaultQuery}
/>
