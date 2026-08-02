"use client";

import { Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Team, Member, TeamsLabels } from "../types";

interface Props {
  team: Team;
  allMembers: Member[];
  canManage: boolean;
  onAddMember?: (i: { teamId: string; userId: string }) => void;
  onRemoveMember?: (i: { teamId: string; userId: string }) => void;
  onRemoveTeam?: (i: { teamId: string }) => void;
  labels: TeamsLabels;
}

function label(m?: Member) { return m?.name ?? m?.email ?? "Unknown"; }
function initials(m?: Member) { return label(m).slice(0, 2).toUpperCase(); }

export function TeamDetail({ team, allMembers, canManage, onAddMember, onRemoveMember, onRemoveTeam, labels }: Props) {
  const byId = (id: string) => allMembers.find((m) => m.userId === id);
  const inTeam = new Set(team.memberIds);
  const addable = allMembers.filter((m) => !inTeam.has(m.userId) && m.status === "active");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{team.name}</p>
        {canManage && onRemoveTeam ? (
          <Button variant="ghost" size="sm" className="shrink-0 text-destructive" onClick={() => onRemoveTeam({ teamId: team.id })}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />{labels.deleteTeam}
          </Button>
        ) : null}
      </div>
      {team.description ? <p className="text-xs text-muted-foreground">{team.description}</p> : null}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">{labels.members} ({team.memberIds.length})</p>
        <ul className="space-y-1">
          {team.memberIds.map((id) => {
            const m = byId(id);
            return (
              <li key={id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={m?.avatarUrl} alt="" />
                  <AvatarFallback className="text-[9px]">{initials(m)}</AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{label(m)}</span>
                {canManage && onRemoveMember ? (
                  <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 text-muted-foreground"
                    aria-label={labels.remove} onClick={() => onRemoveMember({ teamId: team.id, userId: id })}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </li>
            );
          })}
          {team.memberIds.length === 0 ? <li className="px-2 py-1 text-xs text-muted-foreground">—</li> : null}
        </ul>
      </div>

      {canManage && onAddMember && addable.length ? (
        <Select value="" onValueChange={(uid) => onAddMember({ teamId: team.id, userId: uid })}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={labels.addMemberPlaceholder} /></SelectTrigger>
          <SelectContent>
            {addable.map((m) => <SelectItem key={m.userId} value={m.userId}>{label(m)}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
