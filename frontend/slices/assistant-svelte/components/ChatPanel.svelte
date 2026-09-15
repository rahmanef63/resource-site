<script lang="ts">
  import { Send, Sparkles, User } from "@lucide/svelte";
  import { ASSISTANT_SUGGESTED } from "@/features/assistant/lib/chat-core";
  import type { ChatMessage } from "@/features/assistant/lib/types";

  let {
    messages,
    streaming,
    onsend,
  } = $props<{
    messages: ChatMessage[];
    streaming: boolean;
    onsend: (text: string) => void | Promise<void>;
  }>();

  let value = $state("");
  let canSend = $derived(value.trim().length > 0 && !streaming);

  const submit = () => {
    if (!canSend) return;
    const text = value.trim();
    value = "";
    void onsend(text);
  };
</script>

<div class="flex min-h-0 flex-1 flex-col">
  {#if messages.length === 0}
    <div class="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 text-center">
      <span class="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Sparkles size={24} />
      </span>
      <div class="space-y-1">
        <h2 class="text-base font-semibold">Ask Alfa</h2>
        <p class="text-sm text-muted-foreground">Your VPS copilot — describe a task and Alfa lays out the commands.</p>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        {#each ASSISTANT_SUGGESTED as prompt (prompt)}
          <button type="button" class="rounded-full bg-secondary px-3 py-1 text-xs hover:bg-secondary/70" onclick={() => void onsend(prompt)}>{prompt}</button>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      {#each messages as message (message.id)}
        {@const isUser = message.role === "user"}
        <div class={`flex w-full items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span class={`mt-0.5 grid size-7 flex-none place-items-center rounded-full ${isUser ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
            {#if isUser}<User size={14} />{:else}<Sparkles size={14} />{/if}
          </span>
          <div class={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isUser ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted text-foreground"}`}>
            {message.text || "…"}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="flex items-end gap-2 border-t bg-background/60 p-3 [padding-bottom:calc(0.75rem+var(--sai-bottom,0px))]">
    <textarea
      aria-label="Message"
      bind:value
      disabled={streaming}
      rows="1"
      placeholder={streaming ? "Alfa is replying…" : "Message Alfa…"}
      class="max-h-32 min-h-9 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      onkeydown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submit();
        }
      }}
    ></textarea>
    <button type="button" class="grid size-9 flex-none place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50" disabled={!canSend} aria-label="Send message" onclick={submit}>
      <Send size={16} />
    </button>
  </div>
</div>
