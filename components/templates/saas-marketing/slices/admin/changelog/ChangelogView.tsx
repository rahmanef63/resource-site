"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, useStore } from "../../../shared/store";

const KIND_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  feature: "default",
  fix: "secondary",
  chore: "outline",
};

export function ChangelogView() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
        <p className="text-sm text-muted-foreground">{state.changelog.length} entries published on the public site.</p>
      </div>
      <Card className="border-border/60">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {state.changelog.map((e) => (
              <li key={e.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm md:grid-cols-12 md:items-center">
                <p className="font-mono text-xs md:col-span-2">{e.version}</p>
                <Badge variant={KIND_VARIANT[e.kind] ?? "outline"} className="w-fit md:col-span-1">{e.kind}</Badge>
                <div className="md:col-span-7">
                  <p className="truncate font-medium">{e.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.body}</p>
                </div>
                <p className="text-xs text-muted-foreground md:col-span-2 md:text-right">{fmtDate(e.date)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
