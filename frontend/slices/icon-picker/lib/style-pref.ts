"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_ICON_STYLE,
  getIconStyleServerSnapshot,
  getIconStyleSnapshot,
  readIconStyle,
  setIconStyle,
  subscribeIconStyle,
  type Style,
} from "./style-core";

export { readIconStyle, setIconStyle, type Style } from "./style-core";

export function useIconStyle(): [Style, (next: Style) => void] {
  const style = useSyncExternalStore(
    subscribeIconStyle,
    getIconStyleSnapshot,
    getIconStyleServerSnapshot,
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return [mounted ? style : DEFAULT_ICON_STYLE, setIconStyle];
}
