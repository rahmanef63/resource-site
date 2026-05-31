"use client";

// MembersPanel — the members surface. Props-driven + RBAC-agnostic: pass
// `roles` (options) + `currentPerms` (the actor's resolved permission
// strings, wired from rbac-roles at the app level) + CRUD callbacks.
// `members === undefined` renders a loading state.

import { can } from "../lib/can";
import { useMembersView } from "../hooks/useMembersView";
import { MembersToolbar } from "./MembersToolbar";
import { MembersTable } from "./MembersTable";
import { DEFAULT_MEMBERS_LABELS } from "../types";
import type { Member, RoleOption, MembersLabels } from "../types";

export interface MembersPanelProps {
  members: Member[] | undefined;
  /** Role options for the dropdown / filter / badge (e.g. rbac-roles' presets). */
  roles: RoleOption[];
  /** The actor's resolved permission strings — gates manage / invite. */
  currentPerms: readonly string[];
  onUpdateRole?: (m: { userId: string; roleSlug: string }) => void | Promise<void>;
  onRemove?: (m: { userId: string }) => void | Promise<void>;
  onInvite?: () => void;
  labels?: Partial<MembersLabels>;
  className?: string;
}

export function MembersPanel({
  members, roles, currentPerms, onUpdateRole, onRemove, onInvite, labels: over, className,
}: MembersPanelProps) {
  const labels: MembersLabels = { ...DEFAULT_MEMBERS_LABELS, ...over };
  const view = useMembersView(members);
  const canManage = can(currentPerms, "members.manage");
  const canInvite = can(currentPerms, "members.invite");
  const loading = members === undefined;

  return (
    <div className={className}>
      <MembersToolbar
        query={view.query} onQuery={view.setQuery}
        roleFilter={view.roleFilter} onRoleFilter={view.setRoleFilter}
        roles={roles} canInvite={canInvite} onInvite={onInvite} labels={labels}
      />
      <div className="mt-3 overflow-hidden rounded-lg border">
        {loading ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{labels.loading}</p>
        ) : view.rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <MembersTable
            rows={view.rows} roles={roles} canManage={canManage}
            sortKey={view.sortKey} sortDir={view.sortDir} onSort={view.toggleSort}
            onUpdateRole={onUpdateRole} onRemove={onRemove} labels={labels}
          />
        )}
      </div>
      {!loading ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {view.rows.length} of {view.total} member{view.total === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
