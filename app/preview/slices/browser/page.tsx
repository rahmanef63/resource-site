"use client";

import { Browser } from "@/features/browser";

// Live preview: full browser chrome on the offline canvas demo renderer —
// omnibar, bookmarks, history all work; the viewport is a drawn placeholder.
// Real pages: configureBrowser({ state, screenshot, act }) → Playwright.

export default function BrowserPreview() {
  return (
    <div className="h-dvh w-full">
      <Browser />
    </div>
  );
}
