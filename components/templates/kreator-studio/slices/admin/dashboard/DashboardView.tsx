"use client";

import Link from "next/link";
import { CalendarDays, FileText, Mail, MessageSquare, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

export function DashboardView() {
  const { state } = useStore();
  const drafts = state.contents.filter((c) => c.status !== "published").length;
  const scheduled = state.contents.filter((c) => c.status === "scheduled").length;
  const totalViews = state.performance.reduce((s, p) => s + p.views, 0);
  const totalFollowers = state.performance.reduce((s, p) => s + p.followers, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {scheduled} content terjadwal · {drafts} draft · {state.commentDrafts.length} comment menunggu balasan
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`${ADMIN_BASE}/planner`}>Buka planner</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={CalendarDays} label="Total views" value={totalViews.toLocaleString()} hint="cross-platform" />
        <StatCard label="Followers" value={totalFollowers.toLocaleString()} hint="all channels" />
        <StatCard icon={Mic} label="Voice profiles" value={state.voices.length} href={`${ADMIN_BASE}/voice`} />
        <StatCard icon={Mail} label="Newsletter subs" value="12.2K" hint="38% avg open" href={`${ADMIN_BASE}/newsletter`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardContent className="p-6">
            <SectionHead eyebrow="Pipeline" title="Content terjadwal" align="left" />
            <ul className="divide-y divide-border/60">
              {state.contents.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground">{c.channel} · {rel(c.scheduledAt || Date.now())}</p>
                  </div>
                  <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">{c.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Comments perlu balasan</p>
            <h3 className="mt-1 text-base font-medium">{state.commentDrafts.filter((c) => c.status === "draft").length} draft balasan</h3>
            <Button asChild size="sm" className="mt-4 w-full gap-1">
              <Link href={`${ADMIN_BASE}/comments`}><MessageSquare className="size-4" /> Buka comments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
