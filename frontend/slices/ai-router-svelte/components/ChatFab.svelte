<script lang="ts">
  import {
    assistantMessage,
    greetingMessage,
    routePrompt,
    userMessage,
    type AiRouterMessage,
    type AiRouterRoute,
    type RouteTier,
  } from "../../ai-router/lib/core";

  type Props = {
    route?: AiRouterRoute;
    feature?: string;
    tier?: RouteTier;
    greeting?: string;
    title?: string;
    placeholder?: string;
  };

  let {
    route,
    feature = "chat-fab",
    tier = "mid",
    greeting = "Hi — how can I help you?",
    title = "Chat",
    placeholder = "Type a message…",
  }: Props = $props();

  let open = $state(false);
  let history = $state.raw<AiRouterMessage[]>([]);
  let input = $state("");
  let pending = $state(false);
  let messages = $derived([greetingMessage(greeting), ...history]);

  async function send(event: SubmitEvent) {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || pending) return;
    const stamp = Date.now();
    history = [...history, userMessage(`u-${stamp}`, prompt)];
    input = "";
    pending = true;

    try {
      const result = await routePrompt(route, { feature, tier, prompt });
      history = [...history, assistantMessage(`a-${stamp}`, result)];
    } catch (error) {
      history = [
        ...history,
        {
          id: `err-${stamp}`,
          role: "assistant",
          content: `(error) ${error instanceof Error ? error.message : "unknown"}`,
        },
      ];
    } finally {
      pending = false;
    }
  }
</script>

{#if !open}
  <button
    type="button"
    class="fixed bottom-4 right-4 z-50 grid size-12 place-items-center rounded-full bg-foreground text-background shadow-lg"
    aria-label="Open chat"
    onclick={() => (open = true)}
  >
    <span aria-hidden="true">✦</span>
  </button>
{:else}
  <section class="fixed bottom-4 right-4 z-50 flex h-[28rem] w-[20rem] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl sm:w-[24rem]" aria-label={title}>
    <header class="flex items-center justify-between border-b border-border px-4 py-2">
      <div class="flex items-center gap-2">
        <span aria-hidden="true">✦</span>
        <span class="text-sm font-medium">{title}</span>
        <span class="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{tier}</span>
      </div>
      <button type="button" class="grid size-7 place-items-center rounded hover:bg-muted" aria-label="Close chat" onclick={() => (open = false)}>×</button>
    </header>

    <div class="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
      {#each messages as message (message.id)}
        <div
          class={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-foreground text-background" : "bg-muted text-foreground"}`}
        >
          {message.content}
        </div>
      {/each}
      {#if pending}
        <div class="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">…</div>
      {/if}
    </div>

    <form class="flex gap-2 border-t border-border p-2" onsubmit={send}>
      <label class="sr-only" for="ai-router-message">Message</label>
      <input
        id="ai-router-message"
        class="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={input}
        oninput={(event) => (input = event.currentTarget.value)}
        placeholder={placeholder}
        disabled={pending}
      />
      <button
        type="submit"
        class="rounded-md bg-foreground px-3 py-2 text-sm text-background disabled:cursor-not-allowed disabled:opacity-50"
        disabled={pending || !input.trim()}
        aria-label="Send"
      >
        ↑
      </button>
    </form>
  </section>
{/if}
