"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Bot,
  Circle,
  CircleDashed,
  Filter,
  PenSquare,
  Sparkles,
  Star,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

export function DashboardView() {
  const { state } = useStore();

  const published = state.posts.filter((p) => p.status === "published");
  const totalViews = published.reduce((sum, p) => sum + p.views, 0);
  const totalLeads = state.leads.length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const subs = state.subscribers.filter((s) => s.status === "confirmed").length;
  const sessions = state.chatSessions.length;

  const KPIS = [
    { label: "Total views", value: totalViews.toLocaleString(), delta: "+8.2%", up: true,  hint: `${published.length} published` },
    { label: "Leads",       value: totalLeads.toString(),        delta: `+${newLeads} new`, up: true,  hint: "from contact + services" },
    { label: "Subscribers", value: subs.toLocaleString(),        delta: "+1.4%", up: true,  hint: "double opt-in only" },
    { label: "Chat sessions",value: sessions.toString(),         delta: sessions > 0 ? `+${sessions}` : "—", up: sessions > 0, hint: sessions === 0 ? "open chat from public" : "live" },
  ];

  const topPosts = [...published].sort((a, b) => b.views - a.views).slice(0, 4);
  const draftsAndScheduled = state.posts.filter((p) => p.status !== "published").slice(0, 5);
  const recentActivity = buildActivity(state).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Selamat datang kembali</h1>
          <p className="text-sm text-muted-foreground">
            {newLeads > 0
              ? `${newLeads} lead baru menunggu — buka tab Public di kitab + isi form Contact untuk demo.`
              : "Semua lead sudah ditangani. Buka tab Public + isi form untuk lihat sync live."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1"><Filter className="size-3.5" /> 30 hari</Button>
          <Button asChild size="sm" className="gap-1">
            <Link href={`${ADMIN_BASE}/posts/new`}><PenSquare className="size-4" /> Tulis post</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {k.up ? <ArrowUp className="size-3 text-emerald-400" /> : <ArrowDown className="size-3 text-rose-400" />}
                <span className={k.up ? "text-emerald-400" : "text-rose-400"}>{k.delta}</span>
                <span className="text-muted-foreground">— {k.hint}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Traffic</p>
                <h3 className="text-base font-medium">Visits last 30 days</h3>
              </div>
            </div>
            <Sparkbars />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Top posts</p>
            <ul className="mt-3 space-y-3">
              {topPosts.length === 0 && (
                <p className="text-xs text-muted-foreground">Belum ada published post.</p>
              )}
              {topPosts.map((p, i) => (
                <li key={p.id} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">{p.views.toLocaleString()} views</p>
                  </div>
                  <TrendingUp className="size-3.5 text-emerald-400" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Drafts &amp; scheduled</p>
                <h3 className="text-base font-medium">Posts in flight</h3>
              </div>
              <Button asChild size="sm" variant="ghost" className="gap-1">
                <Link href={`${ADMIN_BASE}/posts`}>View all <ArrowUpRight className="size-3.5" /></Link>
              </Button>
            </div>
            {draftsAndScheduled.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Semua post sudah dipublish.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {draftsAndScheduled.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 p-4">
                    <StatusDot status={p.status} />
                    <div className="min-w-0 flex-1">
                      <Link href={`${ADMIN_BASE}/posts/${p.id}`} className="truncate text-sm hover:underline">{p.title}</Link>
                      <p className="text-[11px] text-muted-foreground">{p.author} · {rel(p.publishedAt || Date.now())}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">{p.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Recent activity</p>
            <ul className="mt-3 space-y-3">
              {recentActivity.length === 0 && (
                <p className="text-xs text-muted-foreground">Belum ada aktivitas.</p>
              )}
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <a.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <p className="leading-snug text-foreground/85">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>{" "}
                    <span>{a.target}</span>
                    <span className="block text-[10px] text-muted-foreground">{rel(a.ts)}</span>
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI assistant</p>
              <h3 className="text-base font-medium">Quick suggestions</h3>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px]">model: claude-sonnet-4-6</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: PenSquare, title: "Draft follow-up email", blurb: `${newLeads} lead belum dibalas — generate balasan personal.` },
              { icon: Wand2,     title: "Suggest post angle",    blurb: "Top trending topics dari subscribers." },
              { icon: Star,      title: "Boost top performer",   blurb: topPosts[0] ? `“${topPosts[0].title}” → repurpose ke X thread.` : "Publish dulu satu post." },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.title}
                  className="rounded-lg border border-border/60 bg-background/50 p-4 text-left transition hover:border-foreground/30 hover:bg-accent/50"
                >
                  <Icon className="size-4 text-foreground/80" />
                  <p className="mt-2 text-sm font-medium">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.blurb}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "text-muted-foreground",
    scheduled: "text-amber-400",
    review: "text-blue-400",
    published: "text-emerald-400",
  };
  const Icon = status === "draft" ? CircleDashed : Circle;
  return <Icon className={"size-3.5 " + (map[status] ?? "")} />;
}

function buildActivity(state: ReturnType<typeof useStore>["state"]) {
  type Item = { id: string; who: string; what: string; target: string; ts: number; icon: React.ComponentType<{ className?: string }> };
  const items: Item[] = [];

  for (const lead of state.leads) {
    items.push({
      id: `lead:${lead.id}`,
      who: lead.name,
      what: "submitted lead via",
      target: lead.source,
      ts: lead.ts,
      icon: Sparkles,
    });
  }
  for (const c of state.comments) {
    items.push({
      id: `com:${c.id}`,
      who: c.author,
      what: c.status === "spam" ? "blocked spam comment on" : "commented on",
      target: c.postTitle,
      ts: c.ts,
      icon: Bot,
    });
  }
  for (const s of state.subscribers) {
    items.push({
      id: `sub:${s.id}`,
      who: s.email,
      what: "subscribed via",
      target: s.source,
      ts: s.ts,
      icon: Star,
    });
  }
  return items.sort((a, b) => b.ts - a.ts);
}

function Sparkbars() {
  const data = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => 40 + i * 4 + Math.round(Math.sin(i / 2) * 20));
  }, []);
  const max = Math.max(...data);
  return (
    <div className="flex h-44 items-end gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-foreground/15 transition hover:bg-foreground/40"
          style={{ height: `${(v / max) * 100}%` }}
          title={`Day ${i + 1}: ${v}`}
        />
      ))}
    </div>
  );
}
