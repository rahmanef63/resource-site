"use client";

import { LineChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { usePerformance } from "../../../shared/store";

export function PerformanceView() {
  const metrics = usePerformance();
  const totalViews = metrics.reduce((s, p) => s + p.views, 0);
  const totalFollowers = metrics.reduce((s, p) => s + p.followers, 0);
  const avgEng = metrics.length ? metrics.reduce((s, p) => s + p.engagementRate, 0) / metrics.length : 0;

  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Performance"
        title="Cross-channel Analytics"
        subtitle="Metrik utama dari semua channel — IG, TikTok, YouTube."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={LineChart} label="Total views" value={totalViews.toLocaleString()} />
        <StatCard label="Total followers" value={totalFollowers.toLocaleString()} />
        <StatCard label="Avg engagement" value={`${avgEng.toFixed(1)}%`} />
        <StatCard label="Channels aktif" value={metrics.length} />
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Followers</th>
                <th className="px-4 py-3">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.id} className="border-t border-border/60">
                  <td className="px-4 py-3 capitalize">{m.channel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.period}</td>
                  <td className="px-4 py-3">{m.views.toLocaleString()}</td>
                  <td className="px-4 py-3">{m.followers.toLocaleString()}</td>
                  <td className="px-4 py-3">{m.engagementRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
