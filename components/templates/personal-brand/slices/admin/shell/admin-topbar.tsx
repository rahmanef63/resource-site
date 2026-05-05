"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Plus,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE, AdminSidebarMobileTrigger } from "./admin-sidebar";

export function AdminTopbar() {
  const { state, dispatch } = useStore();
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const pendingComments = state.comments.filter((c) => c.status === "pending").length;
  const notifCount = newLeads + pendingComments;

  return (
    <header className="flex items-center gap-2 border-b border-border/60 bg-background/80 px-2 py-2.5 backdrop-blur md:gap-3 md:px-6">
      <AdminSidebarMobileTrigger />
      <div className="relative flex flex-1 items-center">
        <Search className="absolute left-3 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search posts, portfolio, leads… (⌘K)"
          className="h-9 max-w-md pl-9"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Button asChild size="sm" variant="outline" className="hidden gap-1 sm:inline-flex">
          <Link href={`${ADMIN_BASE}/posts/new`}>
            <Plus className="size-4" /> New post
          </Link>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="size-9"
          aria-label="Reset demo state"
          title="Reset demo state"
          onClick={() => {
            dispatch({ type: "reset" });
            toast.success("Demo state reset");
          }}
        >
          <RefreshCw className="size-4" />
        </Button>

        <Button size="icon" variant="ghost" className="relative size-9" aria-label="Notifications">
          <Bell className="size-4" />
          {notifCount > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-amber-500 text-[9px] font-medium text-background">
              {notifCount}
            </span>
          )}
        </Button>

        <Button size="icon" variant="ghost" className="size-9" aria-label="Profile">
          <User className="size-4" />
          <ChevronDown className="size-3" />
        </Button>
      </div>
    </header>
  );
}
