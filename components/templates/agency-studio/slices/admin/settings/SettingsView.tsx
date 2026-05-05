"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_SITE_CONFIG } from "../../../shared/site-config";

export function SettingsView() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Studio Settings</h1>
        <p className="text-sm text-muted-foreground">Edit components/templates/agency-studio/shared/site-config.ts to update.</p>
      </div>
      <Card className="border-border/60">
        <CardContent className="space-y-3 p-6 text-sm">
          <Row k="Studio name" v={c.studioName} />
          <Row k="Brand" v={c.brandName} />
          <Row k="Tagline" v={c.tagline} />
          <Row k="Founded" v={c.studioFounded} />
          <Row k="Domain" v={c.baseUrl} mono />
          <Row k="Email" v={c.email} mono />
          <Row k="Twitter" v={c.twitter} mono />
          <Row k="Locale" v={c.defaultLocale} />
          <Row k="Theme color" v={c.themeColor} mono />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      {mono ? <span className="font-mono">{v}</span> : <Badge variant="outline">{v}</Badge>}
    </div>
  );
}
