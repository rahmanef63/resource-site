"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ThreeColumnLayoutAdvanced } from "@/components/previews/three-column/ThreeColumnLayout";
import { Button } from "@/components/ui/button";
import { Sidebar, MainList, Inspector } from "./sections";

export default function DashboardThreeColumnPreview() {
  return (
    <Suspense fallback={null}>
      <Configurable />
    </Suspense>
  );
}

function Configurable() {
  const p = useSearchParams();
  const variant = p.get("variant") ?? "3col-resizable";
  const leftWidth = Number(p.get("leftWidth") ?? 260);
  const rightWidth = Number(p.get("rightWidth") ?? 320);
  const persist = p.get("persist") !== "0";
  const showBtns = p.get("showCollapseBtns") !== "0";
  const aiFab = p.get("aiFab") === "1";
  const rightTabs = p.get("rightTabs") ?? "inspector";
  const showRight = rightTabs !== "none" && variant !== "2col-left";

  return (
    <div className="relative h-screen">
      <ThreeColumnLayoutAdvanced
        left={<Sidebar />}
        center={<MainList />}
        right={showRight ? <Inspector /> : undefined}
        leftWidth={leftWidth}
        rightWidth={rightWidth}
        centerMinWidth={320}
        resizable={variant === "3col-resizable"}
        showCollapseButtons={showBtns}
        persistState={persist}
        storageKey="preview-3col"
        className="h-full"
      />
      {aiFab && (
        <Button
          type="button"
          variant="default"
          aria-label="AI"
          className="fixed bottom-5 right-5 z-30 flex size-12 items-center justify-center rounded-full bg-violet-500 text-white shadow-xl shadow-violet-500/30 hover:bg-violet-500/90"
        >
          <Sparkles className="size-5" />
        </Button>
      )}
    </div>
  );
}
