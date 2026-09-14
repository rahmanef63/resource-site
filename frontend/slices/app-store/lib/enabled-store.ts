"use client";

import { useSyncExternalStore } from "react";
import {
  getDisabledServerSnapshot,
  getDisabledSnapshot,
  MANDATORY,
  setEnabled,
  subscribeDisabled,
} from "./enabled-core";

export function useDisabledIds(): string[] {
  return useSyncExternalStore(subscribeDisabled, getDisabledSnapshot, getDisabledServerSnapshot);
}

export { MANDATORY, setEnabled } from "./enabled-core";
