"use client";

import { ChatFab } from "./components/chat-fab";
import type { AiRouterRoute } from "./lib/core";

const previewRoute: AiRouterRoute = async ({ tier, prompt }) => ({
  ok: true,
  text: `Preview adapter (${tier}) received: ${prompt}`,
});

function ChatFabPreview() {
  return (
    <main className="min-h-[28rem] rounded-xl border border-border bg-background p-6">
      <div className="max-w-xl space-y-2">
        <h2 className="text-lg font-semibold">AI Router ChatFab</h2>
        <p className="text-sm text-muted-foreground">
          This preview injects a deterministic local adapter. It never calls OpenRouter. Open the chat button to exercise the real component state and request contract.
        </p>
      </div>
      <ChatFab route={previewRoute} feature="preview" title="AI Router preview" />
    </main>
  );
}

export default { ChatFab: ChatFabPreview };
