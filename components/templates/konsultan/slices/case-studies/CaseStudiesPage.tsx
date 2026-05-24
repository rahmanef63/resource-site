"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate, slugify, useClients, useProjects, useProposals } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function CaseStudiesPage() {
  const projects = useProjects();
  const clients = useClients();
  const proposals = useProposals();
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const proposalMap = new Map(proposals.map((p) => [p.id, p]));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Pengalaman"
        title="Case Studies"
        subtitle="Engagement yang telah dikerjakan untuk klien kami."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const client = clientMap.get(p.clientId);
          return (
            <Link key={p.id} href={`${PUBLIC_BASE}/case-studies/${slugify(p.name)}`}>
              <Card className="group h-full border-border/60 bg-card/60 transition-colors hover:border-foreground/30">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-muted-foreground" />
                    <Badge variant="outline" className="rounded-full text-[10px]">{client?.industry ?? "—"}</Badge>
                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">{p.status}</Badge>
                  </div>
                  <h3 className="flex items-center gap-1 text-lg font-medium">
                    {p.name}
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <p className="text-xs text-foreground/70">
                    <strong>Klien:</strong> {client?.company ?? "—"} · {client?.city ?? ""}
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                    <div className="h-full bg-foreground/70" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Started {fmtDate(p.startedAt)} · {p.progress}% progress
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
