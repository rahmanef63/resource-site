"use client";

import * as React from "react";
import {
  Search,
  Home,
  FileText,
  Users,
  Settings,
  Moon,
  Sun,
  Plus,
  LogOut,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

const COMMANDS: Cmd[] = [
  { id: "new-post", label: "New post", hint: "Create blog draft", group: "Create", icon: Plus, shortcut: "⌘N" },
  { id: "new-page", label: "New page", hint: "Workspace page", group: "Create", icon: Plus },
  { id: "home", label: "Go to Home", group: "Navigate", icon: Home, shortcut: "G H" },
  { id: "drafts", label: "Drafts", hint: "12 unpublished", group: "Navigate", icon: FileText },
  { id: "members", label: "Members", hint: "Team & invites", group: "Navigate", icon: Users },
  { id: "settings", label: "Settings", group: "Navigate", icon: Settings, shortcut: "⌘," },
  { id: "theme", label: "Toggle theme", hint: "Light / Dark / System", group: "Preferences", icon: Moon, shortcut: "⌘⇧L" },
  { id: "logout", label: "Sign out", group: "Account", icon: LogOut },
  { id: "ai", label: "Ask AI", hint: "Compose draft from prompt", group: "AI", icon: Sparkles, shortcut: "⌘⇧A" },
];

export default function Page() {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q),
    );
  }, [query]);

  const groups = React.useMemo(() => {
    const m = new Map<string, Cmd[]>();
    for (const c of filtered) {
      const arr = m.get(c.group) ?? [];
      arr.push(c);
      m.set(c.group, arr);
    }
    return [...m.entries()];
  }, [filtered]);

  return (
    <SlicePreviewLayout
      title="Command Menu (⌘K)"
      kind="ui"
      description="Global Cmd+K palette. Press ⌘K to toggle, type to filter, arrows to move, Enter to fire."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/template-base/frontend/shared/foundation/utils/system/command-menu"
    >
      <PreviewSection
        title="Live palette"
        hint={
          <span className="flex items-center gap-1 text-xs">
            Press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> to toggle
          </span>
        }
      >
        <div className="relative min-h-[420px] rounded-md border bg-background p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
              <Search className="h-3.5 w-3.5" />
              Search anything…
              <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </Button>
            <Badge variant="outline" className="text-[10px]">{open ? "Open" : "Closed"}</Badge>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <DemoTile title="Home" />
            <DemoTile title="Drafts" />
            <DemoTile title="Settings" />
          </div>

          {open && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-background/80 p-4 backdrop-blur sm:p-12">
              <div className="w-full max-w-xl overflow-hidden rounded-lg border bg-background shadow-2xl">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Type a command or search…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, filtered.length - 1));
                      if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
                    }}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
                </div>
                <div className="max-h-72 overflow-y-auto p-1.5">
                  {filtered.length === 0 && (
                    <div className="py-8 text-center text-xs text-muted-foreground">No matches.</div>
                  )}
                  {groups.map(([groupName, items]) => (
                    <div key={groupName} className="mb-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {groupName}
                      </div>
                      {items.map((c) => {
                        const idx = filtered.indexOf(c);
                        return (
                          <Button
                            key={c.id}
                            variant="ghost"
                            type="button"
                            onMouseEnter={() => setActive(idx)}
                            className={cn(
                              "flex h-auto w-full items-center justify-start gap-2 rounded px-2 py-1.5 text-left text-sm transition",
                              idx === active ? "bg-accent" : "hover:bg-accent/50",
                            )}
                          >
                            <c.icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{c.label}</span>
                            {c.hint && <span className="text-xs text-muted-foreground">— {c.hint}</span>}
                            {c.shortcut && (
                              <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">{c.shortcut}</kbd>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="rounded border bg-background px-1">↑↓</kbd>
                    <kbd className="rounded border bg-background px-1">Enter</kbd>
                  </span>
                  <span>{filtered.length} commands</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function DemoTile({ title }: { title: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-xs font-medium">{title}</div>
      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
        <ArrowRight className="h-3 w-3" /> Reachable via ⌘K
      </div>
    </div>
  );
}
