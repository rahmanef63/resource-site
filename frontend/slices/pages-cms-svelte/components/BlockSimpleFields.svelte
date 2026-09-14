<script lang="ts">
  import type { PageBlock } from "../../pages-cms/types";
  let { block, onChange }: { block: PageBlock; onChange: (next: PageBlock) => void } = $props();
</script>

<div class="space-y-3">
  {#if block.kind === "hero"}
    <label class="block space-y-1 text-xs"><span>Headline</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.headline} oninput={(e) => onChange({ ...block, headline: e.currentTarget.value })} /></label>
    <label class="block space-y-1 text-xs"><span>Sub-headline</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.sub ?? ""} oninput={(e) => onChange({ ...block, sub: e.currentTarget.value })} /></label>
    <div class="grid gap-2 sm:grid-cols-2">
      <label class="block space-y-1 text-xs"><span>CTA label</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.cta?.label ?? ""} oninput={(e) => onChange({ ...block, cta: { label: e.currentTarget.value, href: block.cta?.href ?? "#" } })} /></label>
      <label class="block space-y-1 text-xs"><span>CTA href</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.cta?.href ?? ""} oninput={(e) => onChange({ ...block, cta: { label: block.cta?.label ?? "", href: e.currentTarget.value } })} /></label>
    </div>
  {:else if block.kind === "text"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <label class="block space-y-1 text-xs"><span>Body</span><textarea class="min-h-32 w-full rounded-md border bg-background px-3 py-2" value={block.body} oninput={(e) => onChange({ ...block, body: e.currentTarget.value })}></textarea></label>
  {:else if block.kind === "cta"}
    <label class="block space-y-1 text-xs"><span>Headline</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.headline} oninput={(e) => onChange({ ...block, headline: e.currentTarget.value })} /></label>
    <label class="block space-y-1 text-xs"><span>Sub-headline</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.sub ?? ""} oninput={(e) => onChange({ ...block, sub: e.currentTarget.value })} /></label>
    <div class="grid gap-2 sm:grid-cols-2">
      <label class="block space-y-1 text-xs"><span>CTA label</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.cta.label} oninput={(e) => onChange({ ...block, cta: { ...block.cta, label: e.currentTarget.value } })} /></label>
      <label class="block space-y-1 text-xs"><span>CTA href</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.cta.href} oninput={(e) => onChange({ ...block, cta: { ...block.cta, href: e.currentTarget.value } })} /></label>
    </div>
  {:else if block.kind === "testimonial"}
    <label class="block space-y-1 text-xs"><span>Quote</span><textarea class="min-h-24 w-full rounded-md border bg-background px-3 py-2" value={block.quote} oninput={(e) => onChange({ ...block, quote: e.currentTarget.value })}></textarea></label>
    <label class="block space-y-1 text-xs"><span>Author</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.author} oninput={(e) => onChange({ ...block, author: e.currentTarget.value })} /></label>
    <label class="block space-y-1 text-xs"><span>Role</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.role ?? ""} oninput={(e) => onChange({ ...block, role: e.currentTarget.value })} /></label>
  {:else if block.kind === "video"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <label class="block space-y-1 text-xs"><span>Video source URL</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.src} oninput={(e) => onChange({ ...block, src: e.currentTarget.value })} /></label>
    <label class="block space-y-1 text-xs"><span>Caption</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.caption ?? ""} oninput={(e) => onChange({ ...block, caption: e.currentTarget.value })} /></label>
  {/if}
</div>
