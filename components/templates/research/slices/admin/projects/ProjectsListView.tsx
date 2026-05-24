"use client";

import * as React from "react";
import Link from "next/link";
import { Filter, FlaskConical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ADMIN_BASE } from "../../../shared/nav-config";
import { rel, useProjects, useStore } from "../../../shared/store";
import type { ProjectStatus } from "../../../shared/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  exploring: "Exploring",
  active: "Active",
  writing: "Writing",
  submitted: "Submitted",
  archived: "Archived",
};

const STATUS_TONE: Record<ProjectStatus, string> = {
  exploring: "bg-muted text-muted-foreground",
  active: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/15",
  writing: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15",
  submitted: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
  archived: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15",
};

type StatusFilter = ProjectStatus | "all";

export function ProjectsListView() {
  const { dispatch } = useStore();
  const projects = useProjects();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");

  const filtered = React.useMemo(() => {
    return projects.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (q && !(p.title + " " + p.hypothesis).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [projects, q, status]);

  const STATUSES: StatusFilter[] = ["all", "exploring", "active", "writing", "submitted", "archived"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} total · {projects.filter((p) => p.status === "active").length} aktif ·{" "}
            {projects.filter((p) => p.status === "writing").length} writing
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari proyek..."
            className="h-9 w-48"
          />
          <Button asChild size="sm" className="gap-1">
            <Link href={`${ADMIN_BASE}/projects/new`}>
              <Plus className="size-4" /> Proyek baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Filter className="size-3.5 self-center text-muted-foreground" />
        {STATUSES.map((s) => (
          <Button
            key={s}
            type="button"
            variant={status === s ? "secondary" : "outline"}
            size="sm"
            onClick={() => setStatus(s)}
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
          >
            {s === "all" ? "Semua" : STATUS_LABEL[s]} (
            {s === "all" ? projects.length : projects.filter((p) => p.status === s).length})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Tidak ada proyek yang cocok dengan filter. Buat proyek baru atau ubah filter.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <Card key={p.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <FlaskConical className="size-3" />
                      <Badge className={"rounded-full text-[10px] " + STATUS_TONE[p.status]}>
                        {STATUS_LABEL[p.status]}
                      </Badge>
                      <span>·</span>
                      <span className="normal-case tracking-normal">target: {p.targetVenue}</span>
                    </div>
                    <Link
                      href={`${ADMIN_BASE}/projects/${p.id}`}
                      className="block text-base font-medium leading-snug hover:underline"
                    >
                      {p.title}
                    </Link>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Hapus proyek "${p.title}"?`)) {
                        dispatch({ type: "project.delete", id: p.id });
                        toast.success("Proyek dihapus");
                      }
                    }}
                  >
                    <Trash2 className="size-3.5 text-rose-400" />
                  </Button>
                </div>
                <p className="line-clamp-2 text-xs text-foreground/75">{p.hypothesis}</p>
                <div>
                  <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-mono">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500/70"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span>{p.linkedDocIds.length} dokumen</span>
                  <span>{p.linkedNoteIds.length} note</span>
                  <span>{p.collaboratorIds.length} kolaborator</span>
                  <span>· upd {rel(p.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
