"use client";

import * as React from "react";
import { Bot, ClipboardList, Filter, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { rel, useLeads, useStore } from "../../../shared/store";
import type { LeadStatus } from "../../../shared/types";

export function LeadsView() {
  const leads = useLeads();
  const { dispatch } = useStore();
  const [filter, setFilter] = React.useState<"all" | LeadStatus>("all");

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const counts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    closed: leads.filter((l) => l.status === "closed").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {counts.all} total · {counts.new} new · {counts.contacted} contacted · {counts.closed} closed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><Upload className="size-4" /> Export CSV</Button>
          <Button size="sm" className="gap-1"><Bot className="size-4" /> AI follow-up draft</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {(["all", "new", "contacted", "closed"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
            className={
              "h-7 rounded-full px-3 text-xs capitalize " +
              (filter === s ? "" : "border-border/60 text-muted-foreground")
            }
          >
            {s} ({counts[s as keyof typeof counts]})
          </Button>
        ))}
        <Filter className="ml-auto size-3.5 self-center text-muted-foreground" />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Belum ada lead di kategori ini. Buka tab Public — submit Contact form atau Book service untuk demo.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((l) => (
                <li key={l.id} className="flex flex-wrap items-start gap-3 p-4 hover:bg-accent/30 md:gap-4">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs">
                    {l.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {l.name}
                      {l.status === "new" && (
                        <Badge className="rounded-full bg-amber-500/15 text-[10px] text-amber-300 hover:bg-amber-500/15">new</Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{l.email} — interested in {l.topic}</p>
                    {l.message && <p className="mt-1 text-xs text-foreground/70 italic">"{l.message}"</p>}
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <Badge variant="outline" className="rounded-full text-[10px]">{l.source}</Badge>
                    <span className="text-[11px] text-muted-foreground">{rel(l.ts)}</span>
                    <select
                      value={l.status}
                      onChange={(e) =>
                        dispatch({
                          type: "lead.update",
                          id: l.id,
                          patch: { status: e.target.value as LeadStatus },
                        })
                      }
                      className="rounded-md border bg-background px-2 py-1 text-xs"
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="closed">closed</option>
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(`${l.name} <${l.email}> — ${l.topic}`);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      <ClipboardList className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Hapus lead ${l.name}?`)) {
                          dispatch({ type: "lead.delete", id: l.id });
                        }
                      }}
                    >
                      <Trash2 className="size-3.5 text-rose-400" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
