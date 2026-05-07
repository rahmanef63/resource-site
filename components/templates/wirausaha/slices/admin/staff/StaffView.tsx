"use client";

import { Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useBusinesses, useStaff } from "../../../shared/store";

export function StaffView() {
  const staff = useStaff();
  const businesses = useBusinesses();
  const bizMap = new Map(businesses.map((b) => [b.id, b]));
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Staff" title="Tim & karyawan" subtitle="Kelola staff lintas unit usaha." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total staff" value={staff.length} />
        <StatCard label="Unit dengan staff" value={new Set(staff.map((s) => s.businessId)).size} />
        <StatCard label="Role unik" value={new Set(staff.map((s) => s.role)).size} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Staff baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {staff.map((s) => (
          <Card key={s.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-1 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{s.name}</p>
                <Badge variant="outline" className="rounded-full text-[10px]">{s.role}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{s.phone}</p>
              <p className="text-[11px] text-muted-foreground">
                {bizMap.get(s.businessId)?.name ?? "—"} · gabung {fmtDate(s.joinedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
