"use client";

import * as React from "react";
import { SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { ROLE_PRESETS, resolvePermissions } from "@/features/rbac-roles";
import { MembersPanel, type Member, type RoleOption, type Invite } from "@/features/user-management";

// Wiring happens here (app level): roles + resolved permissions come from
// rbac-roles, the panel comes from user-management. The slices never import
// each other.
const ROLES: RoleOption[] = ROLE_PRESETS.map((r) => ({ slug: r.slug, name: r.name, color: r.color }));

const SEED: Member[] = [
  { userId: "u1", name: "Aisyah Putri", email: "aisyah@acme.id", roleSlug: "owner", status: "active", joinedAt: Date.UTC(2025, 0, 12) },
  { userId: "u2", name: "Budi Santoso", email: "budi@acme.id", roleSlug: "admin", status: "active", joinedAt: Date.UTC(2025, 1, 3) },
  { userId: "u3", name: "Citra Dewi", email: "citra@acme.id", roleSlug: "manager", status: "active", joinedAt: Date.UTC(2025, 2, 18) },
  { userId: "u4", name: "Dimas Pratama", email: "dimas@acme.id", roleSlug: "staff", status: "active", joinedAt: Date.UTC(2025, 3, 7) },
  { userId: "u5", name: "Eka Wulandari", email: "eka@acme.id", roleSlug: "client", status: "active", joinedAt: Date.UTC(2025, 4, 21) },
  { userId: "u6", email: "fajar@new.id", roleSlug: "guest", status: "pending", joinedAt: Date.UTC(2025, 4, 28) },
];

export default function Page() {
  const [members, setMembers] = React.useState<Member[]>(SEED);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [asAdmin, setAsAdmin] = React.useState(true);
  const [note, setNote] = React.useState("");
  const currentPerms = React.useMemo(() => resolvePermissions(asAdmin ? "admin" : "manager"), [asAdmin]);

  const updateRole = ({ userId, roleSlug }: { userId: string; roleSlug: string }) =>
    setMembers((ms) => ms.map((m) => (m.userId === userId ? { ...m, roleSlug } : m)));
  const remove = ({ userId }: { userId: string }) =>
    setMembers((ms) => ms.map((m) => (m.userId === userId ? { ...m, status: "inactive" as const } : m)));

  const sendInvite = (i: { email: string; roleSlug: string; message?: string }) => {
    setInvites((prev) => [
      ...prev,
      { id: `inv-${prev.length}-${i.email}`, email: i.email, roleSlug: i.roleSlug, status: "pending", createdAt: Date.now() },
    ]);
    setNote(`Invite sent to ${i.email}.`);
  };
  const cancelInvite = ({ inviteId }: { inviteId: string }) =>
    setInvites((prev) => prev.filter((x) => x.id !== inviteId));
  const resendInvite = ({ inviteId }: { inviteId: string }) => {
    const inv = invites.find((x) => x.id === inviteId);
    if (inv) setNote(`Invite resent to ${inv.email}.`);
  };

  return (
    <SlicePreviewLayout
      title="User Management — Members & Invites"
      kind="full"
      description="Props-driven <MembersPanel>: search · role filter · sort · inline role change · soft-remove · invite dialog · pending invites. RBAC-agnostic — roles + perms wired from rbac-roles. Mock data, no backend."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/user-management"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">View as:</span>
          <Button size="sm" variant={asAdmin ? "default" : "outline"} onClick={() => setAsAdmin(true)}>Admin (manage + invite)</Button>
          <Button size="sm" variant={!asAdmin ? "default" : "outline"} onClick={() => setAsAdmin(false)}>Manager (read-only)</Button>
        </div>
        <MembersPanel
          members={members}
          roles={ROLES}
          currentPerms={currentPerms}
          onUpdateRole={updateRole}
          onRemove={remove}
          invites={invites}
          onInvite={sendInvite}
          onCancelInvite={cancelInvite}
          onResendInvite={resendInvite}
        />
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
    </SlicePreviewLayout>
  );
}
