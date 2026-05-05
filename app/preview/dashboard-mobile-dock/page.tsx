"use client";

import * as React from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Clock,
  Cog,
  Folder,
  Home,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const TAB_POOL = {
  home: { id: "home", label: "Home", icon: Home },
  tasks: { id: "tasks", label: "Tasks", icon: CalendarDays },
  alerts: { id: "alerts", label: "Alerts", icon: Bell },
  me: { id: "me", label: "Me", icon: User },
  search: { id: "search", label: "Search", icon: Search },
  files: { id: "files", label: "Files", icon: Folder },
  settings: { id: "settings", label: "Settings", icon: Cog },
};

type TabKey = keyof typeof TAB_POOL;
const ALL_TABS: TabKey[] = ["home", "tasks", "alerts", "me", "search", "files", "settings"];

export default function MobileDockPreview() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const variant = (params.get("variant") ?? "tabs") as "tabs" | "dock" | "pill";
  const aiBtn = params.get("aiBtn") === "1";
  const sidebarToggle = params.get("sidebarToggle") === "1";
  const tabsHeader = params.get("tabsHeader") === "1";
  const rightNav = (params.get("rightNav") ?? "avatar") as "avatar" | "settings" | "none";
  const moreCsv = params.get("more") ?? "search,files,settings";
  const moreItems = moreCsv.split(",").filter(Boolean) as TabKey[];

  // primary nav 4 items max — rest go to "more"
  const PRIMARY: TabKey[] = ["home", "tasks", "alerts", "me"];
  const [active, setActive] = React.useState<TabKey>("home");
  const [moreOpen, setMoreOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header
        sidebarToggle={sidebarToggle}
        tabsHeader={tabsHeader}
        rightNav={rightNav}
      />

      <main className="flex-1 space-y-4 overflow-auto px-4 pb-24 pt-4">
        <Card variant={variant} />
        <ProgressList />
      </main>

      {aiBtn && (
        <button
          aria-label="AI"
          className="fixed bottom-20 left-1/2 z-20 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-violet-500 text-white shadow-xl shadow-violet-500/30"
        >
          <Sparkles className="size-6" />
        </button>
      )}

      <BottomNav
        variant={variant}
        primary={PRIMARY}
        moreItems={moreItems}
        active={active}
        setActive={setActive}
        moreOpen={moreOpen}
        setMoreOpen={setMoreOpen}
        aiBtn={aiBtn}
      />

      {moreOpen && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={() => setMoreOpen(false)}>
          <div className="w-full rounded-t-2xl bg-zinc-900 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-700" />
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">More</p>
            <div className="grid grid-cols-4 gap-3">
              {moreItems.map((id) => {
                const t = TAB_POOL[id];
                const Icon = t.icon;
                return (
                  <button
                    key={id}
                    onClick={() => { setActive(id); setMoreOpen(false); }}
                    className="flex flex-col items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-300 hover:bg-zinc-800/60"
                  >
                    <Icon className="size-5" />
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- Header
function Header({
  sidebarToggle, tabsHeader, rightNav,
}: { sidebarToggle: boolean; tabsHeader: boolean; rightNav: "avatar" | "settings" | "none" }) {
  return (
    <header className="flex flex-col border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {sidebarToggle && (
            <button className="-ml-1 flex size-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800">
              <PanelLeft className="size-4" />
            </button>
          )}
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Workspace</p>
            <p className="-mt-0.5 text-sm font-semibold">Studio · Personal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex size-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
            <Search className="size-4" />
          </button>
          {rightNav === "settings" && (
            <button className="flex size-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
              <Cog className="size-4" />
            </button>
          )}
          {rightNav === "avatar" && (
            <button className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
              R
            </button>
          )}
        </div>
      </div>
      {tabsHeader && (
        <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-800/60 px-3 py-1.5 text-xs">
          {(["Today", "Upcoming", "Backlog", "Archive"] as const).map((t, i) => (
            <button key={t} className={cn(
              "shrink-0 rounded-md px-2.5 py-1",
              i === 0 ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-200",
            )}>{t}</button>
          ))}
        </div>
      )}
    </header>
  );
}

function Card({ variant }: { variant: string }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5 p-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Today · variant {variant}</p>
      <p className="mt-1 text-2xl font-bold">3 tasks · 1 mention</p>
      <p className="mt-1 text-xs text-zinc-400">You're on track. Two reviews left.</p>
    </section>
  );
}

function ProgressList() {
  const rows = [
    { title: "Wireframe v2",      sub: "Design",     icon: Clock,       state: "amber" as const },
    { title: "Convex auth merge", sub: "Backend",    icon: CircleCheck, state: "green" as const },
    { title: "Send weekly recap", sub: "Marketing",  icon: Clock,       state: "amber" as const },
  ];
  return (
    <section className="space-y-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">In progress</p>
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <div key={row.title} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              row.state === "green" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300",
            )}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.title}</p>
              <p className="truncate text-[11px] text-zinc-500">{row.sub}</p>
            </div>
            <ChevronRight className="size-4 text-zinc-600" />
          </div>
        );
      })}
    </section>
  );
}

// ----- BottomNav variants
function BottomNav({
  variant, primary, moreItems, active, setActive, moreOpen, setMoreOpen, aiBtn,
}: {
  variant: "tabs" | "dock" | "pill";
  primary: TabKey[]; moreItems: TabKey[];
  active: TabKey; setActive: (k: TabKey) => void;
  moreOpen: boolean; setMoreOpen: (b: boolean) => void;
  aiBtn: boolean;
}) {
  void moreOpen;
  if (variant === "pill") {
    return (
      <nav className="fixed inset-x-0 bottom-4 z-10 flex justify-center">
        <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/95 p-1 shadow-xl backdrop-blur">
          {primary.slice(0, 3).map((id) => {
            const t = TAB_POOL[id];
            const Icon = t.icon;
            const on = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full transition-colors",
                  on ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-zinc-100",
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
          {moreItems.length > 0 && (
            <button onClick={() => setMoreOpen(true)} className="flex size-10 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100">
              <MoreHorizontal className="size-4" />
            </button>
          )}
        </div>
      </nav>
    );
  }

  // tabs (default) and dock (taller, labels always)
  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-0 z-10 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur",
      variant === "dock" && "py-1",
    )}>
      <div className={cn("mx-auto flex max-w-md items-center", variant === "dock" ? "justify-around py-2" : "justify-around py-1.5")}>
        {primary.map((id) => {
          const t = TAB_POOL[id];
          const Icon = t.icon;
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 text-[10px] font-medium transition-colors",
                on ? "text-violet-300" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Icon className={variant === "dock" ? "size-5" : "size-4"} />
              <span>{t.label}</span>
            </button>
          );
        })}
        {moreItems.length > 0 && (
          <button onClick={() => setMoreOpen(true)} className={cn(
            "flex flex-col items-center gap-0.5 px-3 text-[10px] font-medium",
            "text-zinc-500 hover:text-zinc-300",
          )}>
            <MoreHorizontal className={variant === "dock" ? "size-5" : "size-4"} />
            <span>More</span>
          </button>
        )}
      </div>
      {aiBtn && variant === "dock" && (
        // padding for FAB
        <div className="h-2" />
      )}
    </nav>
  );
}

// for tree-shaking: ensure ALL_TABS referenced
void ALL_TABS;
void Plus;
