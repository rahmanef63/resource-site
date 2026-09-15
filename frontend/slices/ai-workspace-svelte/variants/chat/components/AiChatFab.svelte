<script lang="ts">
  import {
    AI_CHAT_SUGGESTIONS,
    chatHistory,
    initialChatMessage,
    type AiChatMessage,
    type AiChatSend,
  } from "@/features/ai-workspace/variants/chat/core";

  let { brand = "kami", chat }: { brand?: string; chat?: AiChatSend } = $props();
  let open = $state(false);
  let text = $state("");
  let pending = $state(false);
  let messages = $state<AiChatMessage[]>([]);
  let visibleMessages = $derived(messages.length ? messages : [initialChatMessage(brand)]);

  async function send(raw: string) {
    const question = raw.trim();
    if (!question || pending) return;
    const current = [...visibleMessages];
    const history = chatHistory(current);
    text = "";
    messages = [...current, { role: "user", text: question }];
    if (!chat) {
      messages = [...messages, {
        role: "assistant",
        text: "AI belum terhubung — pass the `chat` prop to wire the backend.",
        notice: true,
      }];
      return;
    }
    pending = true;
    try {
      const result = await chat({ prompt: question, history });
      messages = [...messages, result.ok && result.text
        ? { role: "assistant", text: result.text }
        : { role: "assistant", text: result.notice ?? "AI is unavailable right now.", notice: true }];
    } catch (error) {
      messages = [...messages, {
        role: "assistant",
        text: `Koneksi ke asisten gagal: ${error instanceof Error ? error.message : "unknown error"}`,
        notice: true,
      }];
    } finally {
      pending = false;
    }
  }
</script>

{#if open}
  <section class="fixed bottom-20 right-5 z-40 flex h-[26rem] w-[20rem] flex-col overflow-hidden rounded-xl border bg-card shadow-xl sm:w-[22rem]" aria-label={`Asisten ${brand}`}>
    <header class="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
      <strong class="text-sm">✦ Asisten {brand}</strong>
      <button type="button" class="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted" aria-label="Tutup" onclick={() => open = false}>×</button>
    </header>
    <div class="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
      {#each visibleMessages as message, index (`${message.role}-${index}-${message.text}`)}
        <div class={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div class={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : message.notice ? "border border-dashed bg-muted/40 text-muted-foreground" : "bg-muted"}`}>
            {message.text}
          </div>
        </div>
      {/each}
      {#if pending}<div class="flex justify-start"><div class="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">…</div></div>{/if}
      {#if visibleMessages.length <= 1}
        <div class="flex flex-wrap gap-2 pt-1">
          {#each AI_CHAT_SUGGESTIONS as suggestion (suggestion)}
            <button type="button" class="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground" onclick={() => send(suggestion)}>{suggestion}</button>
          {/each}
        </div>
      {/if}
    </div>
    <form class="flex items-center gap-2 border-t p-3" onsubmit={(event) => { event.preventDefault(); void send(text); }}>
      <input class="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm" bind:value={text} aria-label="Tulis pesan" placeholder="Tulis pesan…" disabled={pending} />
      <button type="submit" class="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground" aria-label="Kirim" disabled={pending}>→</button>
    </form>
  </section>
{/if}
<button type="button" class="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-primary text-lg text-primary-foreground shadow-xl" aria-label="Buka asisten AI" onclick={() => open = !open}>{open ? "×" : "✦"}</button>
