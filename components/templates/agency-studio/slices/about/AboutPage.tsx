"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";

const TEAM = [
  { name: "Asti R.",   role: "Studio principal", initials: "AR" },
  { name: "Bagas P.",  role: "Design lead",      initials: "BP" },
  { name: "Citra W.",  role: "Strategy lead",    initials: "CW" },
  { name: "Daniel S.", role: "Engineering lead", initials: "DS" },
];

const VALUES = [
  { k: "Strategy first", v: "Every visual move ties back to a positioning bet." },
  { k: "Build with you", v: "Embedded sprints — your team learns the system, not just the deliverable." },
  { k: "Ship to learn",  v: "We measure adoption, not pixels. Six-week revisits, free." },
];

export function AboutPage() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHead
        eyebrow="About"
        title={`${c.studioName} — founded ${c.studioFounded}`}
        subtitle={c.description}
      />
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {VALUES.map((v) => (
          <Card key={v.k} className="border-border/60">
            <CardContent className="p-5">
              <p className="font-medium">{v.k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{v.v}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="mt-14">
        <h2 className="text-lg font-medium">Team</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {TEAM.map((t) => (
            <li key={t.name} className="flex items-center gap-3 rounded-md border border-border/60 p-3">
              <div className="grid size-10 place-items-center rounded-full bg-muted text-xs font-medium">{t.initials}</div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
