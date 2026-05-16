import { GaugeCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slices } from "@/lib/content/slices";
import { computeQuality, computeQualityBars } from "@/lib/telemetry/score";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Admin · Quality",
  robots: { index: false, follow: false },
};

const BAND_TONE: Record<string, string> = {
  A: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  B: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  C: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  D: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  F: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

/**
 * Deterministic placeholder inputs keyed off slice slug. TODO(telemetry-live):
 * replace with `telemetry.queries.getSliceStats` once events accumulate.
 */
function mockInputsForSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return {
    auditScore: 55 + (h % 46),
    usageCount: (h >> 5) % 60,
    driftAvg: (h >> 11) % 50,
  };
}

export default function AdminQualityPage() {
  const rows = slices
    .map((s) => {
      const inputs = mockInputsForSlug(s.slug);
      return {
        slice: s,
        score: computeQuality(inputs),
        bars: computeQualityBars(inputs),
      };
    })
    .sort((a, b) => b.score.overall - a.score.overall);

  const bandCounts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.score.band] = (acc[r.score.band] ?? 0) + 1;
    return acc;
  }, {});
  const avg = rows.length
    ? Math.round(rows.reduce((n, r) => n + r.score.overall, 0) / rows.length)
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inspect"
        title="Slice quality scoring"
        description="Audit-bp (40%) + consumer usage (30%) + inverse drift (30%). Bands A ≥90 · B ≥80 · C ≥70 · D ≥60 · F <60. Mock inputs today — swap for live telemetry once events accumulate."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Avg score" value={avg} hint="across all slices" icon={GaugeCircle} />
        <StatCard
          label="A-band"
          value={bandCounts.A ?? 0}
          hint="≥90 — exemplary"
          tone={(bandCounts.A ?? 0) > 0 ? "ok" : "default"}
        />
        <StatCard
          label="D / F"
          value={(bandCounts.D ?? 0) + (bandCounts.F ?? 0)}
          hint="<70 — investigate"
          tone={(bandCounts.D ?? 0) + (bandCounts.F ?? 0) > 0 ? "warn" : "ok"}
        />
        <StatCard
          label="Total slices"
          value={rows.length}
          hint="scored from lib/content/slices.ts"
        />
      </section>

      <section className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Slice</TableHead>
              <TableHead className="w-[8%]">Band</TableHead>
              <TableHead className="w-[10%] text-right">Score</TableHead>
              <TableHead>Audit</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Drift (inv)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ slice, score, bars }) => (
              <TableRow key={slice.slug}>
                <TableCell>
                  <div className="font-medium">{slice.title}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {slice.slug}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("font-mono", BAND_TONE[score.band])}
                  >
                    {score.band}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {score.overall}
                </TableCell>
                <TableCell>
                  <BreakdownBar value={bars.audit} />
                </TableCell>
                <TableCell>
                  <BreakdownBar value={bars.usage} />
                </TableCell>
                <TableCell>
                  <BreakdownBar value={bars.drift} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function BreakdownBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Progress value={value} className="h-1.5 w-24" />
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
