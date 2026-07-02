"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ParsedEtlData } from "../hooks/useEtlImport";

type Props = {
  data: ParsedEtlData;
};

const TABS: Array<{ key: keyof Omit<ParsedEtlData, "fileName" | "periodStart" | "periodEnd">; label: string }> = [
  { key: "penjualan",       label: "Penjualan" },
  { key: "platformSales",   label: "Platform Sales" },
  { key: "vendor",          label: "Vendor" },
  { key: "weeklyFc",        label: "Inventory FC" },
  { key: "leftover",        label: "Leftover" },
  { key: "kasPeriode",      label: "Kas Periode" },
  { key: "salesControl",    label: "Sales Control" },
  { key: "pembelianKredit", label: "Pembelian Kredit" },
  { key: "ikhtisarFC",      label: "Ikhtisar FC" },
  { key: "transferTOTI",    label: "Transfer" },
  { key: "hppProduk",       label: "HPP Produk" },
  { key: "costAnalysis",    label: "Cost Analysis" },
  { key: "cashFlow",        label: "Cash Flow" },
  { key: "insentif",        label: "Insentif" },
  { key: "lpkk",            label: "LPKK" },
];

export function ImportPreview({ data }: Props) {
  const total = TABS.reduce((sum, t) => sum + (data[t.key] as unknown[]).length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{data.fileName}</p>
          <p className="text-xs text-muted-foreground">
            Periode: {data.periodStart || "—"} → {data.periodEnd || "—"}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {total.toLocaleString("id-ID")} record
        </Badge>
      </div>

      <ScrollArea className="h-[280px] rounded-lg border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 backdrop-blur">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Kategori</th>
              <th className="px-4 py-2 text-right font-medium">Jumlah</th>
              <th className="px-4 py-2 text-left font-medium">Sample</th>
            </tr>
          </thead>
          <tbody>
            {TABS.map((tab) => {
              const items = data[tab.key] as Array<Record<string, unknown>>;
              const sample = items[0];
              const sampleStr = sample
                ? Object.entries(sample).slice(0, 3).map(([k, v]) => `${k}=${String(v).slice(0, 24)}`).join(", ")
                : "—";
              return (
                <tr key={tab.key} className="border-t">
                  <td className="px-4 py-2">{tab.label}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {items.length > 0 ? (
                      <Badge variant="secondary">{items.length}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground truncate max-w-[400px]">
                    {sampleStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
