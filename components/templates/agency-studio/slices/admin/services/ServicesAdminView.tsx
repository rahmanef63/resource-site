"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "../../../shared/store";

export function ServicesAdminView() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
        <p className="text-sm text-muted-foreground">Productized engagements shown on the public site.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {state.services.map((s) => (
          <Card key={s.id} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{s.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.duration} · {s.priceLabel}</p>
                </div>
                {s.featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.blurb}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {s.bullets.map((b) => <li key={b}>· {b}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
