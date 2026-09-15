"use client";

import { useSyncExternalStore } from "react";
import { shellStore } from "../lib/store";
import type { WindowState, WinId } from "../lib/types";

const EMPTY_WINDOW_ORDER: WinId[] = [];
const NO_WINDOW = (): WindowState | undefined => undefined;
const NO_FOCUS = (): WinId | null => null;
const CLOSED = () => false;

// Each hook subscribes to the whole store but reads ONE slice. React bails out
// when the returned snapshot ref is unchanged, so a move on window A only
// re-renders the component reading window A.

export function useWindow(id: WinId): WindowState | undefined {
  return useSyncExternalStore(
    shellStore.subscribe,
    () => shellStore.getWindow(id),
    NO_WINDOW,
  );
}

export function useWindowOrder(): WinId[] {
  return useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getOrder,
    () => EMPTY_WINDOW_ORDER,
  );
}

export function useFocused(): WinId | null {
  return useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getFocused,
    NO_FOCUS,
  );
}

export function useLauncherOpen(): boolean {
  return useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getLauncherOpen,
    CLOSED,
  );
}

export function useSpotlightOpen(): boolean {
  return useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getSpotlightOpen,
    CLOSED,
  );
}

export function useInspectorOpen(): boolean {
  return useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getInspectorOpen,
    CLOSED,
  );
}

export function useNotificationCenterOpen(): boolean {
  return useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getNotificationCenterOpen,
    CLOSED,
  );
}

// The app id of the focused window (or null) — what the Inspector inspects.
export function useFocusedApp(): string | null {
  const focused = useFocused();
  return useWindow(focused ?? "")?.app ?? null;
}
