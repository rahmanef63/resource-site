"use client";

import { Plus, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useClients, useInvoices } from "../../../shared/store";

export function BillingView() {
  const invoices = useInvoices();
  const clients = useClients();
  const cmap = new Map(clients.map((c) => [c.id, c]));
  const paid = invoices.filter((i) => i.status === "paid").length;
  const sent = invoices.filter((i) => i.status === "sent").length;
  const overdue = invoices.filter((i) => i.status === "overdue").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Billing"
        title="PajakAware Invoicing"
        subtitle="Auto PPN 11%, e-Faktur compatible, reminder otomatis."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Receipt} label="Total invoice" value={invoices.length} />
        <StatCard label="Lunas" value={paid} />
        <StatCard label="Terkirim" value={sent} />
        <StatCard label="Overdue" value={overdue} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Invoice baru</Button>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nomor</th>
                <th className="px-4 py-3">Klien</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">PPN</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Jatuh tempo</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-mono text-[11px]">{i.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cmap.get(i.clientId)?.company ?? "—"}</td>
                  <td className="px-4 py-3">{i.amountLabel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.ppnLabel}</td>
                  <td className="px-4 py-3 font-medium">{i.totalLabel}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">{i.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(i.dueAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
