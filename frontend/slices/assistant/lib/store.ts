"use client";

import { useSyncExternalStore } from "react";
import {
  activeAgentOf,
  assistantStoreActions,
  getAssistantStoreServerSnapshot,
  getAssistantStoreSnapshot,
  subscribeAssistantStore,
} from "./store-core";

export type AIStore = ReturnType<typeof useAIStore>;

export function useAIStore() {
  const state = useSyncExternalStore(
    subscribeAssistantStore,
    getAssistantStoreSnapshot,
    getAssistantStoreServerSnapshot,
  );

  return {
    ...state,
    activeAgent: activeAgentOf(state),
    ...assistantStoreActions,
  };
}
