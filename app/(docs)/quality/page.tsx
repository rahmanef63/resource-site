import { Suspense } from "react";
import type { Metadata } from "next";
import { slices } from "@/lib/content/slices";
import { computeQuality, computeQualityBars } from "@/lib/telemetry/score";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function generateMetadata(): Metadata {
  return {
    title: "Slice quality — live scoring dashboard",
    description:
      "Per-slice quality scoring (audit + usage + drift) derived from anonymized consumer telemetry.",
  };
}

/**
 * Deterministic placeholder inputs keyed off slice slug. Each slug yields
 * the same numbers on every render, so the dashboard is stable in
 * development.
 *
 * TODO(telemetry-live): replace with `telemetry.queries.getSliceStats`
 * fan-out once consumer adoption produces enough events to be meaningful.
 * See `convex/features/telemetry/` and `docs/quality-scoring.md`.
 */
function mockInputsForSlug(slug: string): {
  auditScore: number;
  usageCount: number;
  driftAvg: number;
} {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const audit = 55 + (h % 46); // 55..100
  const usage = (h >> 5) % 60; // 0..59
  const drift = (h >> 11) % 50; // 0..49
  return { auditScore: audit, usageCount: usage, driftAvg: drift };
}

const BAND_TONE: Record<string, string> = {
  A: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  B: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  C: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  D: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  F: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function QualityTable() {
  const rows = slices.map((s) => {
    const inputs = mockInputsForSlug(s.slug);
    const score = computeQuality(inputs);
    const bars = computeQualityBars(inputs);
    return { slice: s, score, bars };
  });

  // Sort: highest overall first.
  rows.sort((a, b) => b.score.overall - a.score.overall);

  return (
    <Table>
      <TableCaption>
        Mock scores from deterministic placeholders. Replace with live
        telemetry once events accumulate (see <code>/docs/quality-scoring</code>).
      </TableCaption>
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
              <div className="text-xs text-muted-foreground">{slice.slug}</div>
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
              <BreakdownBar value={bars.audit} label={`${bars.audit}`} />
            </TableCell>
            <TableCell>
              <BreakdownBar value={bars.usage} label={`${bars.usage}`} />
            </TableCell>
            <TableCell>
              <BreakdownBar value={bars.drift} label={`${bars.drift}`} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BreakdownBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Progress value={value} className="h-1.5 w-24" />
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {label}
      </span>
    </div>
  );
}

function QualityTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function QualityPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Slice quality</h1>
        <p className="text-muted-foreground">
          Each slice scored on audit-bp findings (40%), consumer usage (30%),
          and inverse drift (30%). Bands: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, else F.
          See <code>docs/quality-scoring.md</code> for the formula and the
          privacy model behind the underlying telemetry.
        </p>
      </header>
      <Suspense fallback={<QualityTableSkeleton />}>
        <QualityTable />
      </Suspense>
    </div>
  );
}
