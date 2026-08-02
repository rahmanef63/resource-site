"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { useState } from "react";
import { PermissionMatrix } from "./components/PermissionMatrix";
import { RoleBadge } from "./components/RoleBadge";
import { ROLE_MAP, type RoleSlug } from "./lib/roles";

const ROLES: RoleSlug[] = ["admin", "manager", "staff", "guest"];

function MatrixDemo({ role, readOnly }: { role: RoleSlug; readOnly: boolean }) {
  // Seed from the preset, then let the user toggle when editable.
  const preset = ROLE_MAP.get(role);
  const [value, setValue] = useState<string[]>([...(preset?.permissions ?? [])]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Editing</span>
        <RoleBadge role={role} />
        {readOnly ? (
          <span className="text-xs text-muted-foreground">(read-only)</span>
        ) : null}
      </div>
      <PermissionMatrix
        value={value}
        readOnly={readOnly}
        onChange={readOnly ? undefined : setValue}
      />
    </div>
  );
}

const preview: SlicePreviewModule = {
  PermissionMatrix: ({ variant }) => {
    const role = (
      ROLES.includes(variant.role as RoleSlug) ? variant.role : "manager"
    ) as RoleSlug;
    const readOnly = variant.readOnly === "true";
    return (
      <div className="p-4">
        {/* remount on role change so the seeded value re-derives */}
        <MatrixDemo key={`${role}:${readOnly}`} role={role} readOnly={readOnly} />
      </div>
    );
  },
};

export default preview;
