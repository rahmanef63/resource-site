<script lang="ts">
  import { GALLERY_SECTIONS } from "@/features/image-picker/lib/galleryPresets";
  import { imageStyle } from "@/features/image-picker/lib/imageStyle";
  import type { ImageValue } from "@/features/image-picker/types";

  let { onSelect }: { onSelect: (image: ImageValue) => void } = $props();
</script>

<div class="space-y-4 p-4">
  {#each GALLERY_SECTIONS as section (section.label)}
    <section>
      <p class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</p>
      <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {#each section.items as item, index (`${item.type}:${item.value}`)}
          {@const style = imageStyle(item)}
          <button
            type="button"
            aria-label={`${section.label} ${index + 1}`}
            class="h-12 w-full rounded-md ring-1 ring-border transition hover:ring-2 hover:ring-primary"
            style:background={style.background}
            style:background-image={style.backgroundImage}
            style:background-size={style.backgroundSize}
            style:background-position={style.backgroundPosition}
            style:background-repeat={style.backgroundRepeat}
            onclick={() => onSelect(item)}
          ></button>
        {/each}
      </div>
    </section>
  {/each}
</div>
