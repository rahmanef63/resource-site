"use client";

import * as React from "react";
import { CheckCircle2, Mail, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rel, useStore, useSubscribers } from "../../../shared/store";

export function NewsletterView() {
  const subs = useSubscribers();
  const { dispatch } = useStore();

  const counts = {
    all: subs.length,
    confirmed: subs.filter((s) => s.status === "confirmed").length,
    pending: subs.filter((s) => s.status === "pending").length,
    unsub: subs.filter((s) => s.status === "unsubscribed").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
          <p className="text-sm text-muted-foreground">
            {counts.confirmed} confirmed · {counts.pending} pending · {counts.unsub} unsub
          </p>
        </div>
        <Button size="sm" className="gap-1"><Send className="size-4" /> Compose campaign</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard label="Confirmed subs" value={counts.confirmed.toString()} icon={CheckCircle2} />
        <KpiCard label="Pending double opt-in" value={counts.pending.toString()} icon={Mail} />
        <KpiCard label="Unsubscribed" value={counts.unsub.toString()} icon={X} />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {subs.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Belum ada subscriber. Buka tab Public — submit form newsletter untuk demo.
            </p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Subscribed</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-mono text-xs">{s.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          "rounded-full text-[10px] " +
                          (s.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15"
                            : s.status === "pending"
                              ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15"
                              : "bg-muted text-muted-foreground")
                        }
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{rel(s.ts)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => dispatch({ type: "subscriber.confirm", id: s.id })}>
                            Confirm
                          </Button>
                        )}
                        {s.status !== "unsubscribed" && (
                          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "subscriber.unsubscribe", id: s.id })}>
                            <X className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="flex items-center gap-3 p-5">
        <Icon className="size-5 text-muted-foreground" />
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
