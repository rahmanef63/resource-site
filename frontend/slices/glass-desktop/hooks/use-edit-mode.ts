"use client";

// glass-desktop — edit-mode flag (Build Plan §7 "config / edit mode").
// A tiny module-level store shared across the whole desktop via
// useSyncExternalStore, so the menu-bar toggle, the canvas, and every
// widget's <EditControls> read the SAME boolean without a Provider wrapper.
// Optionally mirrored to sessionStorage so a mid-edit refresh keeps the mode.
import { useCallback, useSyncExternalStore } from "react";
import { STORAGE } from "@/features/glass-desktop/config/constants";

const KEY = `${STORAGE.toggles}:edit-mode`;

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

let editMode = readInitial();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.sessionStorage.setItem(KEY, "1");
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — in-memory state still authoritative */
  }
}

/** Set the shared edit-mode flag and notify every subscriber. */
export function setEditMode(value: boolean): void {
  if (editMode === value) return;
  editMode = value;
  persist(value);
  emit();
}

/** Flip the shared edit-mode flag. */
export function toggleEditMode(): void {
  setEditMode(!editMode);
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot(): boolean {
  return editMode;
}

function getServerSnapshot(): boolean {
  return false;
}

export interface UseEditMode {
  /** Whether the desktop is currently in configure / edit mode. */
  editMode: boolean;
  /** Flip edit mode on/off. */
  toggle: () => void;
  /** Force edit mode to an explicit value. */
  setEditMode: (value: boolean) => void;
}

/**
 * Read + control the shared edit-mode flag. Every caller sees the same
 * boolean; calling `toggle`/`setEditMode` re-renders all subscribers.
 */
export function useEditMode(): UseEditMode {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => toggleEditMode(), []);
  const set = useCallback((v: boolean) => setEditMode(v), []);
  return { editMode: value, toggle, setEditMode: set };
}
