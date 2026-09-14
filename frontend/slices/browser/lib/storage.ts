"use client";

import { useEffect, useState } from "react";
import { readStored, relTime, writeStored, type Bookmark, type HistoryEntry } from "./storage-core";

export type { Bookmark, HistoryEntry } from "./storage-core";
export { relTime } from "./storage-core";

export function usePersistent<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStored(key, initial));
  useEffect(() => writeStored(key, value), [key, value]);
  return [value, setValue];
}
