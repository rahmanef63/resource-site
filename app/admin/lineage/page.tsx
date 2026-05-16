import { GitBranch } from "lucide-react";
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
import { loadDna, flattenDrift, flattenLineage } from "@/lib/admin/lineage";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Admin · Lineage",
  robots: { index: false, follow: false },
};

export default async function AdminLineagePage() {
  const dnas = await loadDna();
  const drift = flattenDrift(dnas);
  const lineage = flattenLineage(dnas, 30);
  const hops = dnas.reduce((n, d) => n + d.lineage.length, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inspect"
        title="DNA lineage & consumer drift"
        description="Every harvest hop and consumer adoption recorded in .kitab/lineage/*.dna.json. Drift cells coloured red ≥40% (re-sync will likely conflict — lift improvements UP)."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Slices tracked"
          value={dnas.length}
          hint="DNA files present"
        />
        <StatCard
          label="Lineage hops"
          value={hops}
          hint="harvest, rename, strip…"
        />
        <StatCard label="Drift rows" value={drift.length} hint="consumer × slice" />
        <StatCard
          label="High-drift"
          value={drift.filter((d) => d.drift >= 40).length}
          hint="≥40% — needs UP-sync"
          tone={drift.some((d) => d.drift >= 40) ? "err" : "ok"}
        />
      </section>

      {dnas.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {drift.length > 0 && (
            <Section title="Consumer drift" caption={`${drift.length} row(s) · sorted by drift desc`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slice</TableHead>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Adopted version</TableHead>
                    <TableHead className="text-right">Drift</TableHead>
                    <TableHead className="text-right">Last synced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drift.map((d) => {
                    const tone =
                      d.drift >= 40
                        ? "text-rose-500"
                        : d.drift >= 15
                          ? "text-amber-500"
                          : "text-emerald-500";
                    return (
                      <TableRow key={`${d.slice}-${d.consumer}`}>
                        <TableCell className="font-mono text-xs">{d.slice}</TableCell>
                        <TableCell className="font-mono text-xs">{d.consumer}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {d.version}
                        </TableCell>
                        <TableCell
                          className={cn("text-right font-mono tabular-nums", tone)}
                        >
                          {d.drift}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {d.synced.slice(0, 10)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Section>
          )}

          <Section
            title="Recent lineage"
            caption={`last ${lineage.length} transform(s)`}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[18%]">Slice</TableHead>
                  <TableHead className="w-[24%]">From → To</TableHead>
                  <TableHead>Transforms</TableHead>
                  <TableHead className="w-[14%]">Actor</TableHead>
                  <TableHead className="w-[12%] text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineage.map((r, i) => (
                  <TableRow key={`${r.slice}-${i}`}>
                    <TableCell className="font-mono text-xs">{r.slice}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.from} → {r.to}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {r.transforms.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="font-mono text-[10px]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.actor}</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {r.at.slice(0, 10)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-[11px] text-muted-foreground">{caption}</span>
      </div>
      <div className="rounded-lg border bg-card">{children}</div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-16 text-center">
      <GitBranch className="size-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">No DNA files yet</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        Lineage records appear here after the first <code>rr lift</code> /{" "}
        <code>rr-send</code> harvest writes to <code>.kitab/lineage/*.dna.json</code>.
      </p>
    </div>
  );
}
