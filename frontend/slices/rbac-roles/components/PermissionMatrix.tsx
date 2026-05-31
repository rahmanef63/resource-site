"use client";

// Grouped permission checkbox grid. Drives role create/edit (set
// `onChange`) or read-only role inspection (`readOnly`). A role holding
// `*` shows every box checked + disabled.

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { matchPermission } from "../lib/permissions";
import { PERMISSION_GROUPS, type PermissionGroup } from "../lib/permission-catalog";

interface PermissionMatrixProps {
  value: readonly string[];
  onChange?: (next: string[]) => void;
  groups?: PermissionGroup[];
  readOnly?: boolean;
  className?: string;
}

export function PermissionMatrix({
  value, onChange, groups = PERMISSION_GROUPS, readOnly, className,
}: PermissionMatrixProps) {
  const isSuper = value.includes("*");
  const checked = (key: string) => isSuper || value.some((p) => matchPermission(p, key));
  const locked = readOnly || isSuper || !onChange;

  const toggle = (key: string, on: boolean) => {
    if (locked) return;
    onChange?.(on ? [...new Set([...value, key])] : value.filter((p) => p !== key));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((g) => (
        <div key={g.group} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.group}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {g.permissions.map((perm) => {
              const id = `perm-${perm.key}`;
              return (
                <Label
                  key={perm.key}
                  htmlFor={id}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal",
                    locked ? "cursor-default opacity-80" : "cursor-pointer hover:bg-accent/40",
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={checked(perm.key)}
                    disabled={locked}
                    onCheckedChange={(c) => toggle(perm.key, !!c)}
                  />
                  <span>{perm.label}</span>
                  <code className="ml-auto text-[10px] text-muted-foreground">{perm.key}</code>
                </Label>
              );
            })}
          </div>
        </div>
      ))}
      {isSuper ? (
        <p className="text-xs text-muted-foreground">
          Role holds <code>*</code> (superadmin) — every permission is granted.
        </p>
      ) : null}
    </div>
  );
}
