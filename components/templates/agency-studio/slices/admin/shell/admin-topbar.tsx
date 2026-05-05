"use client";

import * as React from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSidebarMobileTrigger } from "./admin-sidebar";

export function AdminTopbar() {
  return (
    <header className="flex h-14 items-center gap-2 border-b border-border/60 bg-background px-4">
      <AdminSidebarMobileTrigger />
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Search projects, clients, leads…" className="pl-8" />
      </div>
      <Button variant="ghost" size="icon" className="size-9">
        <Bell className="size-4" />
      </Button>
    </header>
  );
}
