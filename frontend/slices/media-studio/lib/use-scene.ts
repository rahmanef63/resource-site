"use client";

import { useEffect, useState } from "react";
import { ASPECTS, type ToolId } from "./model";
import { suggestPlatform, type SafePlatform } from "./masks";
import type { PanelTab } from "../components/side-panel";

// View state AROUND the layer store: active tool, zoom, canvas aspect,
// safe-area guides, emoji/panel/tab toggles, and a transient status chip
// (the catalog build has no shell toast bus — app.tsx renders the chip).
export function useScene() {
  const [tool, setTool] = useState<ToolId>("move");
  const [zoom, setZoom] = useState(100);
  const [aspect, setAspectRaw] = useState(ASPECTS[0].value);
  const [safe, setSafe] = useState(false);
  const [platform, setPlatform] = useState<SafePlatform>("IG Feed");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState<PanelTab>("layers");
  const [status, notify] = useState<string | null>(null);

  // Status chip auto-clears.
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => notify(null), 2600);
    return () => clearTimeout(t);
  }, [status]);

  // Changing the aspect re-suggests the matching platform safe-area guide.
  const setAspect = (v: string) => {
    setAspectRaw(v);
    setPlatform(suggestPlatform(v));
  };

  return {
    tool, setTool,
    zoom, setZoom,
    aspect, setAspect,
    safe, setSafe,
    platform, setPlatform,
    emojiOpen, setEmojiOpen,
    panelOpen, setPanelOpen,
    tab, setTab,
    status, notify,
  };
}
