"use client";

import * as React from "react";
import {
  Home, FileText, Users, Settings, Bell, Plus, Menu, Inbox, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar, ContentArea, SideRow, DockButton } from "./shell-parts";

export function DesktopShell() {
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

export function MobileShell({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div className="relative flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <Button variant="ghost" type="button" onClick={() => setOpen(true)} className="h-auto rounded p-1.5 hover:bg-accent">
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-xs font-semibold">Acme</span>
        <Button variant="ghost" type="button" className="h-auto rounded p-1.5 hover:bg-accent">
          <Bell className="h-4 w-4" />
        </Button>
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
