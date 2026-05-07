"use client";

import { Mail, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useNewsletters } from "../../../shared/store";

export function NewsletterView() {
  const issues = useNewsletters();
  const sent = issues.filter((i) => i.status === "sent");
  const avgOpen = sent.length ? sent.reduce((s, i) => s + i.openRate, 0) / sent.length : 0;
  const totalRecipients = issues[0]?.recipients ?? 0;

  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Newsletter"
        title="Issue Manager"
        subtitle="Compose, schedule, ukur open rate — tanpa pindah platform."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Mail} label="Total issue" value={issues.length} />
        <StatCard label="Subscribers" value={totalRecipients.toLocaleString()} />
        <StatCard label="Avg open rate" value={`${avgOpen.toFixed(1)}%`} />
        <StatCard label="Terjadwal" value={issues.filter((i) => i.status === "scheduled").length} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Issue baru</Button>
      </div>

      <div className="grid gap-3">
        {issues.map((n) => (
          <Card key={n.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">{n.status}</Badge>
                  <span className="text-[11px] text-muted-foreground">{fmtDate(n.scheduledAt)}</span>
                </div>
                {n.status === "sent" && (
                  <span className="text-[11px] text-muted-foreground">
                    {n.recipients.toLocaleString()} · {n.openRate.toFixed(1)}% open
                  </span>
                )}
              </div>
              <p className="text-sm font-medium">{n.subject}</p>
              <p className="text-xs text-muted-foreground">{n.preview}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
