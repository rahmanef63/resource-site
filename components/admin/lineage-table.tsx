"use client";

import * as React from "react";
import { ArrowRight, Save } from "lucide-react";
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
import { LineageRowDialog } from "@/components/admin/lineage-row-dialog";
import { useAdminState } from "@/lib/admin/storage";
import { HIDDEN_KEY, emitHiddenTs } from "@/lib/admin/hidden";
import type { LineageRow } from "@/lib/admin/lineage";

function shortPath(p: string): string {
  if (!p || p === "—") return p;
  const segs = p.split("/").filter(Boolean);
  if (segs.length <= 2) return p;
  return ".../" + segs.slice(-2).join("/");
}

export function LineageTable({ rows }: { rows: LineageRow[] }) {
  const [hidden, setHidden] = useAdminState<string[]>(HIDDEN_KEY, []);
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const [showExport, setShowExport] = React.useState(false);

  const hiddenSet = React.useMemo(() => new Set(hidden), [hidden]);
  const selected = openIdx !== null ? rows[openIdx] ?? null : null;

  function toggle(slug: string) {
    setHidden((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  return (
    <>
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Recent lineage</h2>
          <span className="text-[11px] text-muted-foreground">
            last {rows.length} transform(s) · newest first · click row for details
          </span>
        </div>
        <Button
          size="sm"
          variant={hiddenSet.size > 0 ? "default" : "outline"}
          className="gap-1.5"
          disabled={hiddenSet.size === 0}
          onClick={() => setShowExport(true)}
        >
          <Save className="size-3.5" />
          Export hidden ({hiddenSet.size})
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Slice</TableHead>
              <TableHead className="w-[28%]">From → To</TableHead>
              <TableHead>Transforms</TableHead>
              <TableHead className="w-[14%]">Actor</TableHead>
              <TableHead className="w-[12%] text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const isH = hiddenSet.has(r.slice);
              return (
                <TableRow
                  key={`${r.slice}-${i}`}
                  className={`cursor-pointer hover:bg-accent/50 ${isH ? "opacity-50" : ""}`}
                  onClick={() => setOpenIdx(i)}
                >
                  <TableCell className="font-mono text-xs">
                    <span className={isH ? "line-through" : undefined}>{r.slice}</span>
                    {isH && (
                      <Badge variant="outline" className="ml-2 text-[9px]">
                        hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate" title={r.from}>
                        {shortPath(r.from)}
                      </span>
                      <ArrowRight className="size-3 shrink-0 text-muted-foreground/60" />
                      <span className="truncate" title={r.to}>
                        {shortPath(r.to)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.transforms.slice(0, 2).map((t) => (
                        <Badge key={t} variant="secondary" className="font-mono text-[10px]">
                          {t}
                        </Badge>
                      ))}
                      {r.transforms.length > 2 && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          +{r.transforms.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.actor}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {r.at.slice(0, 10)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LineageRowDialog
        row={selected}
        open={selected !== null}
        onOpenChange={(o) => !o && setOpenIdx(null)}
        isHidden={selected ? hiddenSet.has(selected.slice) : false}
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
