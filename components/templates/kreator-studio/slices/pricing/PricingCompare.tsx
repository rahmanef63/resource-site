"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";

const COMPARE_ROWS = [
  { label: "Brief call", values: ["—", "Async", "45 min", "2 jam workshop"] },
  { label: "Revisi", values: ["1", "2", "Unlimited dalam scope", "Unlimited dalam 14 hari"] },
  { label: "Tracking", values: ["UTM + email report", "—", "Weekly dashboard", "—"] },
  { label: "Distribusi", values: ["Newsletter saja", "Asset only", "30 hari plan", "Roadmap 90 hari"] },
];

export function PricingCompare() {
  return (
    <div className="mt-20">
      <SectionHead eyebrow="Compare" title="Apa yang masuk per paket" />
      <Card className="mt-6 overflow-x-auto border-border/60">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Detail</th>
                <th className="p-3 font-medium">Newsletter</th>
                <th className="p-3 font-medium">Carousel Pack</th>
                <th className="p-3 font-medium">Custom Production</th>
                <th className="p-3 font-medium">Strategy Sprint</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r) => (
                <tr key={r.label} className="border-t border-border/40">
                  <td className="p-3 font-medium text-foreground/85">{r.label}</td>
                  {r.values.map((v, i) => (
                    <td key={i} className="p-3 text-muted-foreground">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
