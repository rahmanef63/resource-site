"use client";

// Slice-local FormDrawer (appshell-compatible compound API): centered Dialog
// on desktop, bottom Sheet on mobile. Swap for the shell's FormDrawer
// (ResponsiveDialog) when hosted inside appshell.

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "../lib/host";

type Part = { className?: string; children: ReactNode };

function Header({ className, children }: Part) {
  return <div className={cn("flex flex-col gap-1 px-4 pt-4", className)}>{children}</div>;
}
function Title({ className, children }: Part) {
  return <DialogTitle className={cn("text-base font-semibold", className)}>{children}</DialogTitle>;
}
function Description({ className, children }: Part) {
  return (
    <DialogDescription className={cn("text-xs text-muted-foreground", className)}>
      {children}
    </DialogDescription>
  );
}
function Body({ className, children }: Part) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-3", className)}>{children}</div>;
}
function Footer({ className, children }: Part) {
  return <div className={cn("flex items-center justify-end gap-2 px-4 pb-4", className)}>{children}</div>;
}

const SIZE: Record<string, string> = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-lg" };

export function FormDrawer({
  open,
  onOpenChange,
  size = "md",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  const mobile = useIsMobile();

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="flex max-h-[85dvh] flex-col gap-0 rounded-t-xl p-0">
          {/* Dialog a11y parts render fine inside the sheet body. */}
          <div className="flex min-h-0 flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("flex flex-col gap-0 p-0", SIZE[size])}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

FormDrawer.Header = Header;
FormDrawer.Title = Title;
FormDrawer.Description = Description;
FormDrawer.Body = Body;
FormDrawer.Footer = Footer;
