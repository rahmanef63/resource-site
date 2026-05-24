"use client";

import Link from "next/link";
import { FileText, Mail, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { rel } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type {
  CommentDraft,
  ContentItem,
  NewsletterIssue,
  PerformanceMetric,
} from "../../../shared/types";

export function UpcomingQueueCard({ scheduled }: { scheduled: ContentItem[] }) {
  return (
    <Card className="border-border/60 bg-card/60 lg:col-span-2">
      <CardContent className="p-6">
        <SectionHead eyebrow="Pipeline" title="Upcoming publish queue" align="left" />
        {scheduled.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Belum ada konten terjadwal. Buka planner untuk schedule batch.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {scheduled.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3 text-sm">
                <FileText className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.channel} · {rel(c.scheduledAt || Date.now())}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                  {c.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function PendingCommentsCard({ pending }: { pending: CommentDraft[] }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-6">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Comments perlu balasan
        </p>
        <h3 className="mt-1 text-base font-medium">{pending.length} draft balasan</h3>
        <ul className="mt-3 space-y-2 text-xs">
          {pending.slice(0, 3).map((c) => (
            <li key={c.id} className="rounded-md border border-border/40 bg-background/40 p-2">
              <p className="line-clamp-1 font-medium text-foreground/85">{c.postRef}</p>
              <p className="line-clamp-1 text-muted-foreground">"{c.comment}"</p>
            </li>
          ))}
        </ul>
        <Button asChild size="sm" className="mt-4 w-full gap-1">
          <Link href={`${ADMIN_BASE}/comments`}>
            <MessageSquare className="size-4" /> Buka comments
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PerformanceHighlightsCard({
  performance,
  topChannel,
}: {
  performance: PerformanceMetric[];
  topChannel?: PerformanceMetric;
}) {
  return (
    <Card className="border-border/60 bg-card/60 lg:col-span-2">
      <CardContent className="p-6">
        <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          Performance highlights
        </p>
        <ul className="space-y-2 text-sm">
          {performance
            .slice()
            .sort((a, b) => b.views - a.views)
            .slice(0, 4)
            .map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                  {p.channel}
                </Badge>
                <span className="flex-1 truncate text-xs text-muted-foreground">{p.period}</span>
                <span className="font-mono text-xs">{p.views.toLocaleString("id-ID")}</span>
                <span className="flex items-center gap-0.5 text-[11px] text-emerald-400">
                  <TrendingUp className="size-3" />
                  {p.engagementRate}%
                </span>
              </li>
            ))}
        </ul>
        {topChannel ? (
          <p className="mt-4 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-foreground/80">
            <Sparkles className="mr-1 inline size-3 text-emerald-300" />
            Top performer:{" "}
            <strong className="capitalize">{topChannel.channel}</strong> dengan engagement{" "}
            {topChannel.engagementRate}% — double-down konten serupa.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function NextNewsletterCard({ next }: { next?: NewsletterIssue }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-6">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Next newsletter
        </p>
        {next ? (
          <>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium">{next.subject}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {next.recipients.toLocaleString("id-ID")} recipients · {rel(next.scheduledAt)}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No draft scheduled.</p>
        )}
        <Button asChild size="sm" variant="outline" className="mt-4 w-full gap-1">
          <Link href={`${ADMIN_BASE}/newsletter`}>
            <Mail className="size-4" /> Buka newsletter
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
