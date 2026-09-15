<script lang="ts">
  import { onMount } from "svelte";
  import { ChevronDown, Plus } from "@lucide/svelte";
  import {
    assistantErrorText,
    automationDemoMessage,
    automationPrompt,
    nextChatId,
    runAssistantTurn,
  } from "@/features/assistant/lib/chat-core";
  import { isAgentStreamConfigured } from "@/shared/agentic/host";
  import {
    activeAgentOf,
    assistantStoreActions,
    getAssistantStoreServerSnapshot,
    getAssistantStoreSnapshot,
    subscribeAssistantStore,
    type AssistantStoreState,
  } from "@/features/assistant/lib/store-core";
  import type { Agent, Automation, ChatMessage, Skill } from "@/features/assistant/lib/types";
  import { toolsForAgent } from "@/features/assistant/lib/tools";
  import AutomationForm from "./AutomationForm.svelte";
  import ChatPanel from "./ChatPanel.svelte";
  import GlyphTile from "./GlyphTile.svelte";
  import ItemForm from "./ItemForm.svelte";
  import LibraryView from "./LibraryView.svelte";

  type Tab = "chat" | "agents" | "skills" | "automations";
  type FormState =
    | { kind: "agent"; item?: Agent }
    | { kind: "skill"; item?: Skill }
    | { kind: "automation"; item?: Automation }
    | null;

  const tabs: Array<[Tab, string]> = [
    ["chat", "Chat"],
    ["agents", "Agents"],
    ["skills", "Skills"],
    ["automations", "Automations"],
  ];

  let storeState = $state<AssistantStoreState>(getAssistantStoreServerSnapshot());
  let tab = $state<Tab>("chat");
  let form = $state<FormState>(null);
  let messages = $state<ChatMessage[]>([]);
  let streaming = $state(false);
  let agent = $derived(activeAgentOf(storeState));
  let agentTools = $derived(toolsForAgent(agent, storeState.skills).length);

  onMount(() => {
    storeState = getAssistantStoreSnapshot();
    return subscribeAssistantStore(() => { storeState = getAssistantStoreSnapshot(); });
  });

  const send = async (text: string) => {
    if (streaming || !text.trim()) return;
    const currentAgent = agent;
    const history = [...messages];
    const user: ChatMessage = { id: nextChatId(), role: "user", text: text.trim() };
    const replyId = nextChatId();
    messages = [...messages, user, { id: replyId, role: "assistant", text: "" }];
    streaming = true;
    const append = (chunk: string) => {
      messages = messages.map((message: ChatMessage) =>
        message.id === replyId ? { ...message, text: message.text + chunk } : message,
      );
    };
    try {
      await runAssistantTurn(currentAgent, history, text.trim(), { onDelta: append });
    } catch (error) {
      messages = messages.map((message: ChatMessage) =>
        message.id === replyId ? { ...message, text: assistantErrorText(error) } : message,
      );
    } finally {
      streaming = false;
    }
  };

  const runAutomation = (auto: Automation) => {
    tab = "chat";
    const runAgent = storeState.agents.find((item: Agent) => item.id === auto.agentId) ?? agent;
    if (isAgentStreamConfigured()) {
      void send(automationPrompt(auto));
      return;
    }
    messages = [
      ...messages,
      { id: nextChatId(), role: "assistant", text: automationDemoMessage(auto, runAgent) },
    ];
  };
</script>

<div class="flex h-full min-h-0 flex-col bg-background">
  {#if form?.kind === "agent" || form?.kind === "skill"}
    <ItemForm kind={form.kind} state={storeState} item={form.item} onclose={() => { form = null; }} />
  {:else if form?.kind === "automation"}
    <AutomationForm state={storeState} item={form.item} onclose={() => { form = null; }} />
  {:else}
    <header class="flex items-center gap-2 overflow-x-auto border-b border-border bg-card/40 px-3 py-2 [scrollbar-width:none]">
      <div class="flex items-center gap-2 rounded-lg p-1 pr-2">
        <GlyphTile glyph={agent.glyph} color={agent.color} size={30} />
        <div class="leading-tight"><div class="text-[13px] font-semibold">{agent.name}</div><div class="text-[10px] text-muted-foreground">{agent.allTools ? "Generalist" : `${agent.skills.length} skills`} · {agentTools} tools</div></div>
        <ChevronDown size={14} class="text-muted-foreground" />
        <select class="absolute h-8 w-36 cursor-pointer opacity-0" aria-label="Active agent" value={storeState.activeAgentId} onchange={(event) => assistantStoreActions.setActiveAgentId(event.currentTarget.value)}>
          {#each storeState.agents as item (item.id)}<option value={item.id}>{item.name}</option>{/each}
        </select>
      </div>
      <button type="button" class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-accent" onclick={() => { form = { kind: "agent" }; }}><Plus size={13} />Agent</button>
      <div class="flex-1"></div>
      <nav class="inline-flex shrink-0 items-center gap-1 rounded-lg bg-secondary p-0.5" aria-label="Assistant tabs">
        {#each tabs as [value, label] (value)}
          <button type="button" class={`rounded-md px-3 py-1 text-xs font-medium ${tab === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`} onclick={() => { tab = value; }}>{label}</button>
        {/each}
      </nav>
    </header>

    {#if tab === "chat"}
      <ChatPanel {messages} {streaming} onsend={send} />
    {:else if tab === "agents"}
      <LibraryView kind="agent" state={storeState} onnew={() => { form = { kind: "agent" }; }} onedit={(item) => { form = { kind: "agent", item: item as Agent }; }} />
    {:else if tab === "skills"}
      <LibraryView kind="skill" state={storeState} onnew={() => { form = { kind: "skill" }; }} onedit={(item) => { form = { kind: "skill", item: item as Skill }; }} />
    {:else}
      <LibraryView kind="automation" state={storeState} onnew={() => { form = { kind: "automation" }; }} onedit={(item) => { form = { kind: "automation", item: item as Automation }; }} onrun={runAutomation} />
    {/if}
  {/if}
</div>
