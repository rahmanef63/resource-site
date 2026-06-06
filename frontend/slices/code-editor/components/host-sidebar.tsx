"use client";

// Slice-local sidebar chrome (appshell-compatible API): inline rail on
// desktop, left Sheet on mobile. Children render layout-agnostic in either
// slot. Swap for the shell's AppSidebar when hosted inside appshell.

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "../lib/host";

export function AppSidebar({
  open,
  onOpenChange,
  railOpen = true,
  title = "Sidebar",
  description,
  railClassName,
  sheetClassName,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  railOpen?: boolean;
  title?: string;
  description?: string;
  railClassName?: string;
  sheetClassName?: string;
  children: ReactNode;
}) {
  const mobile = useIsMobile();

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className={cn("w-72 p-0 sm:max-w-xs", sheetClassName)}>
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <SheetDescription className="sr-only">{description ?? title}</SheetDescription>
          <div className="flex h-full w-full min-h-0 flex-col overflow-y-auto">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }
  if (!railOpen) return null;
  return (
    <aside className={cn("flex w-56 shrink-0 flex-col border-r border-border bg-sidebar", railClassName)}>
      {children}
    </aside>
  );
}
