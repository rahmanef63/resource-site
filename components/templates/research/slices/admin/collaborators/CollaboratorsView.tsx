"use client";

import * as React from "react";
import { Copy, Filter, Mail, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollaborators, useStore } from "../../../shared/store";
import type { Collaborator } from "../../../shared/types";

const ROLE_TONE: Record<Collaborator["role"], string> = {
  PI: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15",
  "co-author": "bg-sky-500/15 text-sky-300 hover:bg-sky-500/15",
  advisor: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/15",
  RA: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
  external: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15",
};

type RoleFilter = Collaborator["role"] | "all";

export function CollaboratorsView() {
  const collaborators = useCollaborators();
  const { dispatch } = useStore();
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState<RoleFilter>("all");

  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    return collaborators.filter((c) => {
      if (role !== "all" && c.role !== role) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.affiliation.toLowerCase().includes(needle) ||
        c.expertise.some((e) => e.toLowerCase().includes(needle))
      );
    });
  }, [collaborators, q, role]);

  const ROLES: RoleFilter[] = ["all", "PI", "co-author", "advisor", "RA", "external"];

  function copyOrcid(orcid: string) {
    navigator.clipboard
      .writeText(orcid)
      .then(() => toast.success("ORCID disalin"))
      .catch(() => toast.error("Gagal menyalin"));
  }

  function addQuickCollaborator() {
    dispatch({
      type: "collaborator.upsert",
      collaborator: {
        id: `col-${Date.now().toString(36)}`,
        name: "Kolaborator baru",
        affiliation: "—",
        role: "co-author",
        orcid: "0000-0000-0000-0000",
        email: "email@example.org",
        expertise: [],
        projectIds: [],
        initials: "KB",
      },
    });
    toast.success("Kolaborator ditambahkan");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Collaborators</h1>
          <p className="text-sm text-muted-foreground">
            {collaborators.length} kolaborator ·{" "}
            {collaborators.filter((c) => c.role === "co-author").length} co-author ·{" "}
            {collaborators.filter((c) => c.role === "external").length} eksternal
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / afiliasi / expertise..."
            className="h-9 w-56"
          />
          <Button size="sm" className="gap-1" onClick={addQuickCollaborator}>
            <Plus className="size-4" /> Kolaborator baru
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Filter className="size-3.5 self-center text-muted-foreground" />
        {ROLES.map((r) => (
          <Button
            key={r}
            type="button"
            variant={role === r ? "secondary" : "outline"}
            size="sm"
            onClick={() => setRole(r)}
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
          >
            {r === "all" ? "Semua" : r} (
            {r === "all" ? collaborators.length : collaborators.filter((c) => c.role === r).length})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Tidak ada kolaborator yang cocok. Ubah filter atau tambah kolaborator baru.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500/30 to-violet-500/30 text-sm font-semibold tracking-wider">
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{c.name}</p>
                      <Badge className={"rounded-full text-[10px] " + ROLE_TONE[c.role]}>{c.role}</Badge>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{c.affiliation}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Hapus kolaborator "${c.name}"?`)) {
                        dispatch({ type: "collaborator.delete", id: c.id });
                        toast.success("Kolaborator dihapus");
                      }
                    }}
                  >
                    <Trash2 className="size-3.5 text-rose-400" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {c.expertise.slice(0, 4).map((e) => (
                    <Badge key={e} variant="outline" className="rounded-full text-[10px]">
                      {e}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1.5 border-t border-border/60 pt-3 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-muted-foreground">ORCID</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyOrcid(c.orcid)}
                      className="h-auto gap-1 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80 hover:text-foreground"
                    >
                      {c.orcid} <Copy className="size-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-muted-foreground">Email</span>
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-1 truncate text-foreground/80 hover:text-foreground"
                    >
                      <Mail className="size-3" /> {c.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-muted-foreground">Proyek</span>
                    <span className="inline-flex items-center gap-1 text-foreground/80">
                      <Users className="size-3" /> {c.projectIds.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
