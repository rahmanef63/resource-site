"use client";

import * as React from "react";
import {
  Home,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  Plus,
  Menu,
  Inbox,
  CalendarDays,
} from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Page() {
  const [viewport, setViewport] = React.useState<"mobile" | "desktop">("desktop");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <SlicePreviewLayout
      title="Dashboard Shell — Responsive"
      kind="ui"
      description="Desktop sidebar+topbar, mobile dock+sheet. Same children, auto-switches at md breakpoint."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/template-base/frontend/shared/ui/layout/dashboard"
    >
      <PreviewSection title="Live demo" hint="Toggle the viewport">
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["desktop", "mobile"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              className={cn(
                "rounded px-3 py-1 text-xs capitalize transition",
                viewport === v ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex justify-center rounded-lg border bg-muted/20 p-4 sm:p-6">
          <div
            className={cn(
              "overflow-hidden rounded-lg border bg-background shadow-xl",
              viewport === "mobile" ? "h-[560px] w-[320px]" : "h-[460px] w-full max-w-4xl",
            )}
          >
            {viewport === "desktop" ? <DesktopShell /> : <MobileShell open={mobileOpen} setOpen={setMobileOpen} />}
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`import { ResponsiveDashboardShell } from "@/features/dashboard-shell";
import { FullWidthToggle } from "@/features/full-width-toggle";

<ResponsiveDashboardShell
  mode="authenticated"
  sidebar={<AppSidebar />}
  topbar={<><BreadcrumbSlot /><FullWidthToggle /></>}
>
  {children}
</ResponsiveDashboardShell>`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function DesktopShell() {
  return (
    <div className="flex h-full">
      <aside className="flex w-52 flex-col border-r bg-muted/20">
        <div className="px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-foreground" />
            <span className="text-sm font-semibold">Acme</span>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-2">
          <SideRow icon={Home} label="Home" active />
          <SideRow icon={Inbox} label="Inbox" badge="12" />
          <SideRow icon={FileText} label="Drafts" />
          <SideRow icon={CalendarDays} label="Calendar" />
          <SideRow icon={Users} label="Team" />
          <div className="my-2 border-t" />
          <SideRow icon={Settings} label="Settings" />
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <TopBar />
        <ContentArea />
      </div>
    </div>
  );
}

function MobileShell({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div className="relative flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <button onClick={() => setOpen(true)} className="rounded p-1.5 hover:bg-accent">
          <Menu className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold">Acme</span>
        <button className="rounded p-1.5 hover:bg-accent">
          <Bell className="h-4 w-4" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-3">
        <ContentArea compact />
      </div>
      <nav className="grid grid-cols-4 border-t bg-background">
        <DockButton icon={Home} label="Home" active />
        <DockButton icon={Inbox} label="Inbox" />
        <DockButton icon={Plus} label="New" />
        <DockButton icon={Users} label="Team" />
      </nav>
      {open && (
        <>
          <div className="absolute inset-0 z-10 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 z-20 w-60 bg-background p-3 shadow-2xl">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-foreground" />
              <span className="text-sm font-semibold">Acme</span>
            </div>
            <nav className="space-y-0.5">
              <SideRow icon={Home} label="Home" active />
              <SideRow icon={Inbox} label="Inbox" badge="12" />
              <SideRow icon={FileText} label="Drafts" />
              <SideRow icon={CalendarDays} label="Calendar" />
              <SideRow icon={Users} label="Team" />
              <div className="my-2 border-t" />
              <SideRow icon={Settings} label="Settings" />
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex items-center gap-3 border-b px-4 py-2">
      <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
        <Search className="h-3.5 w-3.5" /> Search…
        <kbd className="ml-auto rounded border bg-background px-1 font-mono text-[10px]">⌘K</kbd>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Bell className="h-3.5 w-3.5" />
      </Button>
      <div className="h-7 w-7 rounded-full bg-foreground" />
    </header>
  );
}

function ContentArea({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex-1 space-y-3 overflow-y-auto p-4", compact && "p-0")}>
      <div className="flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Dashboard</h1>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
      </div>
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-4")}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Metric {i + 1}</div>
            <div className="mt-1 font-mono text-lg font-bold">{(1234 * (i + 1)).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-2 w-4/5 rounded bg-muted" />
        <div className="h-2 w-3/5 rounded bg-muted" />
      </div>
    </div>
  );
}

function SideRow({
  icon: Icon,
  label,
  badge,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition",
        active ? "bg-accent font-medium" : "hover:bg-accent/50 text-muted-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="rounded bg-foreground/10 px-1 text-[10px]">{badge}</span>}
    </button>
  );
}

function DockButton({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex flex-col items-center gap-0.5 py-2 text-[10px]",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
