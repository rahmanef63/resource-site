"use client";

import * as React from "react";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DesktopShell, MobileShell } from "./shells";

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
            <Button
              key={v}
              variant="ghost"
              type="button"
              onClick={() => setViewport(v)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs capitalize transition",
                viewport === v ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </Button>
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
    </SlicePreviewLayout>
  );
}
