import { CheckCircle2, FileText, PackageSearch, XCircle } from "lucide-react";
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
import { loadSliceRegistry } from "@/lib/admin/registry";

export const metadata = {
  title: "Admin · Slice registry",
  robots: { index: false, follow: false },
};

const CATEGORY_TONE: Record<string, string> = {
  infra: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  payments: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ui: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  content: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ai: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

export default async function AdminRegistryPage() {
  const slices = await loadSliceRegistry();
  const withContract = slices.filter((s) => s.hasContract).length;
  const withManifest = slices.filter((s) => s.hasManifest).length;
  const portable = withManifest;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inspect"
        title="Slice registry"
        description="Live read of frontend/slices/*/slice.json. Contract column = slice.contract.ts present (typed DSL). Manifest column = slice.manifest.json present (CLI-distributable via npx rahman-resources add)."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Slices" value={slices.length} icon={PackageSearch} />
        <StatCard
          label="With contract"
          value={withContract}
          hint="typed slice.contract.ts"
          tone={withContract === slices.length ? "ok" : "warn"}
        />
        <StatCard
          label="Portable (manifest)"
          value={portable}
          hint="CLI-distributable"
        />
        <StatCard
          label="Categories"
          value={new Set(slices.map((s) => s.category ?? "—")).size}
        />
      </section>

      <section className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">Slug</TableHead>
              <TableHead className="w-[10%]">Version</TableHead>
              <TableHead className="w-[12%]">Category</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[8%] text-center">Contract</TableHead>
              <TableHead className="w-[8%] text-center">Manifest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slices.map((s) => (
              <TableRow key={s.slug}>
                <TableCell className="font-mono text-xs font-medium">
                  {s.slug}
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums">
                  {s.version}
                </TableCell>
                <TableCell>
                  {s.category && (
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] ${CATEGORY_TONE[s.category] ?? ""}`}
                    >
                      {s.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="line-clamp-1 font-medium">{s.title ?? "—"}</div>
                  {s.description && (
                    <div className="line-clamp-1 text-muted-foreground">
                      {s.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {s.hasContract ? (
                    <CheckCircle2 className="mx-auto size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="mx-auto size-4 text-muted-foreground/60" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {s.hasManifest ? (
                    <FileText className="mx-auto size-4 text-sky-500" />
                  ) : (
                    <XCircle className="mx-auto size-4 text-muted-foreground/60" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
