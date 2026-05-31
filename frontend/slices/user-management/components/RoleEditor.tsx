"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RolePermissionGrid } from "./RolePermissionGrid";
import type { ManagedRole, PermissionGroupDef, RolesLabels } from "../types";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

interface Props {
  /** The role to edit, or null for a new role. */
  role: ManagedRole | null;
  permissionGroups: PermissionGroupDef[];
  canManage: boolean;
  onSave?: (r: ManagedRole) => void | Promise<void>;
  onDelete?: (r: { slug: string }) => void | Promise<void>;
  labels: RolesLabels;
}

export function RoleEditor({ role, permissionGroups, canManage, onSave, onDelete, labels }: Props) {
  const isNew = !role;
  const isSystem = !!role?.isSystem;
  const editable = canManage && !isSystem;

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [perms, setPerms] = useState<string[]>(role?.permissions ?? []);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setPerms(role?.permissions ?? []);
  }, [role]);

  const save = async () => {
    if (!editable || !onSave || !name.trim()) return;
    setPending(true);
    try {
      await onSave({
        slug: role?.slug ?? slugify(name),
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: perms,
        color: role?.color,
        level: role?.level,
        isSystem: false,
      });
    } finally { setPending(false); }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="role-name">{labels.roleName}</Label>
        <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)}
          placeholder={labels.roleNamePlaceholder} disabled={!editable} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role-desc">{labels.roleDescription}</Label>
        <Textarea id="role-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder={labels.roleDescriptionPlaceholder} disabled={!editable} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{labels.permissions}</p>
        <RolePermissionGrid value={perms} groups={permissionGroups}
          onChange={editable ? setPerms : undefined} readOnly={!editable} />
      </div>
      {isSystem ? <p className="text-xs text-muted-foreground">{labels.systemRole}</p> : null}
      {editable ? (
        <div className="flex items-center gap-2">
          <Button type="button" onClick={save} disabled={pending || !name.trim()}>
            {pending ? labels.saving : labels.save}
          </Button>
          {!isNew && onDelete ? (
            <Button type="button" variant="ghost" className="text-destructive" onClick={() => onDelete({ slug: role!.slug })}>
              <Trash2 className="mr-2 h-4 w-4" />{labels.delete}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
