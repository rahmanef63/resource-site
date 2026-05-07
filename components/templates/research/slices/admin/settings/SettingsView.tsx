"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { DEFAULT_SITE_CONFIG } from "../../../shared/site-config";

export function SettingsView() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Pengaturan" title="Settings" subtitle="Konfigurasi workspace, AI, dan branding." />

      <Card className="border-border/60 bg-card/60">
        <CardContent className="space-y-3 p-5">
          <h3 className="text-base font-medium">Brand</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs">Brand name</Label>
              <Input defaultValue={c.brandName} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Owner</Label>
              <Input defaultValue={c.ownerName} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input defaultValue={c.email} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Domain</Label>
              <Input defaultValue={c.baseUrl} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="space-y-3 p-5">
          <h3 className="text-base font-medium">AI</h3>
          <p className="text-sm text-muted-foreground">
            Mode akademik EYD aktif. Provider AI router akan memilih tier (nano/mid/flagship) sesuai kompleksitas
            tugas — citation extract pakai nano, lit synthesis pakai flagship.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
