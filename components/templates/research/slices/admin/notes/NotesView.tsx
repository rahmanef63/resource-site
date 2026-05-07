"use client";

import { Plus, StickyNote, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useNotes } from "../../../shared/store";

export function NotesView() {
  const notes = useNotes();
  const linked = notes.filter((n) => n.linkedDocIds.length > 0).length;
  const allTags = new Set(notes.flatMap((n) => n.tags));
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Workspace" title="Smart Notes" subtitle="Catatan dengan backlinks dan concept map." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={StickyNote} label="Total catatan" value={notes.length} />
        <StatCard label="Terlink ke dokumen" value={linked} />
        <StatCard icon={Tag} label="Tag unik" value={allTags.size} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Catatan baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {notes.map((n) => (
          <Card key={n.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="line-clamp-3 text-xs text-foreground/70">{n.body}</p>
              <div className="flex flex-wrap items-center gap-1 pt-2">
                {n.tags.map((t) => (
                  <Badge key={t} variant="outline" className="rounded-full text-[10px]">{t}</Badge>
                ))}
              </div>
              <p className="pt-1 text-[11px] text-muted-foreground">
                {n.linkedDocIds.length} link · diperbarui {fmtDate(n.updatedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
