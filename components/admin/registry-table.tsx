"use client";

import * as React from "react";
import { CheckCircle2, Eye, EyeOff, FileText, Save, XCircle } from "lucide-react";
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
import { useAdminState } from "@/lib/admin/storage";
import type { SliceManifest } from "@/lib/admin/registry";

const CATEGORY_TONE: Record<string, string> = {
  infra: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  payments: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ui: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  content: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ai: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

function emitHiddenTs(slugs: string[]): string {
  const body = slugs
    .slice()
    .sort()
    .map((s) => `  ${JSON.stringify(s)},`)
    .join("\n");
  return `// Auto-generated from /admin/registry. Slugs listed here are hidden from
// public catalogs (slices page, sitemap, llms.txt, build picker).
export const hiddenSlugs: readonly string[] = [
${body}
] as const;

export function isHidden(slug: string): boolean {
  return hiddenSlugs.includes(slug);
}
`;
}

export function RegistryTable({ slices }: { slices: SliceManifest[] }) {
  const [hidden, setHidden] = useAdminState<string[]>("registry-hidden", []);
  const [showExport, setShowExport] = React.useState(false);

  const hiddenSet = React.useMemo(() => new Set(hidden), [hidden]);

  const ordered = React.useMemo(() => {
    return slices
      .slice()
      .sort((a, b) => {
        const ah = hiddenSet.has(a.slug) ? 1 : 0;
        const bh = hiddenSet.has(b.slug) ? 1 : 0;
        if (ah !== bh) return ah - bh;
        return a.slug.localeCompare(b.slug);
      });
  }, [slices, hiddenSet]);

  function toggle(slug: string) {
    setHidden((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  const visibleCount = slices.length - hiddenSet.size;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {visibleCount} visible · {hiddenSet.size} hidden ·{" "}
          <span className="font-mono">{slices.length}</span> total
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
              <TableHead className="w-[16%]">Slug</TableHead>
              <TableHead className="w-[8%]">Version</TableHead>
              <TableHead className="w-[10%]">Category</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[7%] text-center">Contract</TableHead>
              <TableHead className="w-[7%] text-center">Manifest</TableHead>
              <TableHead className="w-[7%] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((s) => {
              const isHidden = hiddenSet.has(s.slug);
              return (
                <TableRow
                  key={s.slug}
                  className={isHidden ? "opacity-50" : undefined}
                >
                  <TableCell className="font-mono text-xs font-medium">
                    <span className={isHidden ? "line-through" : undefined}>
                      {s.slug}
                    </span>
                    {isHidden && (
                      <Badge variant="outline" className="ml-2 text-[9px]">
                        hidden
                      </Badge>
                    )}
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
                    <div className="line-clamp-1 font-medium">
                      {s.title ?? "—"}
                    </div>
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
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title={isHidden ? "Unhide" : "Hide"}
                      onClick={() => toggle(s.slug)}
                    >
                      {isHidden ? (
                        <Eye className="size-3.5" />
                      ) : (
                        <EyeOff className="size-3.5" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      {showExport && (
        <ExportBlock
          filename="lib/content/hidden-slugs.ts"
          source={emitHiddenTs(hidden)}
          description="Commit this file, then wire isHidden(slug) into public catalog consumers (slices page, sitemap, llms.txt, build picker) to take effect."
        />
      )}
    </>
  );
}
