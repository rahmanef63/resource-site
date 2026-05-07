"use client"
import * as React from "react"

export type SessionInfoEntry = {
  timestamp: number;
  level: string;
  message: string;
  meta?: Record<string, unknown>;
};

export type AgentTrace = {
  id: string;
  agent?: string;
  prompt?: string;
  response?: unknown;
  startedAt?: number;
  completedAt?: number;
  status?: string;
  timestamp?: number;
  meta?: Record<string, unknown>;
  [k: string]: unknown;
};

type LogArgs =
  | [Omit<SessionInfoEntry, "timestamp">]
  | [level: string, source: string, message: string, meta?: Record<string, unknown>];

interface DebugStore {
  entries: SessionInfoEntry[];
  traces: AgentTrace[];
  isDebugging: boolean;
  log: (...args: LogArgs) => void;
  addAgentTrace: (trace: Omit<AgentTrace, "id"> & { id?: string }) => string;
  completeAgentTrace: (
    id: string,
    response?: unknown,
    metaOrStatus?: Record<string, unknown> | string,
    status?: string,
  ) => void;
  addToolCallTrace: (trace: Record<string, unknown>) => string;
  completeToolCall: (
    id: string,
    result?: unknown,
    metaOrStatus?: Record<string, unknown> | string,
    status?: string,
  ) => void;
  clear: () => void;
}

const noop = () => {};

const debugStoreSingleton: DebugStore = {
  entries: [],
  traces: [],
  isDebugging: false,
  log: noop,
  addAgentTrace: () => Math.random().toString(36).slice(2),
  completeAgentTrace: noop,
  addToolCallTrace: () => Math.random().toString(36).slice(2),
  completeToolCall: noop,
  clear: noop,
};

export interface SessionDebugStoreHook {
  (): DebugStore;
  getState: () => DebugStore;
  setState: (partial: Partial<DebugStore>) => void;
  subscribe: (listener: (state: DebugStore) => void) => () => void;
}

export const useSessionDebugStore: SessionDebugStoreHook = Object.assign(
  () => debugStoreSingleton,
  {
    getState: () => debugStoreSingleton,
    setState: (_partial: Partial<DebugStore>) => {},
    subscribe: (_listener: (state: DebugStore) => void) => () => {},
  },
);

export interface SessionInfoTabsProps {
  className?: string;
  session?: unknown;
  onClose?: () => void;
  defaultTab?: string;
  tabs?: string[];
}

export function SessionInfoTabs(_props: SessionInfoTabsProps) {
  return null;
}
