"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { type TabKey } from "./mock-data";
import { Header, HeroCard, ProgressList } from "./sections";
import { BottomNav, MoreSheet } from "./bottom-nav";

export default function MobileDockPreview() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const variant = (params.get("variant") ?? "tabs") as "tabs" | "dock" | "pill";
  const aiBtn = params.get("aiBtn") === "1";
  const sidebarToggle = params.get("sidebarToggle") === "1";
  const tabsHeader = params.get("tabsHeader") === "1";
  const rightNav = (params.get("rightNav") ?? "avatar") as "avatar" | "settings" | "none";
  const moreCsv = params.get("more") ?? "search,files,settings";
  const moreItems = moreCsv.split(",").filter(Boolean) as TabKey[];

  // primary nav 4 items max — rest go to "more"
  const PRIMARY: TabKey[] = ["home", "tasks", "alerts", "me"];
  const [active, setActive] = React.useState<TabKey>("home");
  const [moreOpen, setMoreOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header sidebarToggle={sidebarToggle} tabsHeader={tabsHeader} rightNav={rightNav} />

      <main className="flex-1 space-y-4 overflow-auto px-4 pb-24 pt-4">
        <HeroCard variant={variant} />
        <ProgressList />
      </main>

      {aiBtn && (
        <Button
          type="button"
          variant="default"
          aria-label="AI"
          className="fixed bottom-20 left-1/2 z-20 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-violet-500 text-white shadow-xl shadow-violet-500/30 hover:bg-violet-500/90"
        >
          <Sparkles className="size-6" />
        </Button>
      )}

      <BottomNav
        variant={variant}
        primary={PRIMARY}
        moreItems={moreItems}
        active={active}
        setActive={setActive}
        moreOpen={moreOpen}
        setMoreOpen={setMoreOpen}
        aiBtn={aiBtn}
      />

      {moreOpen && <MoreSheet moreItems={moreItems} setActive={setActive} setMoreOpen={setMoreOpen} />}
    </div>
  );
}
