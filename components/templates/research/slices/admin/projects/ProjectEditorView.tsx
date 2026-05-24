"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_BASE } from "../../../shared/nav-config";
import { useProject, useStore } from "../../../shared/store";
import type { Project, ProjectStatus } from "../../../shared/types";

const STATUSES: ProjectStatus[] = ["exploring", "active", "writing", "submitted", "archived"];

function blankProject(): Project {
  const now = Date.now();
  return {
    id: `proj-${now.toString(36)}`,
    title: "Proyek baru",
    hypothesis: "",
    status: "exploring",
    startedAt: now,
    updatedAt: now,
    targetVenue: "",
    linkedDocIds: [],
    linkedNoteIds: [],
    collaboratorIds: [],
    progress: 0,
  };
}

export function ProjectEditorView({ id }: { id: string }) {
  const router = useRouter();
  const { dispatch } = useStore();
  const isNew = id === "new";
  const existing = useProject(id);
  if (!isNew && !existing) notFound();

  const [draft, setDraft] = React.useState<Project>(() => existing ?? blankProject());

  React.useEffect(() => {
    if (existing) setDraft(existing);
  }, [existing]);

  function save() {
    if (!draft.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }
    dispatch({ type: "project.upsert", project: { ...draft, updatedAt: Date.now() } });
    toast.success(isNew ? "Proyek dibuat" : "Proyek disimpan");
    if (isNew) router.push(`${ADMIN_BASE}/projects/${draft.id}`);
  }

  function remove() {
    if (!confirm(`Hapus proyek "${draft.title}"?`)) return;
    dispatch({ type: "project.delete", id: draft.id });
    toast.success("Proyek dihapus");
    router.push(`${ADMIN_BASE}/projects`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`${ADMIN_BASE}/projects`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Kembali ke daftar
        </Link>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="ghost" size="sm" onClick={remove} className="text-rose-400">
              <Trash2 className="size-3.5" /> Hapus
            </Button>
          )}
          <Button size="sm" onClick={save}>
            <Save className="size-3.5" /> Simpan
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">
              Judul proyek
            </Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Misal: Beban kognitif platform UMKM digital..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hypothesis" className="text-xs uppercase tracking-wider text-muted-foreground">
              Hipotesis
            </Label>
            <Textarea
              id="hypothesis"
              value={draft.hypothesis}
              onChange={(e) => setDraft({ ...draft, hypothesis: e.target.value })}
              rows={4}
              placeholder="Pernyataan terukur yang akan diuji..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => setDraft({ ...draft, status: v as ProjectStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venue" className="text-xs uppercase tracking-wider text-muted-foreground">
                Target venue
              </Label>
              <Input
                id="venue"
                value={draft.targetVenue}
                onChange={(e) => setDraft({ ...draft, targetVenue: e.target.value })}
                placeholder="Jurnal / konferensi"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="progress" className="text-xs uppercase tracking-wider text-muted-foreground">
              Progress ({draft.progress}%)
            </Label>
            <input
              id="progress"
              type="range"
              min={0}
              max={100}
              step={5}
              value={draft.progress}
              onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="space-y-3 p-5 text-sm">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Linked entities</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full">{draft.linkedDocIds.length} dokumen</Badge>
            <Badge variant="outline" className="rounded-full">{draft.linkedNoteIds.length} note</Badge>
            <Badge variant="outline" className="rounded-full">
              {draft.collaboratorIds.length} kolaborator
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Linked entity picker akan ditambahkan di iterasi berikutnya. Sementara, edit via dokumen / kolaborator
            view langsung.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
