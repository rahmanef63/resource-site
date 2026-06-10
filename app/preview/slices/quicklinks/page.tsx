"use client";

import { QuicklinksApp } from "@/features/quicklinks";

// Live preview: the favicon-tile grid on the default localStorage-backed
// store (seeded with demo links). Click a tile → the site opens in a new tab.
// Real host: configureQuicklinks({ get, subscribe, add, remove }).

export default function QuicklinksPreview() {
  return (
    <div className="h-dvh w-full">
      <QuicklinksApp />
    </div>
  );
}
