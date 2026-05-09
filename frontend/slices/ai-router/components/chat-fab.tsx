"use client";

// Floating chat button — wires to api.ai.actions.callModel({ tier: "mid", prompt }).

import { Button } from "@/components/ui/button";

export function ChatFab() {
  return (
    <Button
      size="lg"
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full p-0 shadow-lg"
      onClick={() => alert("(stub) open chat panel")}
    >
      AI
    </Button>
  );
}
