"use client";

import { useSyncExternalStore } from "react";

// Module-level toast store — same external-store pattern as lib/store.ts.
// Other slices import `toast` from the barrel to fire transient notifications;
// <ToastHost> reads them via `useToasts` and renders the stack.

export type ToastTone = "default" | "success" | "error";

/** Optional inline action button (e.g. "Reload" on a new-version toast). */
export type ToastAction = { label: string; onClick: () => void };

export type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
};

export type ToastOptions = {
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. Default ~3.5s. Pass 0 to keep it sticky. */
  duration?: number;
  /** Inline action button. A toast with an action defaults to sticky. */
  action?: ToastAction;
};

type Listener = () => void;

let toasts: Toast[] = [];
let seq = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

const toastStore = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get(): Toast[] {
    return toasts;
  },
};

/** Push a transient toast. Auto-dismisses after `duration` (default 3.5s). */
export function toast(message: string, opts: ToastOptions = {}): number {
  const id = ++seq;
  toasts = [...toasts, { id, message, tone: opts.tone ?? "default", action: opts.action }];
  emit();
  // Toasts carrying an action stay until tapped/dismissed unless told otherwise.
  const duration = opts.duration ?? (opts.action ? 0 : 3500);
  if (typeof window !== "undefined" && duration > 0) {
    window.setTimeout(() => dismissToast(id), duration);
  }
  return id;
}

export function dismissToast(id: number) {
  const next = toasts.filter((t) => t.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

/** Read the live toast stack. Empty-array snapshot is stable across renders. */
export function useToasts(): Toast[] {
  return useSyncExternalStore(toastStore.subscribe, toastStore.get, () => toasts);
}
