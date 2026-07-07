"use client";
// glass-desktop — hydration gate (Build Plan §7 "Hydration rule").
// Returns false on the server and the first client paint, true after mount.
// Any "now"-derived widget text renders a seed placeholder until this flips,
// which guarantees zero hydration mismatches on the client preview surface.
import { useEffect, useState } from "react";

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
