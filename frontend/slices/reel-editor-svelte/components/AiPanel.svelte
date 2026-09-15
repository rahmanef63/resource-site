<script lang="ts">
  import { AI_SUGGESTIONS } from "@/features/reel-editor/lib/ai-edit";
  import type { AiMessage } from "@/features/reel-editor/lib/ai-core";
  let { log, hasSelection, onSend } = $props<{ log: AiMessage[]; hasSelection: boolean; onSend: (text: string) => void }>();
  let value = $state("");
  function send(raw: string) { const text = raw.trim(); if (!text) return; onSend(text); value = ""; }
</script>
<div class="flex h-full min-h-0 flex-col gap-2 p-3">
  <strong class="text-xs uppercase tracking-wide text-muted-foreground">✦ AI Assistant</strong>
  <p class="text-[10px] text-muted-foreground">{hasSelection ? "Acting on the selected clip." : "Select a clip for clip-level edits."}</p>
  <div class="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
    {#each log as message, i (i)}
      <div class={`max-w-[94%] rounded-xl px-2.5 py-1.5 text-xs ${message.role === "user" ? "self-end bg-primary text-primary-foreground" : "self-start bg-secondary"}`}>{message.text}</div>
    {/each}
  </div>
  <div class="flex flex-wrap gap-1">{#each AI_SUGGESTIONS as suggestion}<button class="rounded-full border px-2 py-1 text-[10px]" onclick={() => send(suggestion)}>{suggestion}</button>{/each}</div>
  <div class="flex gap-1.5"><input class="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-xs" bind:value={value} placeholder="Describe an edit…" onkeydown={(e) => e.key === "Enter" && send(value)} /><button class="rounded bg-primary px-3 text-xs text-primary-foreground" onclick={() => send(value)}>Go</button></div>
</div>
