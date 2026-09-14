<script lang="ts">
  import type { PageBlock } from "../../pages-cms/types";
  let { block, onChange }: { block: PageBlock; onChange: (next: PageBlock) => void } = $props();

  function patchFeature(i: number, patch: Partial<{ title: string; body: string }>) {
    if (block.kind !== "feature-list") return;
    onChange({ ...block, items: block.items.map((item, j) => (j === i ? { ...item, ...patch } : item)) });
  }
  function patchFaq(i: number, patch: Partial<{ q: string; a: string }>) {
    if (block.kind !== "faq") return;
    onChange({ ...block, items: block.items.map((item, j) => (j === i ? { ...item, ...patch } : item)) });
  }
  function patchStat(i: number, patch: Partial<{ value: string; label: string }>) {
    if (block.kind !== "stats") return;
    onChange({ ...block, items: block.items.map((item, j) => (j === i ? { ...item, ...patch } : item)) });
  }
  function patchLogo(i: number, patch: Partial<{ label: string; alt?: string }>) {
    if (block.kind !== "logo-cloud") return;
    onChange({ ...block, logos: block.logos.map((item, j) => (j === i ? { ...item, ...patch } : item)) });
  }
</script>

<div class="space-y-3">
  {#if block.kind === "feature-list"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <div class="space-y-2">
      {#each block.items as item, i}
        <div class="space-y-2 rounded-md border p-3">
          <div class="flex justify-between text-xs text-muted-foreground"><span>#{i + 1}</span><button type="button" onclick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>Remove</button></div>
          <input class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Title" value={item.title} oninput={(e) => patchFeature(i, { title: e.currentTarget.value })} />
          <textarea class="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Body" value={item.body} oninput={(e) => patchFeature(i, { body: e.currentTarget.value })}></textarea>
        </div>
      {/each}
      <button class="rounded-md border px-3 py-2 text-xs" type="button" onclick={() => onChange({ ...block, items: [...block.items, { title: "", body: "" }] })}>+ Add row</button>
    </div>
  {:else if block.kind === "faq"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <div class="space-y-2">
      {#each block.items as item, i}
        <div class="space-y-2 rounded-md border p-3">
          <div class="flex justify-between text-xs text-muted-foreground"><span>#{i + 1}</span><button type="button" onclick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>Remove</button></div>
          <input class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Question" value={item.q} oninput={(e) => patchFaq(i, { q: e.currentTarget.value })} />
          <textarea class="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Answer" value={item.a} oninput={(e) => patchFaq(i, { a: e.currentTarget.value })}></textarea>
        </div>
      {/each}
      <button class="rounded-md border px-3 py-2 text-xs" type="button" onclick={() => onChange({ ...block, items: [...block.items, { q: "", a: "" }] })}>+ Add question</button>
    </div>
  {:else if block.kind === "stats"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <div class="space-y-2">
      {#each block.items as item, i}
        <div class="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]">
          <input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Value" value={item.value} oninput={(e) => patchStat(i, { value: e.currentTarget.value })} />
          <input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Label" value={item.label} oninput={(e) => patchStat(i, { label: e.currentTarget.value })} />
          <button class="text-xs text-muted-foreground" type="button" onclick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>Remove</button>
        </div>
      {/each}
      <button class="rounded-md border px-3 py-2 text-xs" type="button" onclick={() => onChange({ ...block, items: [...block.items, { value: "", label: "" }] })}>+ Add stat</button>
    </div>
  {:else if block.kind === "logo-cloud"}
    <label class="block space-y-1 text-xs"><span>Heading</span><input class="w-full rounded-md border bg-background px-3 py-2" value={block.heading ?? ""} oninput={(e) => onChange({ ...block, heading: e.currentTarget.value })} /></label>
    <div class="space-y-2">
      {#each block.logos as logo, i}
        <div class="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]">
          <input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Label" value={logo.label} oninput={(e) => patchLogo(i, { label: e.currentTarget.value })} />
          <input class="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Alt text" value={logo.alt ?? ""} oninput={(e) => patchLogo(i, { alt: e.currentTarget.value })} />
          <button class="text-xs text-muted-foreground" type="button" onclick={() => onChange({ ...block, logos: block.logos.filter((_, j) => j !== i) })}>Remove</button>
        </div>
      {/each}
      <button class="rounded-md border px-3 py-2 text-xs" type="button" onclick={() => onChange({ ...block, logos: [...block.logos, { label: "", alt: "" }] })}>+ Add logo</button>
    </div>
  {/if}
</div>
