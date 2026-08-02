"use client";

// RolesPanel — list roles + edit/create custom roles. Props-driven +
// RBAC-agnostic: pass `roles` (ManagedRole[]), `currentPerms`, and the
// `permissionGroups` catalog (from rbac-roles at the app level). Editing
// is gated on `roles.manage`; system roles are read-only.

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { can } from "../lib/can";
import { RoleChip } from "./RoleChip";
import { RoleEditor } from "./RoleEditor";
import { DEFAULT_ROLES_LABELS } from "../types";
import type { ManagedRole, PermissionGroupDef, RolesLabels } from "../types";

export interface RolesPanelProps {
  roles: ManagedRole[];
  currentPerms: readonly string[];
  permissionGroups: PermissionGroupDef[];
  onUpsert?: (r: ManagedRole) => void | Promise<void>;
  onRemove?: (r: { slug: string }) => void | Promise<void>;
  labels?: Partial<RolesLabels>;
  className?: string;
}

export function RolesPanel({
  roles, currentPerms, permissionGroups, onUpsert, onRemove, labels: over, className,
}: RolesPanelProps) {
  const labels: RolesLabels = { ...DEFAULT_ROLES_LABELS, ...over };
  const canManage = can(currentPerms, "roles.manage");
  const [selected, setSelected] = useState<string | null>(roles[0]?.slug ?? null);
  const [creating, setCreating] = useState(false);
  const current = creating ? null : roles.find((r) => r.slug === selected) ?? null;

  const handleSave = async (r: ManagedRole) => {
    await onUpsert?.(r);
    setCreating(false);
    setSelected(r.slug);
  };
  const handleDelete = async (r: { slug: string }) => {
    await onRemove?.(r);
    setCreating(false);
    setSelected(roles.find((x) => x.slug !== r.slug)?.slug ?? null);
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[260px_1fr]", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{labels.title}</p>
          {canManage && onUpsert ? (
            <Button size="sm" variant="outline" onClick={() => { setCreating(true); setSelected(null); }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />{labels.newRole}
            </Button>
          ) : null}
        </div>
        <ul className="space-y-1">
          {roles.map((r) => (
            <li key={r.slug}>
              <Button
                variant="ghost"
                onClick={() => { setCreating(false); setSelected(r.slug); }}
                className={cn("h-auto w-full justify-start gap-2 px-2 py-1.5 font-normal",
                  !creating && selected === r.slug && "bg-accent")}
              >
                <RoleChip role={r} />
                <span className="ml-auto text-xs text-muted-foreground">
                  {r.permissions.includes("*") ? "all" : r.permissions.length}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border p-4">
        {creating || current ? (
          <RoleEditor role={current} permissionGroups={permissionGroups} canManage={canManage}
            onSave={handleSave} onDelete={handleDelete} labels={labels} />
        ) : (
          <p className="text-sm text-muted-foreground">{labels.emptyEditor}</p>
        )}
      </div>
    </div>
  );
}
