"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { SEED_TEAM } from "../../shared/team-seed";

/**
 * Team page — grid of studio members with avatar, role, bio, location, and
 * optional external links. Uses emoji avatars (no <img>) so we avoid asset
 * provisioning for this OS-style template.
 */
export function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        align="center"
        eyebrow="Team"
        title="Lima orang, satu studio"
        subtitle="Tim kecil yang sengaja. Setiap project punya principal yang bertanggung jawab dari discovery sampai launch — bukan handoff ke account manager."
      />

      <section className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SEED_TEAM.map((m) => (
          <Card key={m.id} className="border-border/60">
            <CardContent className="flex h-full flex-col p-6">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-muted to-muted/40 text-2xl"
                >
                  {m.avatar}
                </div>
                <div>
                  <p className="font-medium leading-tight">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{m.bio}</p>

              <div className="mt-auto pt-5">
                {m.location && (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {m.location}
                  </p>
                )}
                {m.links && m.links.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="inline-block focus-visible:outline-none"
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer font-normal transition-colors hover:bg-muted"
                          >
                            {l.label}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-14 rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm">
          Tertarik bergabung?{" "}
          <Link href="mailto:halo@atelier.studio" className="font-medium underline-offset-4 hover:underline">
            halo@atelier.studio
          </Link>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Kami buka 1–2 posisi per tahun. Tidak ada deadline lamaran formal.
        </p>
      </section>
    </div>
  );
}
