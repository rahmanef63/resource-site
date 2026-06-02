"use client";

import * as React from "react";
import {
  Building2, ChevronsUpDown, GitFork, LayoutDashboard, Users, FileText,
  BarChart3, Settings, Inbox, FolderKanban, Megaphone, Check,
} from "lucide-react";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Item = { label: string; Icon: React.ComponentType<{ className?: string }> };
type Workspace = { id: string; name: string; emoji: string; menu: Item[] };

// Each workspace ships ONE default menuSet. NavContext pairs them atomically —
// switch the workspace and the whole menu flips with it.
const WORKSPACES: Workspace[] = [
  { id: "acme", name: "Acme HQ", emoji: "🏢", menu: [
    { label: "Dashboard", Icon: LayoutDashboard }, { label: "Team", Icon: Users },
    { label: "Docs", Icon: FileText }, { label: "Analytics", Icon: BarChart3 },
    { label: "Settings", Icon: Settings },
  ] },
  { id: "beta", name: "Beta Labs", emoji: "🧪", menu: [
    { label: "Projects", Icon: FolderKanban }, { label: "Inbox", Icon: Inbox },
    { label: "Campaigns", Icon: Megaphone }, { label: "Settings", Icon: Settings },
  ] },
  { id: "solo", name: "Personal", emoji: "👤", menu: [
    { label: "Dashboard", Icon: LayoutDashboard }, { label: "Notes", Icon: FileText },
  ] },
];

const STRONG = "font-semibold text-foreground";

export default function Page() {
  const [wsId, setWsId] = React.useState("acme");
  // user-personal forked menuSets, keyed by workspace
  const [forks, setForks] = React.useState<Record<string, Item[]>>({});
  // active menuSet per workspace: "workspace" default vs "user" fork
  const [active, setActive] = React.useState<Record<string, "workspace" | "user">>({});

  const ws = WORKSPACES.find((w) => w.id === wsId)!;
  const onFork = active[wsId] === "user" && !!forks[wsId];
  const items = onFork ? forks[wsId] : ws.menu;
  const source = onFork ? "user" : "workspace";

  // Fork = clone the workspace default into a personal copy you own (here:
  // drop the last item so the difference is visible).
  const fork = () => {
    setForks((f) => ({ ...f, [wsId]: ws.menu.slice(0, Math.max(2, ws.menu.length - 1)) }));
    setActive((a) => ({ ...a, [wsId]: "user" }));
  };
  const reset = () => setActive((a) => ({ ...a, [wsId]: "workspace" }));

  return (
    <SlicePreviewLayout
      title="Workspace Shell — atomic (workspace × menuSet) NavContext"
      kind="full"
      description="One atomic switch flips BOTH the workspace and its menu set. NavContext resolver chain: user fork → user assignment → workspace default. Fork a workspace menu into a personal copy you own."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/template-base/frontend/slices/workspace-shell"
    >
      <PreviewSection title="Live demo" hint="Switch workspace, fork its menu, watch NavContext resolve">
        <div className="flex justify-center rounded-lg border bg-muted/20 p-4 sm:p-6">
          <aside className="flex h-[440px] w-full max-w-sm flex-col overflow-hidden rounded-lg border bg-background shadow-xl">
            {/* atomic 2-axis switcher */}
            <div className="border-b p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto w-full justify-between gap-2 px-2 py-1.5">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span>{ws.emoji}</span>{ws.name}
                    </span>
                    <ChevronsUpDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-xs">Workspace × menuSet</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {WORKSPACES.map((w) => (
                    <DropdownMenuItem key={w.id} onClick={() => setWsId(w.id)}>
                      <span className="mr-2">{w.emoji}</span>{w.name}
                      {w.id === wsId && <Check className="ml-auto size-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="mt-2 flex items-center gap-1.5 px-1">
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Building2 className="size-3" />{ws.name}
                </Badge>
                <span className="text-muted-foreground">×</span>
                <Badge variant={onFork ? "default" : "outline"} className="text-[10px]">
                  {onFork ? "Your fork" : "Workspace default"}
                </Badge>
              </div>
            </div>

            {/* effective (resolved) menu items */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {items.map((it) => (
                <div
                  key={it.label}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <it.Icon className="size-4" />{it.label}
                </div>
              ))}
            </nav>

            <div className="border-t p-2">
              {onFork ? (
                <Button variant="ghost" size="sm" onClick={reset} className="h-auto w-full justify-start gap-2 text-xs">
                  <GitFork className="size-3.5" /> Reset to workspace default
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={fork} className="h-auto w-full justify-start gap-2 text-xs">
                  <GitFork className="size-3.5" /> Fork this menu (personal copy)
                </Button>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-4 rounded-md border bg-muted/30 p-3 font-mono text-xs text-muted-foreground">
          <div>useNavContext(&quot;{wsId}&quot;) →</div>
          <div className="mt-1">
            {"{ "}workspace: <span className={STRONG}>{ws.name}</span>, menuSet:{" "}
            <span className={STRONG}>{onFork ? `My ${ws.name} Menu` : `${ws.name} default`}</span>, source:{" "}
            <span className={STRONG}>{source}</span>, items: <span className={STRONG}>{items.length}</span>{" }"}
          </div>
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
