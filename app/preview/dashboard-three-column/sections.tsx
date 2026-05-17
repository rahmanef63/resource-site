"use client";

import * as React from "react";
import { Search, Plus, Settings, Sparkles, CircleDot, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, DOCS, INSPECTOR_STATUS } from "./mock-data";

export function Sidebar() {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-5 p-3">
        <div className="flex items-center justify-between px-1.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="text-sm font-semibold">Acme Studio</span>
          </div>
          <Button variant="ghost" size="icon" className="size-7">
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="h-8 pl-8 text-xs" />
        </div>

        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="mt-1.5 flex flex-col">
              {group.items.map((item, ii) => {
                const Icon = item.icon;
                const active = gi === 0 && ii === 0;
                return (
                  <li key={item.label}>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "flex h-8 w-full items-center justify-start gap-2 rounded-md px-2 text-sm font-normal transition-colors",
                        active
                          ? "bg-accent font-medium text-foreground hover:bg-accent hover:text-foreground"
                          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {"count" in item && item.count != null && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                          {item.count}
                        </Badge>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function MainList() {
  const [activeIdx, setActiveIdx] = React.useState(0);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold">Inbox</h2>
          <p className="text-xs text-muted-foreground">12 unread · 3 mentions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
            <Plus className="size-3" /> New doc
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            <Settings className="size-3.5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <ul className="divide-y">
          {DOCS.map((d, i) => (
            <li key={d.title}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "flex h-auto w-full items-start justify-start gap-3 rounded-none px-5 py-3 text-left font-normal transition-colors hover:bg-accent/30",
                  activeIdx === i && "bg-accent/40 hover:bg-accent/40"
                )}
              >
                <Avatar className="size-7 shrink-0 text-[10px]">
                  <AvatarFallback>{d.title.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{d.time}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{d.excerpt}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Badge variant="outline" className="h-4 rounded-full px-1.5 text-[9px]">
                      <Tag className="mr-0.5 size-2.5" /> {d.tag}
                    </Badge>
                  </div>
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

export function Inspector() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active doc
          </p>
          <h3 className="mt-2 text-base font-semibold">Q3 launch checklist</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Authored by <span className="text-foreground">Rahman</span> · 12 min ago
          </p>
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          {INSPECTOR_STATUS.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CircleDot className={cn("size-3", r.state === "ok" ? "text-emerald-500" : "text-amber-500")} />
                <span>{r.label}</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{r.value}</span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Collaborators
          </p>
          <div className="flex -space-x-2">
            {["RH", "AS", "MK", "LP"].map((i) => (
              <Avatar key={i} className="size-7 border-2 border-background text-[10px]">
                <AvatarFallback>{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <Separator />
        <Button size="sm" className="w-full gap-1.5">
          <Sparkles className="size-3.5" /> Generate summary
        </Button>
      </div>
    </ScrollArea>
  );
}
