"use client";

import * as React from "react";
import { Mail, MoreHorizontal, Plus, Shield, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, SEED_USERS } from "./seed";
import { BlockHeader } from "../../ui/block-header";
import { EmptyState } from "../../ui/empty-state";
import type { RoleId, UserRow } from "./types";

/** Real admin-panel "User management" block — replaces the generic
 *  AdminFeatureCard stub. First canary for BS-wave's
 *  admin-panel-real-impl pattern. Pattern to replicate per block:
 *
 *    _shared/admin-panel/blocks/<segment>/
 *      ├── types.ts      — domain types (Role, UserRow, etc)
 *      ├── seed.ts       — demo data (no backend in iframe)
 *      └── <Segment>BlockView.tsx — the actual view
 *
 *  Then AdminFeatureStubPage dispatches by segment to the right view.
 */
export function UsersBlockView() {
  const [users, setUsers] = React.useState<UserRow[]>(SEED_USERS);

  function changeRole(userId: string, role: RoleId) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  }

  function revoke(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;

  return (
    <div className="space-y-6 p-6">
      <BlockHeader
        title="User management"
        meta={`${activeCount} active · ${pendingCount} pending · ${users.length} total · 4 system roles`}
        actions={
          <Button size="sm" className="gap-1.5">
            <UserPlus className="size-3.5" />
            Invite member
          </Button>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <Shield className="size-3.5 text-muted-foreground" />
              <Badge variant="outline" className={"text-[10px] uppercase " + r.badgeClass}>
                {r.label}
              </Badge>
              <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                {users.filter((u) => u.role === r.id).length}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {r.capabilities.slice(0, 2).map((c) => (
                <li key={c} className="flex items-start gap-1.5">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h2 className="text-sm font-semibold">Members</h2>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            <Plus className="size-3" />
            Add manually
          </Button>
        </div>
        <div className="divide-y">
          {users.length === 0 ? (
            <div className="p-2">
              <EmptyState icon={UserPlus} label="No members yet" hint="Invite someone to get started." />
            </div>
          ) : (
            users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                onChangeRole={(role) => changeRole(u.id, role)}
                onRevoke={() => revoke(u.id)}
              />
            ))
          )}
        </div>
      </section>

      <p className="text-[10px] text-muted-foreground">
        Demo data — resets on browser reload. Real implementation backed by{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[10px]">rbac-roles</code> slice +
        Convex auth (per <code className="rounded bg-muted px-1 py-0.5 text-[10px]">eject-spec.md</code>).
      </p>
    </div>
  );
}

function UserRow({
  user,
  onChangeRole,
  onRevoke,
}: {
  user: UserRow;
  onChangeRole: (role: RoleId) => void;
  onRevoke: () => void;
}) {
  const role = ROLES.find((r) => r.id === user.role);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
        {user.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <Mail className="size-3" /> {user.email}
        </p>
      </div>
      {user.status !== "active" && (
        <Badge variant="outline" className="text-[10px] capitalize">
          {user.status}
        </Badge>
      )}
      {role && (
        <Badge variant="outline" className={"text-[10px] uppercase " + role.badgeClass}>
          {role.label}
        </Badge>
      )}
      <p className="hidden font-mono text-[10px] text-muted-foreground sm:block">
        {new Date(user.lastActive).toLocaleDateString()}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${user.name}`}>
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-[10px] uppercase">Change role</DropdownMenuLabel>
          {ROLES.map((r) => (
            <DropdownMenuItem
              key={r.id}
              onClick={() => onChangeRole(r.id)}
              disabled={r.id === user.role}
            >
              <span className={"size-1.5 rounded-full " + r.badgeClass.split(" ")[0]} />
              {r.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onRevoke} className="text-destructive">
            Revoke access
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
