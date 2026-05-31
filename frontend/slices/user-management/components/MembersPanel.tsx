"use client";

// MembersPanel — the members surface. Props-driven + RBAC-agnostic: pass
// `roles` (options) + `currentPerms` (the actor's resolved permission
// strings, wired from rbac-roles at the app level) + CRUD callbacks.
// `members === undefined` renders a loading state. Pass `onInvite` +
// `invites` to enable the invite dialog + pending list (members.invite).

import { useState } from "react";
import { can } from "../lib/can";
import { useMembersView } from "../hooks/useMembersView";
import { MembersToolbar } from "./MembersToolbar";
import { MembersTable } from "./MembersTable";
import { PendingInvites } from "./PendingInvites";
import { InviteDialog } from "./InviteDialog";
import { DEFAULT_MEMBERS_LABELS } from "../types";
import type { Member, RoleOption, MembersLabels, Invite, InviteInput } from "../types";

export interface MembersPanelProps {
  members: Member[] | undefined;
  /** Role options for the dropdown / filter / badge (e.g. rbac-roles' presets). */
  roles: RoleOption[];
  /** The actor's resolved permission strings — gates manage / invite. */
  currentPerms: readonly string[];
  onUpdateRole?: (m: { userId: string; roleSlug: string }) => void | Promise<void>;
  onRemove?: (m: { userId: string }) => void | Promise<void>;
  /** Send handler — when set + members.invite, shows the invite button + dialog. */
  onInvite?: (i: InviteInput) => void | Promise<void>;
  /** Pending invitations (e.g. your `listInvites` query). */
  invites?: Invite[];
  onCancelInvite?: (i: { inviteId: string }) => void | Promise<void>;
  onResendInvite?: (i: { inviteId: string }) => void | Promise<void>;
  labels?: Partial<MembersLabels>;
  className?: string;
}

export function MembersPanel({
  members, roles, currentPerms, onUpdateRole, onRemove,
  onInvite, invites, onCancelInvite, onResendInvite, labels: over, className,
}: MembersPanelProps) {
  const labels: MembersLabels = { ...DEFAULT_MEMBERS_LABELS, ...over };
  const view = useMembersView(members);
  const canManage = can(currentPerms, "members.manage");
  const canInvite = can(currentPerms, "members.invite");
  const loading = members === undefined;
  const showInvite = canInvite && !!onInvite;
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className={className}>
      <MembersToolbar
        query={view.query} onQuery={view.setQuery}
        roleFilter={view.roleFilter} onRoleFilter={view.setRoleFilter}
        roles={roles} canInvite={showInvite} onInvite={() => setInviteOpen(true)} labels={labels}
      />

      {(canInvite || canManage) && invites && invites.length ? (
        <PendingInvites
          className="mt-3" invites={invites} roles={roles} canModify={canInvite}
          onCancel={onCancelInvite} onResend={onResendInvite} labels={labels}
        />
      ) : null}

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

      {onInvite ? (
        <InviteDialog
          open={inviteOpen} onOpenChange={setInviteOpen}
          roles={roles} onSubmit={onInvite} labels={labels}
        />
      ) : null}
    </div>
  );
}
