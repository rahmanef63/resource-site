import Link from "next/link";
import {
  ArrowRight,
  Box,
  FileCode,
  GaugeCircle,
  GitBranch,
  Layout,
  PackageSearch,
  Settings,
} from "lucide-react";
import { loadAdminStats } from "@/lib/admin/stats";
import { loadDna, flattenLineage } from "@/lib/admin/lineage";
import { StatCard } from "@/components/admin/stat-card";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";

const EDIT_TILES = [
  { label: "Site", href: "/admin/site", icon: Settings, desc: "Name, tagline, repo URL." },
  { label: "Layouts", href: "/admin/layouts", icon: Layout, desc: "Add/edit page shells." },
  { label: "Sources", href: "/admin/sources", icon: Box, desc: "Source projects + attribution." },
  { label: "Export", href: "/admin/export", icon: FileCode, desc: "Generate TS files to commit." },
];

const INSPECT_TILES = [
  { label: "Lineage", href: "/admin/lineage", icon: GitBranch, desc: "DNA harvest hop history." },
  { label: "Quality", href: "/admin/quality", icon: GaugeCircle, desc: "Per-slice score band A–F." },
  { label: "Registry", href: "/admin/registry", icon: PackageSearch, desc: "Slice manifests + contracts." },
];

export const metadata = {
  title: "Admin · Overview",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const [stats, dnas] = await Promise.all([loadAdminStats(), loadDna()]);
  const recent = flattenLineage(dnas, 6);

  const healthTone =
    stats.healthPct >= 90 ? "ok" : stats.healthPct >= 70 ? "warn" : "err";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Control room"
        description="Edit rr content + inspect slice health. Edit tiles persist to your browser; Inspect tiles read live state from frontend/slices + .kitab/lineage (history archive)."
      />

      <section className="grid grid-cols-3 gap-3">
        <StatCard
          label="Slices"
          value={stats.slices}
          hint="frontend/slices/* with slice.json"
          icon={PackageSearch}
        />
        <StatCard
          label="Typed contracts"
          value={stats.contracts}
          hint={`${stats.slices - stats.contracts} slice(s) without contract`}
          icon={GitBranch}
        />
        <StatCard
          label="Contract health"
          value={`${stats.healthPct}%`}
          hint="contracts ÷ slices"
          icon={GaugeCircle}
          tone={healthTone}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Edit
          </h2>
          <Badge variant="outline" className="text-[10px]">
            local · browser-only
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EDIT_TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md border bg-muted/40">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Inspect
          </h2>
          <Badge variant="outline" className="text-[10px]">
            read-only · live
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INSPECT_TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md border bg-muted/40">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent lineage
          </h2>
          <div className="rounded-lg border bg-card">
            <ul className="divide-y divide-border/60">
              {recent.map((r, i) => (
                <li
                  key={`${r.slice}-${i}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-xs"
                >
                  <span className="font-mono font-medium">{r.slice}</span>
                  <span className="font-mono text-muted-foreground">
                    {r.from} → {r.to}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {r.transforms.slice(0, 3).map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="font-mono text-[10px]"
                      >
                        {t}
                      </Badge>
                    ))}
                    {r.transforms.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{r.transforms.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="ml-auto font-mono text-muted-foreground tabular-nums">
                    {r.at.slice(0, 10)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t px-4 py-2 text-right">
              <Link
                href="/admin/lineage"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Full lineage <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
