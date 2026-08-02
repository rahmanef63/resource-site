import { GitBranch } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { LineageTable } from "@/components/admin/lineage-table";
import { loadDna, flattenLineage } from "@/lib/admin/lineage";

export const metadata = {
  title: "Admin · Lineage",
  robots: { index: false, follow: false },
};

export default async function AdminLineagePage() {
  const dnas = await loadDna();
  const lineage = flattenLineage(dnas, 50);
  const hops = dnas.reduce((n, d) => n + d.lineage.length, 0);
  const actors = new Set(
    dnas.flatMap((d) => d.lineage.map((l) => l.actor).filter(Boolean) as string[]),
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Inspect"
        title="DNA lineage — history archive"
        description="Harvest hop history from .kitab/lineage/*.dna.json. Read-only archive of past transforms (alias-rewrite, clerk-strip, namespace-rename, etc). BSDL consumer-drift tracking removed 2026-05-16."
      />

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Slices tracked" value={dnas.length} hint="DNA files present" />
        <StatCard label="Total hops" value={hops} hint="harvest, rename, strip…" />
        <StatCard label="Distinct actors" value={actors.size} hint="users + agents" />
      </section>

      {dnas.length === 0 ? <EmptyState /> : <LineageTable rows={lineage} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-16 text-center">
      <GitBranch className="size-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">No DNA files yet</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        Lineage records appear here after the first <code>rr lift</code> writes to{" "}
        <code>.kitab/lineage/*.dna.json</code>.
      </p>
    </div>
  );
}
