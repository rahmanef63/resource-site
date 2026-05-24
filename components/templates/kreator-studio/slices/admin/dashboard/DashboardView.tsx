"use client";

import Link from "next/link";
import { CalendarDays, Mail, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import {
  NextNewsletterCard,
  PendingCommentsCard,
  PerformanceHighlightsCard,
  UpcomingQueueCard,
} from "./DashboardSections";

/**
 * Mission-control overview. KPIs + upcoming-publish queue + recent comments
 * + per-channel performance highlights + quick-action links.
 */
export function DashboardView() {
  const { state } = useStore();
  const drafts = state.contents.filter((c) => c.status !== "published").length;
  const scheduled = state.contents
    .filter((c) => c.status === "scheduled")
    .sort((a, b) => a.scheduledAt - b.scheduledAt);
  const totalViews = state.performance.reduce((s, p) => s + p.views, 0);
  const totalFollowers = state.performance.reduce((s, p) => s + p.followers, 0);
  const pendingComments = state.commentDrafts.filter((c) => c.status === "draft");
  const topChannel = state.performance
    .slice()
    .sort((a, b) => b.engagementRate - a.engagementRate)[0];
  const nextNewsletter = state.newsletters.find((n) => n.status !== "sent");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Selamat datang kembali</h1>
          <p className="text-sm text-muted-foreground">
            {scheduled.length} content terjadwal · {drafts} draft ·{" "}
            {pendingComments.length} comment menunggu balasan
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`${ADMIN_BASE}/planner`}>Buka planner</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Total views"
          value={totalViews.toLocaleString("id-ID")}
          hint="cross-platform"
        />
        <StatCard
          label="Followers"
          value={totalFollowers.toLocaleString("id-ID")}
          hint="all channels"
        />
        <StatCard
          icon={Mic}
          label="Voice profiles"
          value={state.voices.length}
          href={`${ADMIN_BASE}/voice`}
        />
        <StatCard
          icon={Mail}
          label="Newsletter subs"
          value="12.2K"
          hint="38% avg open"
          href={`${ADMIN_BASE}/newsletter`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <UpcomingQueueCard scheduled={scheduled} />
        <PendingCommentsCard pending={pendingComments} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PerformanceHighlightsCard performance={state.performance} topChannel={topChannel} />
        <NextNewsletterCard next={nextNewsletter} />
      </div>
    </div>
  );
}
