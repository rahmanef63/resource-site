"use client";

import { Eye, Heart, LineChart, Sparkles, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { useContents, usePerformance } from "../../../shared/store";

/** Channel KPI strip — used as the second-row inside Analytics. */
const FUNNEL_ROWS = [
  { stage: "Discover (FYP / search)", count: 1_864_000, share: "100%" },
  { stage: "Profile visit",            count: 142_300,    share: "7.6%" },
  { stage: "Follow",                   count: 22_800,     share: "1.2%" },
  { stage: "Newsletter signup",        count: 4_120,      share: "0.22%" },
  { stage: "Paying customer",          count: 218,        share: "0.012%" },
];

/**
 * Creator-economy analytics. KPIs: followers, engagement rate, watch time,
 * CTR, RPM. Plus per-channel performance + audience funnel + content type
 * breakdown. All read-only from store; numbers diff hourly in real product.
 */
export function AnalyticsView() {
  const performance = usePerformance();
  const contents = useContents();
  const published = contents.filter((c) => c.status === "published");

  const totalViews = performance.reduce((s, p) => s + p.views, 0);
  const totalFollowers = performance.reduce((s, p) => s + p.followers, 0);
  const avgEngagement =
    performance.length === 0
      ? 0
      : performance.reduce((s, p) => s + p.engagementRate, 0) / performance.length;

  const watchTimeHrs = Math.round(totalViews * 0.000_42); // illustrative
  const ctrPct = 4.2;
  const rpmIdr = 38_400;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <SectionHead
          eyebrow="Analytics"
          title="Creator KPIs"
          subtitle="Audience growth, engagement, monetisation funnel — cross-platform."
        />
        <Badge variant="outline" className="rounded-full">
          Last 30d
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={Users}
          label="Total followers"
          value={totalFollowers.toLocaleString("id-ID")}
          hint="cross-platform"
        />
        <StatCard
          icon={Eye}
          label="Total views"
          value={totalViews.toLocaleString("id-ID")}
          hint={`${published.length} published`}
        />
        <StatCard
          icon={Heart}
          label="Avg engagement"
          value={`${avgEngagement.toFixed(1)}%`}
          hint="like + comment + save"
        />
        <StatCard
          icon={LineChart}
          label="Watch time"
          value={`${watchTimeHrs.toLocaleString("id-ID")} jam`}
          hint="YT + reels"
        />
        <StatCard
          icon={Sparkles}
          label="RPM"
          value={`Rp ${(rpmIdr / 1000).toFixed(0)}rb`}
          hint={`${ctrPct}% CTR avg`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Per-channel performance */}
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardContent className="p-6">
            <p className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              Performance per channel
            </p>
            <ul className="divide-y divide-border/60">
              {performance
                .slice()
                .sort((a, b) => b.views - a.views)
                .map((p) => {
                  const up = p.engagementRate >= 5;
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px] capitalize"
                      >
                        {p.channel}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{p.period}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {p.followers.toLocaleString("id-ID")} followers
                        </p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {p.views.toLocaleString("id-ID")} views
                      </span>
                      <span
                        className={`flex items-center gap-0.5 text-[11px] ${up ? "text-emerald-400" : "text-amber-300"}`}
                      >
                        {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {p.engagementRate}%
                      </span>
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>

        {/* Audience funnel */}
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <p className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              Audience funnel
            </p>
            <ul className="space-y-2 text-sm">
              {FUNNEL_ROWS.map((row, i) => (
                <li key={row.stage} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-muted text-[10px]">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-xs">{row.stage}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {row.count.toLocaleString("id-ID")}
                  </span>
                  <span className="w-12 text-right text-[10px] text-muted-foreground">
                    {row.share}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Top content from published list */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Top published content
            </p>
            <span className="text-[11px] text-muted-foreground">{published.length} total</span>
          </div>
          <ul className="space-y-2 text-sm">
            {published
              .slice()
              .sort((a, b) => b.views - a.views)
              .slice(0, 6)
              .map((c, i) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="grid size-5 place-items-center rounded-full bg-muted text-[10px]">
                    {i + 1}
                  </span>
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                    {c.channel}
                  </Badge>
                  <span className="flex-1 truncate">{c.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.views.toLocaleString("id-ID")}
                  </span>
                  <Heart className="size-3 text-rose-300" />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {c.likes.toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
