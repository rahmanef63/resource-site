<script lang="ts">
  import type { CtaLink, PageBlock } from "../../pages-cms/types";
  type Pricing = Extract<PageBlock, { kind: "pricing-table" }>;
  type Tier = Pricing["tiers"][number];
  let { block, onChange }: { block: PageBlock; onChange: (next: PageBlock) => void } = $props();

  function patchImage(i: number, patch: Partial<{ src: string; alt: string }>) {
    if (block.kind !== "image-gallery") return;
    onChange({ ...block, images: block.images.map((image, j) => (j === i ? { ...image, ...patch } : image)) });
  }
  function patchTier(i: number, patch: Partial<Tier>) {
    if (block.kind !== "pricing-table") return;
    onChange({ ...block, tiers: block.tiers.map((tier, j) => (j === i ? { ...tier, ...patch } : tier)) });
  }
  function patchCta(i: number, patch: Partial<CtaLink>) {
    if (block.kind !== "pricing-table") return;
    const tier = block.tiers[i];
    patchTier(i, { cta: { label: tier.cta?.label ?? "", href: tier.cta?.href ?? "", ...patch } });
  }
</script>

<div class="space-y-3">
  {#if block.kind === "image-gallery"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <div class="space-y-2">
      {#each block.images as image, i}
        <div class="space-y-2 rounded-md border p-3">
          <div class="flex justify-between text-xs text-muted-foreground"><span>Image #{i + 1}</span><button type="button" onclick={() => onChange({ ...block, images: block.images.filter((_, j) => j !== i) })}>Remove</button></div>
          <input class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Source URL" value={image.src} oninput={(e) => patchImage(i, { src: e.currentTarget.value })} />
          <input class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Alt text" value={image.alt} oninput={(e) => patchImage(i, { alt: e.currentTarget.value })} />
        </div>
      {/each}
      <button class="rounded-md border px-3 py-2 text-xs" type="button" onclick={() => onChange({ ...block, images: [...block.images, { src: "", alt: "" }] })}>+ Add image</button>
    </div>
  {:else if block.kind === "pricing-table"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <div class="space-y-3">
      {#each block.tiers as tier, i}
        <div class="space-y-2 rounded-md border p-3">
          <div class="flex justify-between text-xs text-muted-foreground"><span>Tier #{i + 1}</span><button type="button" onclick={() => onChange({ ...block, tiers: block.tiers.filter((_, j) => j !== i) })}>Remove</button></div>
          <input class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Name" value={tier.name} oninput={(e) => patchTier(i, { name: e.currentTarget.value })} />
          <div class="grid gap-2 sm:grid-cols-2"><input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Price" value={tier.price} oninput={(e) => patchTier(i, { price: e.currentTarget.value })} /><input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Period" value={tier.period ?? ""} oninput={(e) => patchTier(i, { period: e.currentTarget.value })} /></div>
          <textarea class="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Bullets, one per line" value={tier.bullets.join("\n")} oninput={(e) => patchTier(i, { bullets: e.currentTarget.value.split("\n").filter(Boolean) })}></textarea>
          <div class="grid gap-2 sm:grid-cols-2"><input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="CTA label" value={tier.cta?.label ?? ""} oninput={(e) => patchCta(i, { label: e.currentTarget.value })} /><input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="CTA href" value={tier.cta?.href ?? ""} oninput={(e) => patchCta(i, { href: e.currentTarget.value })} /></div>
          <label class="flex items-center gap-2 text-xs"><input type="checkbox" checked={tier.featured ?? false} onchange={(e) => patchTier(i, { featured: e.currentTarget.checked })} /> Featured</label>
        </div>
      {/each}
      <button class="rounded-md border px-3 py-2 text-xs" type="button" onclick={() => onChange({ ...block, tiers: [...block.tiers, { name: "", price: "", bullets: [] }] })}>+ Add tier</button>
    </div>
  {/if}
</div>
