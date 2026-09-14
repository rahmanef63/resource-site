"use client";

import { useSyncExternalStore } from "react";
import {
  clearRecents,
  getRecentIconsServerSnapshot,
  getRecentIconsSnapshot,
  pushRecent,
  subscribeRecentIcons,
} from "./recents-core";

export { clearRecents, pushRecent } from "./recents-core";

export function useRecentIcons(): readonly string[] {
  return useSyncExternalStore(
    subscribeRecentIcons,
    getRecentIconsSnapshot,
    getRecentIconsServerSnapshot,
  );
}
