"use client";

import { Layers, Package, Server, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SliceEntry } from "@/lib/content/slices";

function BentoCard({
  icon: Icon, label, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[7rem] flex-col rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full max-h-32">
          <div className="pr-2">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function BentoMetadata({ slice }: { slice: SliceEntry }) {
  const hasConvex = slice.convexPaths && slice.convexPaths.length > 0;
  const hasNpm = slice.npm && slice.npm.length > 0;
  const hasEnv = slice.env && slice.env.length > 0;
  const hasShadcn = slice.shadcn && slice.shadcn.length > 0;
  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
      <BentoCard icon={Layers} label="Frontend">
        <code className="text-[11px] break-all">{slice.slicePath}</code>
        {hasShadcn && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {slice.shadcn!.map((c) => (
              <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
            ))}
          </div>
        )}
      </BentoCard>

      <BentoCard icon={Server} label="Backend">
        {hasConvex ? (
          <div className="space-y-1">
            {slice.convexPaths!.map((p) => (
              <code key={p} className="block text-[11px] break-all">{p}</code>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">Frontend-only slice.</p>
        )}
      </BentoCard>

      <BentoCard icon={Package} label="npm">
        {hasNpm ? (
          <div className="flex flex-wrap gap-1">
            {slice.npm!.map((p) => (
              <code key={p} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{p}</code>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">No external deps.</p>
        )}
      </BentoCard>

      <BentoCard icon={Settings2} label="Env">
        {hasEnv ? (
          <ul className="space-y-1.5">
            {slice.env!.map((e) => (
              <li key={e.name} className="text-[11px]">
                <code className="rounded bg-muted px-1 py-0.5">{e.name}</code>
                <Badge variant="outline" className="ml-1 text-[9px]">{e.scope}</Badge>
                {e.description && (
                  <span className="ml-1 text-muted-foreground">{e.description}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-muted-foreground">No env vars required.</p>
        )}
      </BentoCard>
    </div>
  );
}
