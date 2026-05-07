"use client";

import { Plus, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useBusinesses, useFinance } from "../../../shared/store";

export function FinanceView() {
  const finance = useFinance();
  const businesses = useBusinesses();
  const bizMap = new Map(businesses.map((b) => [b.id, b]));
  const incomeCount = finance.filter((f) => f.kind === "income").length;
  const expenseCount = finance.filter((f) => f.kind === "expense").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Finance"
        title="Catatan keuangan"
        subtitle="Income & expense per unit. AI bantu narasi laporan bulanan."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label="Total catatan" value={finance.length} />
        <StatCard label="Income entries" value={incomeCount} />
        <StatCard label="Expense entries" value={expenseCount} />
      </div>

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline">Generate narasi AI</Button>
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Catat baru</Button>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {finance.map((f) => (
                <tr key={f.id} className="border-t border-border/60">
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(f.ts)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={"rounded-full text-[10px] capitalize " + (f.kind === "income" ? "border-emerald-500/40 text-emerald-500" : "border-rose-500/40 text-rose-500")}
                    >
                      {f.kind}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{bizMap.get(f.businessId)?.name ?? "—"}</td>
                  <td className="px-4 py-3">{f.category}</td>
                  <td className="px-4 py-3 font-medium">{f.amountLabel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
