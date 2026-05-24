"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { SubscriberStatus } from "../../../shared/types";

type Filter = "all" | SubscriberStatus;

export function NewsletterView() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [q, setQ] = React.useState("");

  const counts = React.useMemo(() => ({
    all: state.subscribers.length,
    confirmed: state.subscribers.filter((s) => s.status === "confirmed").length,
    pending: state.subscribers.filter((s) => s.status === "pending").length,
    unsubscribed: state.subscribers.filter((s) => s.status === "unsubscribed").length,
  }), [state.subscribers]);

  const filtered = React.useMemo(() => {
    return state.subscribers
      .filter((s) => filter === "all" || s.status === filter)
      .filter((s) => !q || `${s.email} ${s.source}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.ts - a.ts);
  }, [state.subscribers, filter, q]);

  const recentDraft = state.newsletters.find((n) => n.status === "draft");

  const remove = (id: string, email: string) => {
    if (!confirm(`Hapus subscriber ${email}?`)) return;
    dispatch({ type: "subscriber.delete", id });
    toast.success("Subscriber dihapus");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
          <p className="text-sm text-muted-foreground">
            {counts.confirmed} confirmed · {counts.pending} pending · {counts.unsubscribed} unsubscribed
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email / source…"
            className="h-9 w-64"
          />
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`${ADMIN_BASE}/newsletter/compose`}>
              <Mail className="size-3.5" />
              {recentDraft ? "Continue draft" : "Compose"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {state.newsletters.slice(0, 3).map((n) => (
          <Card key={n.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{n.status}</Badge>
                <span className="text-[10px] text-muted-foreground">
                  {n.status === "sent" ? `Sent ${rel(n.sentAt)}` : rel(n.ts)}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug">{n.subject}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{n.preheader}</p>
              {n.status === "sent" && (
                <p className="text-[10px] text-muted-foreground">
                  Delivered to {n.recipients} subscriber{n.recipients === 1 ? "" : "s"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "confirmed", "pending", "unsubscribed"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
          >
            {f} ({counts[f]})
          </Button>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Belum ada subscriber pada filter ini.
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
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3 font-mono text-xs">{s.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="rounded-full text-[10px] capitalize">{s.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.source}</td>
                      <td className="px-4 py-3 text-muted-foreground">{rel(s.ts)}</td>
                      <td className="flex items-center gap-1 px-4 py-3">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`${ADMIN_BASE}/newsletter/compose?to=${encodeURIComponent(s.email)}`}>
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(s.id, s.email)}>
                          <Trash2 className="size-3.5 text-rose-400" />
                        </Button>
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
