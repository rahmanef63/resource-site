"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DELIVERY_META, SEED_DELIVERIES, SEED_ENDPOINTS } from "./seed";

export function DeliveryTable() {
  return (
    <div className="divide-y rounded-lg border bg-card">
      <div className="grid grid-cols-[80px_1fr_140px_60px_60px_28px] gap-2 px-3 py-2 text-[9px] uppercase tracking-wide text-muted-foreground">
        <span>When</span>
        <span>Endpoint · event</span>
        <span>Status</span>
        <span className="text-right">HTTP</span>
        <span className="text-right">ms</span>
        <span />
      </div>
      {SEED_DELIVERIES.map((d) => {
        const endpoint = SEED_ENDPOINTS.find((e) => e.id === d.endpointId);
        const meta = DELIVERY_META[d.status];
        return (
          <div
            key={d.id}
            className="grid grid-cols-[80px_1fr_140px_60px_60px_28px] items-center gap-2 px-3 py-2 text-xs"
          >
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatTime(d.at)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{endpoint?.description ?? "(deleted)"}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{d.event}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={"text-[10px] uppercase " + meta.tone}>
                {meta.label}
              </Badge>
              {d.attempt > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground">×{d.attempt + 1}</span>
              )}
            </div>
            <span className="text-right font-mono text-[10px] text-muted-foreground">
              {d.httpCode || "—"}
            </span>
            <span className="text-right font-mono text-[10px] tabular-nums text-muted-foreground">
              {d.durationMs}
            </span>
            <Button variant="ghost" size="icon" className="size-6" title="Retry">
              <RefreshCcw className="size-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${hh}:${mm}`;
}
