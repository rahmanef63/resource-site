# assistant — agent workspace with streaming chat

Streaming chat + a library where users create and manage **agents** (persona,
avatar, system prompt), **skills**, and **automations** (trigger + schedule) —
all persisted in localStorage. Presets ship as starting points.

## Mount

```tsx
import { Assistant } from "@/features/assistant";

<div className="h-dvh"><Assistant /></div>
// Unwired → a typing demo stream answers, so the whole UI works offline.
```

Or hand `assistantApp` (lazy `load`) to an appshell-style launcher.

## Wire a real model (`lib/host.ts`)

```ts
import { configureAssistantStream } from "@/features/assistant";

// Anything that yields text deltas works — SSE endpoint, AI SDK, agent loop:
configureAssistantStream(async function* (messages) {
  const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages }) });
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield dec.decode(value, { stream: true });
  }
});
```

Throw `Error("no_api_key")` / `Error("unauthorized")` from the stream to get
the chat's friendly error notes. Everything else imports ONLY this seam.
