"use client";

import * as React from "react";
import { SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { ROLE_PRESETS, resolvePermissions, PERMISSION_GROUPS } from "@/features/rbac-roles";
import {
  UserManagementPanel,
  type Member, type RoleOption, type Invite, type ManagedRole, type Team,
} from "@/features/user-management";

// Wiring happens here (app level): roles, resolved permissions and the
// permission catalog come from rbac-roles; the panel comes from
// user-management. The slices never import each other.
const SEED_MEMBERS: Member[] = [
  { userId: "u1", name: "Aisyah Putri", email: "aisyah@acme.id", roleSlug: "owner", status: "active", joinedAt: Date.UTC(2025, 0, 12) },
  { userId: "u2", name: "Budi Santoso", email: "budi@acme.id", roleSlug: "admin", status: "active", joinedAt: Date.UTC(2025, 1, 3) },
  { userId: "u3", name: "Citra Dewi", email: "citra@acme.id", roleSlug: "manager", status: "active", joinedAt: Date.UTC(2025, 2, 18) },
  { userId: "u4", name: "Dimas Pratama", email: "dimas@acme.id", roleSlug: "staff", status: "active", joinedAt: Date.UTC(2025, 3, 7) },
  { userId: "u5", name: "Eka Wulandari", email: "eka@acme.id", roleSlug: "client", status: "active", joinedAt: Date.UTC(2025, 4, 21) },
  { userId: "u6", email: "fajar@new.id", roleSlug: "guest", status: "pending", joinedAt: Date.UTC(2025, 4, 28) },
];
const SEED_ROLES: ManagedRole[] = ROLE_PRESETS.map((r) => ({
  slug: r.slug, name: r.name, color: r.color, level: r.level,
  description: r.description, permissions: r.permissions, isSystem: true, isDefault: r.isDefault,
}));

export default function Page() {
  const [members, setMembers] = React.useState<Member[]>(SEED_MEMBERS);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [roles, setRoles] = React.useState<ManagedRole[]>(SEED_ROLES);
  const [teams, setTeams] = React.useState<Team[]>([
    { id: "t1", name: "Engineering", memberIds: ["u2", "u4"] },
    { id: "t2", name: "Design", memberIds: ["u3"] },
  ]);
  const [asAdmin, setAsAdmin] = React.useState(true);
  const [note, setNote] = React.useState("");
  const currentPerms = React.useMemo(() => resolvePermissions(asAdmin ? "admin" : "manager"), [asAdmin]);
  const roleOptions: RoleOption[] = React.useMemo(
    () => roles.map((r) => ({ slug: r.slug, name: r.name, color: r.color })), [roles]);

  const updateRole = ({ userId, roleSlug }: { userId: string; roleSlug: string }) =>
    setMembers((ms) => ms.map((m) => (m.userId === userId ? { ...m, roleSlug } : m)));
  const remove = ({ userId }: { userId: string }) =>
    setMembers((ms) => ms.map((m) => (m.userId === userId ? { ...m, status: "inactive" as const } : m)));
  const sendInvite = (i: { email: string; roleSlug: string; message?: string }) => {
    setInvites((p) => [...p, { id: `inv-${p.length}-${i.email}`, email: i.email, roleSlug: i.roleSlug, status: "pending", createdAt: Date.now() }]);
    setNote(`Invite sent to ${i.email}.`);
  };
  const cancelInvite = ({ inviteId }: { inviteId: string }) => setInvites((p) => p.filter((x) => x.id !== inviteId));
  const resendInvite = ({ inviteId }: { inviteId: string }) => {
    const inv = invites.find((x) => x.id === inviteId);
    if (inv) setNote(`Invite resent to ${inv.email}.`);
  };
  const upsertRole = (r: ManagedRole) =>
    setRoles((prev) => (prev.some((x) => x.slug === r.slug)
      ? prev.map((x) => (x.slug === r.slug ? { ...x, ...r } : x))
      : [...prev, r]));
  const removeRole = ({ slug }: { slug: string }) => setRoles((prev) => prev.filter((x) => x.slug !== slug));
  const createTeam = ({ name }: { name: string }) =>
    setTeams((prev) => [...prev, { id: `t-${prev.length}-${name}`, name, memberIds: [] }]);
  const removeTeam = ({ teamId }: { teamId: string }) => setTeams((prev) => prev.filter((t) => t.id !== teamId));
  const addTeamMember = ({ teamId, userId }: { teamId: string; userId: string }) =>
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, memberIds: [...new Set([...t.memberIds, userId])] } : t)));
  const removeTeamMember = ({ teamId, userId }: { teamId: string; userId: string }) =>
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, memberIds: t.memberIds.filter((id) => id !== userId) } : t)));

  return (
    <SlicePreviewLayout
      title="User Management"
      kind="full"
      description="Tabbed surface — Members (search · role change · invite · pending) + Roles (create / edit custom roles via permission matrix). Permission-gated. RBAC-agnostic; roles + perms + catalog wired from rbac-roles. Mock data, no backend."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/user-management"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">View as:</span>
          <Button size="sm" variant={asAdmin ? "default" : "outline"} onClick={() => setAsAdmin(true)}>Admin (manage)</Button>
          <Button size="sm" variant={!asAdmin ? "default" : "outline"} onClick={() => setAsAdmin(false)}>Manager (read-only)</Button>
        </div>
        <UserManagementPanel
          members={{
            members, roles: roleOptions, currentPerms,
            onUpdateRole: updateRole, onRemove: remove,
            invites, onInvite: sendInvite, onCancelInvite: cancelInvite, onResendInvite: resendInvite,
          }}
          roles={{
            roles, currentPerms, permissionGroups: PERMISSION_GROUPS,
            onUpsert: upsertRole, onRemove: removeRole,
          }}
          teams={{
            teams, allMembers: members, currentPerms,
            onCreateTeam: createTeam, onRemoveTeam: removeTeam,
            onAddMember: addTeamMember, onRemoveMember: removeTeamMember,
          }}
        />
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
    </SlicePreviewLayout>
  );
}
