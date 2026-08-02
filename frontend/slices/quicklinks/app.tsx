"use client";

import { Globe, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppFrame } from "./components/app-frame";
import { useQuicklinks, faviconUrl, openQuicklink } from "./lib/host";

// Quicklinks window: a grid of favicon tiles, click opens a new tab. Data is
// the configured quicklinks store (localStorage-backed by default — see
// lib/host.ts; hosts inject their own via configureQuicklinks()).
export default function QuicklinksApp() {
  const { items } = useQuicklinks();

  if (items.length === 0) {
    return (
      <AppFrame>
        <div className="grid h-full place-items-center p-6 text-center">
          <div className="space-y-2 text-muted-foreground">
            <Link2 className="mx-auto size-8" />
            <p className="text-sm font-medium text-foreground">No quicklinks yet</p>
            <p className="text-xs">Add website shortcuts via the quicklinks store.</p>
          </div>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <div className="grid grid-cols-3 gap-4 p-5 @sm:grid-cols-4 @md:grid-cols-5">
        {items.map((ql) => {
          const src = faviconUrl(ql.url);
          return (
            <Button
              key={ql.id}
              type="button"
              variant="ghost"
              onClick={() => openQuicklink(ql)}
              className="group flex h-auto flex-col items-center gap-2 p-2"
            >
              <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white text-zinc-500 shadow-md ring-1 ring-black/10 transition-transform group-hover:scale-105">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- dynamic remote favicon host
                  <img src={src} alt="" width={36} height={36} className="size-9 object-contain" />
                ) : (
                  <Globe className="size-8" />
                )}
              </span>
              <span className="max-w-full truncate text-xs font-medium">{ql.title}</span>
            </Button>
          );
        })}
      </div>
    </AppFrame>
  );
}
