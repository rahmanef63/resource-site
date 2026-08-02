"use client";

import { useMemo } from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStartHereApi, type StartHereApp, type StartHereStage } from "./lib/host";

// Default export so an os-shell can lazy-load this as a window app. Renders the
// INJECTED app catalog as a guided path so a first-time visitor knows where to
// go; every tile opens the real app via the host seam. Drift-proof: apps not
// placed in a stage fall into a final "Everything else" bucket.
export default function StartHere() {
  const api = useStartHereApi();
  const apps = api.apps;

  const stages = useMemo<StartHereStage[]>(() => {
    const base = api.stages;
    const placed = new Set(base.flatMap((s) => s.appIds));
    const leftovers = apps.filter((a) => !placed.has(a.id)).map((a) => a.id);
    return leftovers.length
      ? [...base, { title: "Everything else", blurb: "More apps in your workspace.", appIds: leftovers }]
      : base;
  }, [apps, api]);

  const byId = useMemo(() => new Map(apps.map((a) => [a.id, a] as const)), [apps]);

  return (
    <ScrollArea className="h-full bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 px-6 py-5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Compass className="size-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Start Here</h1>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          This whole desktop is your workspace — a tiny operating system. Follow the path, and tap
          any tile to open the real app.
        </p>
      </header>

      <div className="px-6 py-6">
        {stages.map((stage, i) => {
          const tiles = stage.appIds
            .map((id) => byId.get(id))
            .filter((a): a is StartHereApp => Boolean(a));
          if (!tiles.length) return null;
          return (
            <div key={stage.title}>
              <section className="flex flex-col gap-4 md:flex-row md:gap-6">
                <div className="md:w-56 md:shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-bold">
                      {i + 1}
                    </span>
                    <h2 className="text-sm font-semibold">{stage.title}</h2>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{stage.blurb}</p>
                </div>
                <div className="flex flex-1 gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {tiles.map((app) => (
                    <Tile key={app.id} app={app} onOpen={() => api.open(app.id)} />
                  ))}
                </div>
              </section>
              {i < stages.length - 1 && (
                <div className="flex justify-center py-3" aria-hidden="true">
                  <span className="size-3 rotate-45 border-b-2 border-r-2 border-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function Tile({ app, onOpen }: { app: StartHereApp; onOpen: () => void }) {
  const Icon = app.icon;
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={`Open ${app.title}`}
      onClick={onOpen}
      className="flex h-auto w-40 shrink-0 flex-col items-start gap-2 whitespace-normal rounded-2xl border border-transparent p-3 text-left hover:border-border"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-muted text-foreground">
        <Icon className="size-6" />
      </span>
      <span className="text-sm font-semibold">{app.title}</span>
      {app.description && (
        <span className="line-clamp-2 text-xs font-normal text-muted-foreground">{app.description}</span>
      )}
    </Button>
  );
}
