"use client"
import * as React from "react"

export type SessionInfoEntry = {
  timestamp: number;
  level: string;
  message: string;
  meta?: Record<string, unknown>;
};

interface DebugStore {
  entries: SessionInfoEntry[];
  log: (entry: Omit<SessionInfoEntry, "timestamp">) => void;
  clear: () => void;
}

const noop = () => {};

export function useSessionDebugStore(): DebugStore {
  return { entries: [], log: noop, clear: noop };
}

export function SessionInfoTabs(_props: { className?: string }) {
  return null;
}
