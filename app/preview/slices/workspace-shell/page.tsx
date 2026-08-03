"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { DashboardShell, type NavGroup } from "@/features/dashboard-shell";
import { WORKSPACES, USER, forkOf } from "./data";
import { NavUser, WorkspaceSwitcher } from "./nav";

/** workspace-shell preview — the ONE dashboard shell whose sidebar header IS
 *  the atomic NavContext: pick a workspace and its whole menuSet flips with it;
 *  fork clones that menuSet into a personal copy you own. Rail, mobile sheet
 *  and bottom dock all re-render from that same menuSet. */
export default function Page() {
  const [wsId, setWsId] = React.useState(WORKSPACES[0].id);
  const [forked, setForked] = React.useState(false);
  const [active, setActive] = React.useState<string>("");
  const ws = WORKSPACES.find((w) => w.id === wsId)!;
  const menuSet = forked ? forkOf(ws) : ws.nav;

  // Switching workspace resets to its default menuSet (resolver: user fork →
  // workspace default) — and to its first section.
  const pick = (id: string) => {
    setWsId(id);
    setForked(false);
    setActive("");
  };

  const nav: NavGroup[] = React.useMemo(
    () =>
      menuSet.map((group) => ({
        id: group.title,
        label: group.title,
        items: group.items.map((sub, i) => {
          const id = `${group.title}:${sub.title}`;
          return {
            id,
            label: sub.title,
            icon: i === 0 ? group.icon : undefined,
            onSelect: () => setActive(id),
            active: id === active,
            dock: i === 0,
          };
        }),
      })),
    [menuSet, active],
  );

  const current = active ? active.split(":")[1] : (menuSet[0]?.items[0]?.title ?? "Dashboard");

  return (
    <div className="relative h-svh transform-gpu overflow-hidden">
      <DashboardShell
        nav={nav}
        sidebarHeader={
          <WorkspaceSwitcher
            active={ws}
            onPick={pick}
            forked={forked}
            onToggleFork={() => setForked((f) => !f)}
          />
        }
        sidebarFooter={<NavUser user={USER} />}
        title={`${ws.name} · ${current}`}
        actions={
          <Badge variant={forked ? "default" : "secondary"} className="text-[10px]">
            {forked ? "menuSet · your fork" : "menuSet · workspace default"}
          </Badge>
        }
        contentClassName="flex flex-col gap-4 p-4"
      >
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[40vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </DashboardShell>
    </div>
  );
}
