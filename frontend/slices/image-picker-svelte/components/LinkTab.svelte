<script lang="ts">
  import { validateImageLink } from "@/features/image-picker/lib/core";
  import type { ImageValue } from "@/features/image-picker/types";

  let { onSelect }: { onSelect: (image: ImageValue) => void } = $props();
  let url = $state("");
  let verifying = $state(false);
  let error = $state<string | null>(null);

  async function submit() {
    const value = url.trim();
    const problem = validateImageLink(value);
    if (problem) {
      error = problem;
      return;
    }
    error = null;
    verifying = true;
    await new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = value;
    });
    verifying = false;
    onSelect({ type: "link", value, positionY: 50 });
  }
</script>

<div class="space-y-3 p-4">
  <input
    class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
    placeholder="https://images.example.com/photo.jpg"
    bind:value={url}
    onkeydown={(event) => { if (event.key === "Enter") void submit(); }}
  />
  {#if error}<p class="text-xs text-destructive">{error}</p>{/if}
  <button type="button" class="h-9 w-full rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50" disabled={verifying} onclick={() => void submit()}>
    {verifying ? "Checking…" : "Add image"}
  </button>
  <p class="text-[11px] text-muted-foreground">Works with any public image URL.</p>
</div>
