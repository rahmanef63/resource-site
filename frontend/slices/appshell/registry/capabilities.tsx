"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DeviceMode } from "../responsive/use-responsive";

export type ThemeMode = "light" | "dark";

// Appearance the shell needs to render (theme/device/wallpaper). The consumer
// adapts its own store to this shape so appshell never imports it.
export type ShellAppearance = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  device: DeviceMode;
  wallpaper?: string;
};

// A ready-to-run search result (shell-search / Spotlight). The consumer builds
// the hits AND their open action, so the shell never knows the host API shape or
// which app opens a path.
export type SearchHit = { id: string; label: string; hint?: string; run: () => void };

// Live system telemetry for the mobile Today widgets (shell-widgets). null until
// the first sample; the consumer owns polling.
export type SystemStats = {
  cpu: { pct: number; cores: number };
  mem: { used: number; total: number };
  disk: { used: number; total: number };
};

// One turn of a scoped AI chat (shell-inspector). Matches the wire shape so a
// consumer can pass its stream fn straight through.
export type ChatMessage = { role: "user" | "assistant"; text: string };

// Optional server-mode tile for the mobile control center (shell-control-center).
// A generic shell with no backend toggle returns null and the tile is hidden.
export type ServerToggle = {
  live: boolean;
  label: string;
  locked: boolean;
  toggle: () => void;
};

// Capabilities the consumer injects via the manifest, so the generic shell + its
// feature slices have NO hard dependency on a project's appearance store, host
// API or AI backend. Each is a hook (called by the shell at a stable position)
// so the consumer can wire it to reactive sources (a theme store, a polled
// telemetry endpoint, …). Optional members degrade gracefully via the defaults.
export type ShellCapabilities = {
  /** Theme/device/wallpaper source. */
  useAppearance: () => ShellAppearance;
  /** Optional menu-bar CPU readout (0–100); null hides the chip. */
  useCpuPercent: () => number | null;
  /** shell-search: returns a search fn (the palette debounces the calls). */
  useSearch?: () => (query: string) => Promise<SearchHit[]>;
  /** shell-widgets: polled system telemetry (null until the first sample). */
  useSystemStats?: () => SystemStats | null;
  /** shell-inspector: scoped AI chat — yields text deltas. */
  useChat?: () => (messages: ChatMessage[]) => AsyncGenerator<string>;
  /** shell-control-center: optional server-mode tile (null hides it). */
  useServerToggle?: () => ServerToggle | null;
};

// Standalone defaults so the shell renders with zero capabilities injected
// (light theme, auto device, no wallpaper/CPU/search/stats/chat/server tile).
// Every member is defined so the accessors below always call a hook at a stable
// position regardless of what the consumer supplies.
const DEFAULT_CAPABILITIES: Required<ShellCapabilities> = {
  useAppearance: () => ({ theme: "light", setTheme: () => {}, device: "auto" }),
  useCpuPercent: () => null,
  useSearch: () => async () => [],
  useSystemStats: () => null,
  useChat: () => async function* () {},
  useServerToggle: () => null,
};

const CapabilitiesContext = createContext<Required<ShellCapabilities>>(DEFAULT_CAPABILITIES);

export function CapabilitiesProvider({
  value,
  children,
}: {
  value?: ShellCapabilities;
  children: ReactNode;
}) {
  // Merge over the defaults so every capability key is a callable hook — keeps
  // the accessor hooks unconditional (the merged object is stable for the app's
  // lifetime, so the hook order never changes between renders).
  const merged: Required<ShellCapabilities> = { ...DEFAULT_CAPABILITIES, ...value };
  return (
    <CapabilitiesContext.Provider value={merged}>{children}</CapabilitiesContext.Provider>
  );
}

// Shell-internal accessors. They call the injected hook at a stable position
// (the capability object is provided once for the app's lifetime).
export function useShellAppearance(): ShellAppearance {
  return useContext(CapabilitiesContext).useAppearance();
}

export function useCpuPercent(): number | null {
  return useContext(CapabilitiesContext).useCpuPercent();
}

export function useShellSearch(): (query: string) => Promise<SearchHit[]> {
  return useContext(CapabilitiesContext).useSearch();
}

export function useSystemStats(): SystemStats | null {
  return useContext(CapabilitiesContext).useSystemStats();
}

export function useShellChat(): (messages: ChatMessage[]) => AsyncGenerator<string> {
  return useContext(CapabilitiesContext).useChat();
}

export function useServerToggle(): ServerToggle | null {
  return useContext(CapabilitiesContext).useServerToggle();
}
