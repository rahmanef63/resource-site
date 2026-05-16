import { Radar } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadConsumerScan } from "@/lib/admin/scan";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Admin · Scan consumers",
  robots: { index: false, follow: false },
};

const STATE_TONE: Record<string, string> = {
  "in-sync": "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "up-needed": "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "down-needed": "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  diverged: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "consumer-only": "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "kitab-only": "border-slate-500/40 bg-slate-500/10 text-slate-600 dark:text-slate-400",
  "parse-error": "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default async function AdminScanPage() {
  const consumers = await loadConsumerScan();

  const total = consumers.reduce((n, c) => n + c.slices.length, 0);
  const upNeeded = consumers.reduce(
    (n, c) => n + c.slices.filter((s) => s.state === "up-needed").length,
    0,
  );
  const diverged = consumers.reduce(
    (n, c) => n + c.slices.filter((s) => s.state === "diverged" || s.state === "parse-error").length,
    0,
  );
  const reachable = consumers.filter((c) => c.reachable).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inspect"
        title="Consumer mesh scan"
        description="Wraps rr scan-consumers — diffs each consumer's .kitab.json against the kitab's slice.contract.ts. Configure paths via RR_CONSUMERS env (comma-separated name:path pairs). Unreachable on prod by default."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Consumers reachable" value={`${reachable}/${consumers.length}`} icon={Radar} />
        <StatCard label="Slice diffs" value={total} hint="across reachable consumers" />
        <StatCard
          label="UP-needed"
          value={upNeeded}
          hint="consumer ahead of kitab"
          tone={upNeeded > 0 ? "warn" : "ok"}
        />
        <StatCard
          label="Diverged / parse error"
          value={diverged}
          hint="manual intervention"
          tone={diverged > 0 ? "err" : "ok"}
        />
      </section>

      <section className="space-y-6">
        {consumers.map((c) => (
          <article key={c.name} className="rounded-lg border bg-card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {c.path}
                </p>
              </div>
              {c.reachable ? (
                <Badge variant="outline" className="font-mono text-[10px] text-emerald-500">
                  reachable · {c.slices.length} slice(s)
                </Badge>
              ) : (
                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                  unreachable — path missing
                </Badge>
              )}
            </header>
            {c.reachable && c.slices.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-[14%]">Consumer</TableHead>
                    <TableHead className="w-[14%]">Kitab</TableHead>
                    <TableHead className="w-[14%]">State</TableHead>
                    <TableHead className="w-[18%] text-right">Last pull</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.slices.map((s) => (
                    <TableRow key={s.slug}>
                      <TableCell className="font-mono text-xs">{s.slug}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.consumerVersion}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.kitabVersion}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("font-mono text-[10px]", STATE_TONE[s.state])}
                        >
                          {s.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {s.lastPullAt?.slice(0, 10) ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {c.reachable && c.slices.length === 0 && (
              <p className="px-4 py-3 text-xs text-muted-foreground">
                No slices with <code>.kitab.json</code> in this consumer.
              </p>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
