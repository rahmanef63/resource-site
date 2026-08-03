"use client";

import * as React from "react";
import {
  Activity, BarChart3, Bell, Bot, Boxes, Database, FileText, Folder, Image as ImageIcon,
  KeyRound, LayoutDashboard, Mail, Settings, ShieldCheck, Users, Webhook, Wrench,
} from "lucide-react";
import { DashboardShell, type NavGroup } from "@/features/dashboard-shell";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Workspace" },
  { id: "members", label: "Members", icon: Users, group: "Workspace" },
  { id: "roles", label: "Roles", icon: ShieldCheck, group: "Workspace" },
  { id: "content", label: "Content", icon: FileText, group: "Content" },
  { id: "media", label: "Media", icon: ImageIcon, group: "Content" },
  { id: "email", label: "Email", icon: Mail, group: "Content" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Insights" },
  { id: "ai", label: "AI", icon: Bot, group: "Insights" },
  { id: "database", label: "Database", icon: Database, group: "Platform" },
  { id: "slices", label: "Slices", icon: Boxes, group: "Platform" },
  { id: "webhooks", label: "Webhooks", icon: Webhook, group: "Platform" },
  { id: "api-keys", label: "API keys", icon: KeyRound, group: "Platform" },
  { id: "audit", label: "Audit log", icon: Activity, group: "Platform" },
  { id: "files", label: "Files", icon: Folder, group: "Platform" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "System" },
  { id: "settings", label: "Settings", icon: Wrench, group: "System" },
  { id: "advanced", label: "Advanced", icon: Settings, group: "System" },
];

const STATS = [
  { label: "Active users", value: "1,247", change: "+12%" },
  { label: "Posts this week", value: "38", change: "+5%" },
  { label: "Avg session", value: "4m 12s", change: "+8%" },
  { label: "Errors (24h)", value: "7", change: "-23%" },
];

export default function Page() {
  const [active, setActive] = React.useState("overview");

  const nav: NavGroup[] = React.useMemo(() => {
    const groups: NavGroup[] = [];
    SECTIONS.forEach((s, i) => {
      const item = {
        id: s.id,
        label: s.label,
        icon: s.icon,
        onSelect: () => setActive(s.id),
        active: s.id === active,
        dock: i < 3,
      };
      const g = groups.find((x) => x.id === s.group);
      if (g) g.items.push(item);
      else groups.push({ id: s.group, label: s.group, items: [item] });
    });
    return groups;
  }, [active]);

  const section = SECTIONS.find((s) => s.id === active);

  return (
    <div className="relative h-svh transform-gpu overflow-hidden">
      <DashboardShell
        brand={{ name: "Admin", caption: "acme.workspace" }}
        nav={nav}
        title={section?.label}
        contentClassName="p-6"
      >
        <header className="mb-6">
          <h1 className="text-2xl font-bold">{section?.label}</h1>
          <p className="text-sm text-muted-foreground">17-section admin shell. RBAC-gated.</p>
        </header>
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
              <p className="mt-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                {s.change} vs last week
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-5">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <div className="mt-3 space-y-2 text-xs">
            {[
              "alice@acme published Post #247",
              "bob@acme invited 3 members",
              "system reseeded RBAC roles",
              "carol@acme exported 12 audit rows",
            ].map((a) => (
              <div key={a} className="flex items-center gap-2 rounded border border-border/40 bg-muted/20 px-3 py-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                {a}
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}
