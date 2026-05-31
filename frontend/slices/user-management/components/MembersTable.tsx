"use client";

import type { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RoleChip } from "./RoleChip";
import { MemberRowActions } from "./MemberRowActions";
import type { Member, RoleOption, MembersLabels } from "../types";
import type { SortKey } from "../hooks/useMembersView";

interface Props {
  rows: Member[];
  roles: RoleOption[];
  canManage: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  onUpdateRole?: (m: { userId: string; roleSlug: string }) => void;
  onRemove?: (m: { userId: string }) => void;
  labels: MembersLabels;
}

function initials(m: Member) {
  return (m.name ?? m.email ?? "?").trim().slice(0, 2).toUpperCase();
}
function fmtDate(ts?: number) {
  return ts ? new Date(ts).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" }) : "—";
}
function roleOf(slug: string, roles: RoleOption[]): RoleOption {
  return roles.find((r) => r.slug === slug) ?? { slug, name: slug };
}

export function MembersTable({
  rows, roles, canManage, sortKey, sortDir, onSort, onUpdateRole, onRemove, labels,
}: Props) {
  const SortBtn = ({ k, children }: { k: SortKey; children: ReactNode }) => (
    <Button
      variant="ghost" size="sm" onClick={() => onSort(k)}
      className="-ml-1 h-auto gap-1 px-1 text-xs font-medium text-muted-foreground hover:bg-transparent"
    >
      {children}
      <ArrowUpDown className={cn("h-3 w-3", sortKey === k ? "text-foreground" : "opacity-40")} />
    </Button>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortBtn k="name">{labels.columnsMember}</SortBtn></TableHead>
          <TableHead><SortBtn k="role">{labels.columnsRole}</SortBtn></TableHead>
          <TableHead className="hidden sm:table-cell"><SortBtn k="joined">{labels.columnsJoined}</SortBtn></TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((m) => (
          <TableRow key={m.userId} className={m.status !== "active" ? "opacity-60" : undefined}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={m.avatarUrl} alt="" />
                  <AvatarFallback className="text-[10px]">{initials(m)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name ?? m.email ?? "Unknown"}</p>
                  {m.name && m.email ? <p className="truncate text-xs text-muted-foreground">{m.email}</p> : null}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {m.status === "pending" ? (
                <span className="text-xs text-muted-foreground">{labels.pending}</span>
              ) : canManage && onUpdateRole ? (
                <Select value={m.roleSlug} onValueChange={(slug) => onUpdateRole({ userId: m.userId, roleSlug: slug })}>
                  <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <RoleChip role={roleOf(m.roleSlug, roles)} />
              )}
            </TableCell>
            <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">{fmtDate(m.joinedAt)}</TableCell>
            <TableCell>
              <MemberRowActions
                canManage={canManage}
                onRemove={onRemove ? () => onRemove({ userId: m.userId }) : undefined}
                labels={labels}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
