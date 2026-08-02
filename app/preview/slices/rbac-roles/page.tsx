"use client";

import * as React from "react";
import { SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ROLE_PRESETS, RoleBadge, PermissionMatrix, PermissionGate,
  usePermissions, resolvePermissions, type RoleSlug,
} from "@/features/rbac-roles";

/** Live RBAC engine demo: pick a role preset → see its resolved
 *  permissions in the matrix + how <PermissionGate> / usePermissions
 *  react to it. All pure — no backend. */
export default function Page() {
  const [role, setRole] = React.useState<RoleSlug>("manager");
  const perms = React.useMemo(() => resolvePermissions(role), [role]);
  const { can } = usePermissions(perms);

  const GATES = ["members.manage", "content.edit", "billing.manage", "workspace.delete"];

  return (
    <SlicePreviewLayout
      title="RBAC — Roles & Permissions"
      kind="full"
      description="6 system role presets · dot-namespaced permissions with `*` / `feature.*` matching · <PermissionGate> + usePermissions + <PermissionMatrix>. Pure & props-driven. Pair with user-management for the members UI."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/rbac-roles"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {ROLE_PRESETS.map((r) => (
            <Button
              key={r.slug}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRole(r.slug)}
              className="h-auto p-0 hover:bg-transparent"
            >
              <RoleBadge role={r.slug} className={role === r.slug ? "ring-2 ring-primary ring-offset-1" : ""} />
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Role</p>
              <Select value={role} onValueChange={(v) => setRole(v as RoleSlug)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_PRESETS.map((r) => (
                    <SelectItem key={r.slug} value={r.slug}>
                      {r.name} · level {r.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ROLE_PRESETS.find((r) => r.slug === role)?.description}
              </p>
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-sm font-medium">&lt;PermissionGate&gt; · usePermissions</p>
              <ul className="space-y-1.5 text-sm">
                {GATES.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className={can(p) ? "text-emerald-600" : "text-muted-foreground/60"}>
                      {can(p) ? "✓" : "✗"}
                    </span>
                    <code className="text-xs">{p}</code>
                  </li>
                ))}
              </ul>
              <PermissionGate
                permissions={perms}
                require="members.manage"
                fallback={<p className="pt-1 text-xs text-muted-foreground">🔒 “Manage members” button hidden — needs <code>members.manage</code>.</p>}
              >
                <p className="pt-1 text-xs text-emerald-600">✅ “Manage members” button visible for this role.</p>
              </PermissionGate>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Resolved permissions</p>
            <PermissionMatrix value={perms} readOnly />
          </div>
        </div>
      </div>
    </SlicePreviewLayout>
  );
}
