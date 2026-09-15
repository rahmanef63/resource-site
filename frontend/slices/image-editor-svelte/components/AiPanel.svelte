<script lang="ts">
  import type { BrowserEditorCore } from "@/features/image-editor/lib/editor-core";
  import { EDITOR_TOOLS } from "@/features/image-editor/commands/registry";
  import { invokeEditorCommand, type ToolInvocation } from "@/features/image-editor/commands/invoke";
  import { describeDoc } from "@/features/image-editor/commands/schema";
  import type { ImageEditorAssistantRunner, ImageEditorMessage } from "@/features/image-editor/lib/assistant-core";

  let { editor, runner } = $props<{ editor: BrowserEditorCore; runner?: ImageEditorAssistantRunner }>();
  let messages = $state<ImageEditorMessage[]>([{ role: "assistant", text: "Describe an edit. I can use the same local image-editor command registry as the React assistant." }]);
  let value = $state("");
  let busy = $state(false);

  async function send() {
    const prompt=value.trim(); if(!prompt||busy)return;
    messages=[...messages,{role:"user",text:prompt}]; value="";
    if(!runner){messages=[...messages,{role:"assistant",text:"AI transport is not configured. Pass runAssistant to ImageEditor to enable model turns; local command tools remain available to the host."}];return;}
    busy=true;
    try {
      const text=await runner({messages,tools:EDITOR_TOOLS,readback:describeDoc(editor),ctx:editor,invoke:(call: ToolInvocation)=>invokeEditorCommand(editor,call)});
      messages=[...messages,{role:"assistant",text:text||"Done."}];
    } catch(cause) { messages=[...messages,{role:"assistant",text:cause instanceof Error?cause.message:"Assistant request failed."}]; }
    finally { busy=false; }
  }
</script>
<div class="flex h-full min-h-0 flex-col p-3">
  <strong class="text-xs uppercase tracking-wide text-muted-foreground">AI Assistant</strong>
  <p class="mt-1 text-[10px] text-muted-foreground">{describeDoc(editor)}</p>
  <div class="my-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
    {#each messages as message,i (i)}<div class={`max-w-[94%] rounded-xl px-2.5 py-1.5 text-xs ${message.role==="user"?"self-end bg-primary text-primary-foreground":"self-start bg-secondary"}`}>{message.text}</div>{/each}
    {#if busy}<p class="text-xs text-muted-foreground">Working…</p>{/if}
  </div>
  <div class="flex gap-1.5"><input class="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-xs" bind:value={value} placeholder="e.g. make the selected layer 50% opacity" onkeydown={(e)=>e.key==="Enter"&&void send()} /><button class="rounded bg-primary px-3 text-xs text-primary-foreground disabled:opacity-40" disabled={busy||!value.trim()} onclick={()=>void send()}>Send</button></div>
</div>
