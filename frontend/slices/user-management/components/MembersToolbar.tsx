"use client";

import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { RoleOption, MembersLabels } from "../types";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  roleFilter: string;
  onRoleFilter: (r: string) => void;
  roles: RoleOption[];
  canInvite: boolean;
  onInvite?: () => void;
  labels: MembersLabels;
}

export function MembersToolbar({
  query, onQuery, roleFilter, onRoleFilter, roles, canInvite, onInvite, labels,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="pl-8"
        />
      </div>
      <Select value={roleFilter} onValueChange={onRoleFilter}>
        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{labels.allRoles}</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {canInvite && onInvite ? (
        <Button type="button" size="sm" onClick={onInvite}>
          <UserPlus className="mr-2 h-4 w-4" />
          {labels.invite}
        </Button>
      ) : null}
    </div>
  );
}
