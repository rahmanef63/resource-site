"use client";

import { Mic, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useVoices } from "../../../shared/store";

export function VoiceView() {
  const voices = useVoices();
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Voice"
        title="Brand Voice Trainer"
        subtitle="Train AI dengan do/don't examples — output AI selalu match voice kamu."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Mic} label="Voice profiles" value={voices.length} />
        <StatCard label="Total examples" value={voices.reduce((s, v) => s + v.doExamples.length + v.dontExamples.length, 0)} />
        <StatCard label="Mode utama" value={voices[0]?.tone ?? "—"} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Voice baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {voices.map((v) => (
          <Card key={v.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{v.name}</p>
                <Badge variant="outline" className="rounded-full text-[10px]">trained {fmtDate(v.trainedAt)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{v.description}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Tone: {v.tone}</p>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-[10px] font-semibold uppercase text-emerald-400">DO</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-foreground/80">
                    {v.doExamples.map((e, i) => <li key={i}>· {e}</li>)}
                  </ul>
                </div>
                <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3">
                  <p className="text-[10px] font-semibold uppercase text-rose-400">DON&apos;T</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-foreground/80">
                    {v.dontExamples.map((e, i) => <li key={i}>· {e}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
