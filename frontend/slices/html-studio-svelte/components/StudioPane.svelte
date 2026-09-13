<script lang="ts">
  import { DEVICE_W, HTML_SANDBOX, type Device } from "@/features/html-studio/lib/core";
  let { html = $bindable(), preview, showEditor, showPreview, device, onCycleDevice }: {
    html: string; preview: string; showEditor: boolean; showPreview: boolean; device: Device; onCycleDevice: () => void;
  } = $props();
  let previewWidth = $derived(DEVICE_W[device]);
</script>

{#if showEditor}
  <textarea bind:value={html} spellcheck="false" placeholder="<!doctype html> …" class={`h-full min-h-0 min-w-0 resize-none border-0 bg-muted p-3 font-mono text-xs leading-relaxed text-foreground outline-none ${showPreview ? "w-1/2" : "flex-1"}`}></textarea>
{/if}
{#if showPreview}
  <section class={`flex min-h-0 min-w-0 flex-col bg-muted ${showEditor ? "w-1/2" : "flex-1"}`}>
    <div class="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1">
      {#if showEditor}
        <span class="font-mono text-[10px] text-muted-foreground">preview</span>
      {:else}
        <button type="button" class="h-6 rounded px-1.5 text-[11px] capitalize hover:bg-background" onclick={onCycleDevice}>Width: {device}</button>
        <span class="ml-auto font-mono text-[10px] text-muted-foreground">{previewWidth ? `${previewWidth}px` : "responsive"}</span>
      {/if}
    </div>
    <div class="flex min-h-0 flex-1 justify-center overflow-hidden bg-background">
      <iframe sandbox={HTML_SANDBOX} srcdoc={preview} title="HTML preview" style:max-width={previewWidth ? `${previewWidth}px` : undefined} class="h-full w-full border-0"></iframe>
    </div>
  </section>
{/if}
