"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";
import type { AppDescriptor } from "../lib/types";
import { AppsGrid } from "./mobile-home-parts";
import { FolderCard, AlphaList } from "./mobile-app-library-parts";

// Category map keyed by app id (SSOT for grouping). Unknown ids → "Other" so
// dynamically-installed apps still show up.
const CATEGORY: Record<string, string> = {
  files: "Files & System",
  settings: "Files & System",
  trash: "Files & System",
  users: "Files & System",
  admin: "Files & System",
  media: "Creative",
  widgets: "Creative",
  clock: "Creative",
  weather: "Creative",
  map: "Creative",
  browser: "Web & AI",
  assistant: "Web & AI",
  site: "Web & AI",
  html: "Web & AI",
  notion: "Web & AI",
};
const ORDER = ["Files & System", "Creative", "Web & AI", "Other"];

// iPhone App Library: category folder-cards by default; an A–Z list while the
// search field has text. Tapping a folder's cluster (or its label) opens it.
export function MobileAppLibrary({
  apps,
  onOpen,
  onContext,
}: {
  apps: AppDescriptor[];
  onOpen: (app: AppDescriptor) => void;
  onContext: (app: AppDescriptor) => void;
}) {
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState<string | null>(null);

  const groups = useMemo(() => {
    const by: Record<string, AppDescriptor[]> = {};
    for (const a of apps) (by[CATEGORY[a.id] ?? "Other"] ??= []).push(a);
    return ORDER.filter((c) => by[c]?.length).map((name) => ({ name, apps: by[name] }));
  }, [apps]);

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return apps
      .filter((a) => a.title.toLowerCase().includes(query))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [apps, q]);

  const folderApps = folder ? (groups.find((g) => g.name === folder)?.apps ?? []) : [];

  return (
    <div className="relative flex h-full flex-col px-4 py-3">
      <label className="mb-3 flex items-center gap-2 rounded-[10px] bg-white/25 px-3 py-2 backdrop-blur-xl">
        <Search className="size-4 text-white/70" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="App Library"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/70"
        />
      </label>

      {q ? (
        <AlphaList apps={matches} q={q} onOpen={onOpen} onContext={onContext} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto [scrollbar-width:none]">
          {groups.map((g) => (
            <FolderCard key={g.name} name={g.name} apps={g.apps} onOpen={onOpen} onExpand={() => setFolder(g.name)} />
          ))}
        </div>
      )}

      {folder && (
        <div className="absolute inset-0 z-[30] flex flex-col bg-black/55 backdrop-blur-2xl" onClick={() => setFolder(null)}>
          <h3 className="mt-4 shrink-0 text-center text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {folder}
          </h3>
          <div className="min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
            {/* Same icon-grid layout as the home screen — full-screen, not a floating modal. */}
            <AppsGrid apps={folderApps} onLaunch={onOpen} onSearch={() => setFolder(null)} onContext={onContext} />
          </div>
        </div>
      )}
    </div>
  );
}

