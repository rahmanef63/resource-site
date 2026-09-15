import { useRef } from "react";
import { createTextHistory } from "../lib/history-core";

export function useBlockHistory(initialText: string) {
  const ref = useRef<ReturnType<typeof createTextHistory> | null>(null);
  if (!ref.current) ref.current = createTextHistory(initialText);
  return ref.current;
}
