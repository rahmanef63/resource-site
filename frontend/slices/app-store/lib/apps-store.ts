"use client";

import { useSyncExternalStore } from "react";
import {
  createApp,
  getAppsServerSnapshot,
  getAppsSnapshot,
  setInstalled,
  subscribeApps,
  type AppRow,
} from "./apps-core";

export function useApps(): AppRow[] {
  return useSyncExternalStore(subscribeApps, getAppsSnapshot, getAppsServerSnapshot);
}

export { createApp, setInstalled, type AppRow } from "./apps-core";
