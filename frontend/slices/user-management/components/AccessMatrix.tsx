"use client";

// AccessMatrix (P4c) — users (rows) × tenants (columns) grid showing each
// user's role per tenant across a hierarchy. Read-only by default; when
// `currentPerms` grants members.manage and `onAssign` is passed, each cell
// becomes a role select. Props-driven + RBAC-agnostic.

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RoleChip } from "./RoleChip";
import { can } from "../lib/can";
import { DEFAULT_ACCESS_LABELS, tenantKey } from "../access-types";
import type { TenantNode, MatrixUser, AccessCells, AccessMatrixLabels } from "../access-types";
import type { RoleOption } from "../types";

export interface AccessMatrixProps {
  tenants: TenantNode[];
  users: MatrixUser[];
  cells: AccessCells;
  roles: RoleOption[];
  currentPerms?: readonly string[];
  onAssign?: (i: { userId: string; tenantId: string | null; roleSlug: string }) => void;
  labels?: Partial<AccessMatrixLabels>;
  className?: string;
}

function ulabel(u: MatrixUser) { return u.name ?? u.email ?? "Unknown"; }

export function AccessMatrix({ tenants, users, cells, roles, currentPerms, onAssign, labels: over, className }: AccessMatrixProps) {
  const labels: AccessMatrixLabels = { ...DEFAULT_ACCESS_LABELS, ...over };
  const editable = !!currentPerms && can(currentPerms, "members.manage") && !!onAssign;

  if (!users.length) {
    return <p className="p-6 text-center text-sm text-muted-foreground">{labels.empty}</p>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-background">{labels.member}</TableHead>
            {tenants.map((t) => (
              <TableHead key={tenantKey(t.id)} className="whitespace-nowrap">{t.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.userId}>
              <TableCell className="sticky left-0 bg-background">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={u.avatarUrl} alt="" />
                    <AvatarFallback className="text-[9px]">{ulabel(u).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{ulabel(u)}</span>
                </div>
              </TableCell>
              {tenants.map((t) => {
                const slug = cells[u.userId]?.[tenantKey(t.id)];
                const role = slug ? roles.find((r) => r.slug === slug) ?? { slug, name: slug } : undefined;
                return (
                  <TableCell key={tenantKey(t.id)}>
                    {editable ? (
                      <Select value={slug ?? ""} onValueChange={(v) => onAssign!({ userId: u.userId, tenantId: t.id, roleSlug: v })}>
                        <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue placeholder={labels.noAccess} /></SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : role ? (
                      <RoleChip role={role} />
                    ) : (
                      <span className="text-xs text-muted-foreground">{labels.noAccess}</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
