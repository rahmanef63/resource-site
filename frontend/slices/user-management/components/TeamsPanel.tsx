"use client";

// TeamsPanel — named groups of users within a tenant (P4a). Props-driven:
// pass `teams`, `allMembers` (to resolve names + pick from), `currentPerms`
// and callbacks. Create / edit gated on `members.manage`.

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { can } from "../lib/can";
import { TeamDetail } from "./TeamDetail";
import { DEFAULT_TEAMS_LABELS } from "../types";
import type { Team, Member, TeamsLabels } from "../types";

export interface TeamsPanelProps {
  teams: Team[];
  allMembers: Member[];
  currentPerms: readonly string[];
  onCreateTeam?: (i: { name: string }) => void | Promise<void>;
  onRemoveTeam?: (i: { teamId: string }) => void | Promise<void>;
  onAddMember?: (i: { teamId: string; userId: string }) => void | Promise<void>;
  onRemoveMember?: (i: { teamId: string; userId: string }) => void | Promise<void>;
  labels?: Partial<TeamsLabels>;
  className?: string;
}

export function TeamsPanel({
  teams, allMembers, currentPerms, onCreateTeam, onRemoveTeam, onAddMember, onRemoveMember, labels: over, className,
}: TeamsPanelProps) {
  const labels: TeamsLabels = { ...DEFAULT_TEAMS_LABELS, ...over };
  const canManage = can(currentPerms, "members.manage");
  const [selected, setSelected] = useState<string | null>(teams[0]?.id ?? null);
  const [newName, setNewName] = useState("");
  const current = teams.find((t) => t.id === selected) ?? null;

  const create = async () => {
    if (!newName.trim() || !onCreateTeam) return;
    await onCreateTeam({ name: newName.trim() });
    setNewName("");
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[260px_1fr]", className)}>
      <div className="space-y-3">
        {canManage && onCreateTeam ? (
          <form onSubmit={(e) => { e.preventDefault(); create(); }} className="flex gap-1.5">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={labels.teamNamePlaceholder} className="h-8 text-sm" />
            <Button type="submit" size="sm" disabled={!newName.trim()} aria-label={labels.newTeam}><Plus className="h-4 w-4" /></Button>
          </form>
        ) : null}
        <ul className="space-y-1">
          {teams.map((t) => (
            <li key={t.id}>
              <Button variant="ghost" onClick={() => setSelected(t.id)}
                className={cn("h-auto w-full justify-start gap-2 px-2 py-1.5 font-normal", selected === t.id && "bg-accent")}>
                <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.memberIds.length}</span>
              </Button>
            </li>
          ))}
          {teams.length === 0 ? <li className="px-2 py-3 text-center text-xs text-muted-foreground">{labels.empty}</li> : null}
        </ul>
      </div>
      <div className="rounded-lg border p-4">
        {current ? (
          <TeamDetail
            team={current} allMembers={allMembers} canManage={canManage}
            onAddMember={onAddMember} onRemoveMember={onRemoveMember}
            onRemoveTeam={(i) => { onRemoveTeam?.(i); setSelected(teams.find((t) => t.id !== i.teamId)?.id ?? null); }}
            labels={labels}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{labels.emptyDetail}</p>
        )}
      </div>
    </div>
  );
}
