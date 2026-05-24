"use client";

import * as React from "react";
import { Database, ExternalLink, Filter, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { rel, useDatasets, useStore } from "../../../shared/store";
import type { Dataset } from "../../../shared/types";

const FORMAT_TONE: Record<Dataset["format"], string> = {
  csv: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
  json: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15",
  parquet: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/15",
  xlsx: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/15",
  geojson: "bg-teal-500/15 text-teal-300 hover:bg-teal-500/15",
  sav: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15",
};

type FormatFilter = Dataset["format"] | "all";

function fmtRows(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toString();
}

function fmtSize(mb: number) {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + " GB";
  if (mb < 1) return (mb * 1024).toFixed(0) + " KB";
  return mb.toFixed(1) + " MB";
}

export function DatasetsView() {
  const datasets = useDatasets();
  const { dispatch } = useStore();
  const [q, setQ] = React.useState("");
  const [fmt, setFmt] = React.useState<FormatFilter>("all");

  const formats = React.useMemo(
    () => Array.from(new Set(datasets.map((d) => d.format))) as Dataset["format"][],
    [datasets],
  );

  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    return datasets.filter((d) => {
      if (fmt !== "all" && d.format !== fmt) return false;
      if (!needle) return true;
      return (
        d.name.toLowerCase().includes(needle) ||
        d.source.toLowerCase().includes(needle) ||
        d.description.toLowerCase().includes(needle)
      );
    });
  }, [datasets, q, fmt]);

  const totalRows = datasets.reduce((s, d) => s + d.rows, 0);
  const totalMB = datasets.reduce((s, d) => s + d.sizeMB, 0);

  function addQuickDataset() {
    dispatch({
      type: "dataset.upsert",
      dataset: {
        id: `ds-${Date.now().toString(36)}`,
        name: "Dataset baru",
        source: "—",
        format: "csv",
        rows: 0,
        sizeMB: 0,
        license: "TBD",
        lastUpdated: Date.now(),
        description: "Tambahkan deskripsi dataset di sini.",
        url: "#",
      },
    });
    toast.success("Dataset baru ditambahkan");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Datasets</h1>
          <p className="text-sm text-muted-foreground">
            {datasets.length} dataset · {fmtRows(totalRows)} baris total · {fmtSize(totalMB)}
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari dataset..."
            className="h-9 w-48"
          />
          <Button size="sm" className="gap-1" onClick={addQuickDataset}>
            <Plus className="size-4" /> Dataset baru
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Filter className="size-3.5 self-center text-muted-foreground" />
        <Button
          type="button"
          variant={fmt === "all" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFmt("all")}
          className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
        >
          Semua ({datasets.length})
        </Button>
        {formats.map((f) => (
          <Button
            key={f}
            type="button"
            variant={fmt === f ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFmt(f)}
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
          >
            {f} ({datasets.filter((d) => d.format === f).length})
          </Button>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Tidak ada dataset yang cocok. Ubah filter atau tambahkan dataset baru.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="px-4 py-3 text-left">Dataset</th>
                    <th className="px-4 py-3 text-left">Format</th>
                    <th className="px-4 py-3 text-right">Baris</th>
                    <th className="px-4 py-3 text-right">Ukuran</th>
                    <th className="px-4 py-3 text-left">Lisensi</th>
                    <th className="px-4 py-3 text-left">Diperbarui</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <Database className="mt-0.5 size-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{d.name}</p>
                            <p className="text-[11px] text-muted-foreground">{d.source}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={"rounded-full text-[10px] " + FORMAT_TONE[d.format]}>{d.format}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmtRows(d.rows)}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmtSize(d.sizeMB)}</td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">{d.license}</td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">{rel(d.lastUpdated)}</td>
                      <td className="flex items-center gap-1 px-4 py-3">
                        <Button asChild size="sm" variant="ghost">
                          <a href={d.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Hapus dataset "${d.name}"?`)) {
                              dispatch({ type: "dataset.delete", id: d.id });
                              toast.success("Dataset dihapus");
                            }
                          }}
                        >
                          <Trash2 className="size-3.5 text-rose-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
