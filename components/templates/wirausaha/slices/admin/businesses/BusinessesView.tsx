"use client";

import { Building2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { useBusinesses } from "../../../shared/store";

export function BusinessesView() {
  const businesses = useBusinesses();
  const totalRevenue = businesses.reduce((s, b) => s + b.monthlyRevenue, 0);
  const totalStaff = businesses.reduce((s, b) => s + b.staffCount, 0);
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Multi-unit" title="Businesses" subtitle="Kelola semua unit usaha dari satu tempat." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Building2} label="Total unit" value={businesses.length} />
        <StatCard label="Total staff" value={totalStaff} />
        <StatCard label="Revenue gabungan" value={`Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt/bln`} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Unit baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((b) => (
          <Card key={b.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{b.name}</p>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{b.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Badge variant="outline" className="rounded-full text-[10px]">{b.type}</Badge>
                <span>·</span>
                <span>{b.city}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{b.staffCount} staff</p>
              <p className="text-base font-semibold">Rp {(b.monthlyRevenue / 1_000_000).toFixed(1)}jt</p>
              <p className="text-[10px] text-muted-foreground">revenue bulanan</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
