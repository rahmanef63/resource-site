"use client";

import { Assistant } from "@/features/assistant";

// Live preview: streaming chat (typing demo stream) + the agents/skills/
// automations library — everything persists in localStorage. Real model:
// configureAssistantStream(async function* (messages) { yield deltas; }).

export default function AssistantPreview() {
  return (
    <div className="h-dvh w-full">
      <Assistant />
    </div>
  );
}
