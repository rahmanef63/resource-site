"use client";

import * as React from "react";
import { CheckCircle2, FileText, Save, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportBlock } from "@/components/admin/export-block";
import { RegistryRowDialog } from "@/components/admin/registry-row-dialog";
import { useAdminState } from "@/lib/admin/storage";
import { HIDDEN_KEY, emitHiddenTs } from "@/lib/admin/hidden";
import type { SliceManifest } from "@/lib/admin/registry";

const CATEGORY_TONE: Record<string, string> = {
  infra: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  payments: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ui: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  content: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ai: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

export function RegistryTable({ slices }: { slices: SliceManifest[] }) {
  const [hidden, setHidden] = useAdminState<string[]>(HIDDEN_KEY, []);
  const [openSlug, setOpenSlug] = React.useState<string | null>(null);
  const [showExport, setShowExport] = React.useState(false);

  const hiddenSet = React.useMemo(() => new Set(hidden), [hidden]);
  const ordered = React.useMemo(
    () =>
      slices.slice().sort((a, b) => {
        const ah = hiddenSet.has(a.slug) ? 1 : 0;
        const bh = hiddenSet.has(b.slug) ? 1 : 0;
        if (ah !== bh) return ah - bh;
        return a.slug.localeCompare(b.slug);
      }),
    [slices, hiddenSet],
  );

  const selected = openSlug ? slices.find((s) => s.slug === openSlug) ?? null : null;

  function toggle(slug: string) {
    setHidden((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {slices.length - hiddenSet.size} visible · {hiddenSet.size} hidden ·{" "}
          <span className="font-mono">{slices.length}</span> total · click row for details
        </p>
        <Button
          size="sm"
          variant={hiddenSet.size > 0 ? "default" : "outline"}
          className="gap-1.5"
          disabled={hiddenSet.size === 0}
          onClick={() => setShowExport(true)}
        >
          <Save className="size-3.5" />
          Export hidden list
        </Button>
      </div>

      <section className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[24%]">Slug</TableHead>
              <TableHead className="w-[10%]">Version</TableHead>
              <TableHead className="w-[14%]">Category</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[8%] text-center">Contract</TableHead>
              <TableHead className="w-[8%] text-center">Manifest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((s) => {
              const isH = hiddenSet.has(s.slug);
              return (
                <TableRow
                  key={s.slug}
                  className={`cursor-pointer hover:bg-accent/50 ${isH ? "opacity-50" : ""}`}
                  onClick={() => setOpenSlug(s.slug)}
                >
                  <TableCell className="font-mono text-xs font-medium">
                    <span className={isH ? "line-through" : undefined}>{s.slug}</span>
                    {isH && (
                      <Badge variant="outline" className="ml-2 text-[9px]">
                        hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">{s.version}</TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </section>

      <RegistryRowDialog
        slice={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setOpenSlug(null)}
        isHidden={selected ? hiddenSet.has(selected.slug) : false}
        onToggleHide={toggle}
      />

      {showExport && (
        <ExportBlock
          filename="lib/content/hidden-slugs.ts"
          source={emitHiddenTs(hidden)}
          description="Commit this file, then wire isHidden(slug) into public catalog consumers."
        />
      )}
    </>
  );
}
