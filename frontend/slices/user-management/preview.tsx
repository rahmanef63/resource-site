"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { UserManagementPanel } from "./components/UserManagementPanel";
import type {
  Member, RoleOption, ManagedRole, PermissionGroupDef, Team,
} from "./types";
import type { TenantNode, MatrixUser, AccessCells } from "./access-types";

const ROLES: RoleOption[] = [
  { slug: "admin", name: "Admin", color: "#2563eb" },
  { slug: "manager", name: "Manager", color: "#0891b2" },
  { slug: "staff", name: "Staff", color: "#16a34a" },
  { slug: "client", name: "Client", color: "#d97706" },
];

const PERMS = ["members.view", "members.manage", "members.invite", "roles.manage"];

const GROUPS: PermissionGroupDef[] = [
  {
    group: "Members & roles",
    permissions: [
      { key: "members.view", label: "View members" },
      { key: "members.manage", label: "Manage members" },
      { key: "members.invite", label: "Invite members" },
      { key: "roles.manage", label: "Manage roles" },
    ],
  },
  {
    group: "Content",
    permissions: [
      { key: "content.view", label: "View content" },
      { key: "content.edit", label: "Edit content" },
    ],
  },
];

const MANAGED: ManagedRole[] = [
  { slug: "admin", name: "Admin", color: "#2563eb", level: 10, isSystem: true, permissions: ["*"] },
  { slug: "manager", name: "Manager", color: "#0891b2", level: 30, permissions: ["members.view", "content.view", "content.edit"] },
  { slug: "staff", name: "Staff", color: "#16a34a", level: 50, permissions: ["content.view"] },
];

type DemoState = { members: Member[]; cells: AccessCells };

const SEED: DemoState = {
  members: [
    { userId: "u1", name: "Ada Lovelace", email: "ada@demo.io", roleSlug: "admin", status: "active", joinedAt: Date.parse("2025-11-02") },
    { userId: "u2", name: "Linus T.", email: "linus@demo.io", roleSlug: "manager", status: "active", joinedAt: Date.parse("2026-01-18") },
    { userId: "u3", name: "Grace H.", email: "grace@demo.io", roleSlug: "staff", status: "active", joinedAt: Date.parse("2026-03-04") },
    { userId: "u4", email: "guest@demo.io", roleSlug: "client", status: "pending" },
  ],
  cells: {
    u1: { __root__: "admin", t1: "admin" },
    u2: { __root__: "manager", t1: "staff" },
    u3: { __root__: "staff" },
  },
};

const TEAMS: Team[] = [
  { id: "tm1", name: "Engineering", description: "Builds the product", memberIds: ["u1", "u2", "u3"] },
  { id: "tm2", name: "Support", description: "Front line", memberIds: ["u2"] },
];

const TENANTS: TenantNode[] = [
  { id: null, name: "Workspace", depth: 0 },
  { id: "t1", name: "Acme Inc", depth: 1 },
];

const MATRIX_USERS: MatrixUser[] = SEED.members.slice(0, 3).map((m) => ({
  userId: m.userId, name: m.name, email: m.email,
}));

const { useDemoStore } = createDemoStore({ slug: "user-management", seed: SEED });

const preview: SlicePreviewModule = {
  UserManagementPanel: ({ variant }) => {
    const [state, setState, { ready }] = useDemoStore();
    const scenario = variant.scenario ?? "members";
    if (!ready) return null;

    return (
      <div className="p-4">
        <UserManagementPanel
          defaultTab={scenario as "members" | "roles" | "teams" | "access"}
          members={{
            members: state.members,
            roles: ROLES,
            currentPerms: PERMS,
            onUpdateRole: ({ userId, roleSlug }) =>
              setState((s) => ({
                ...s,
                members: s.members.map((m) =>
                  m.userId === userId ? { ...m, roleSlug } : m,
                ),
              })),
            onSetStatus: ({ userId, status }) =>
              setState((s) => ({
                ...s,
                members: s.members.map((m) =>
                  m.userId === userId ? { ...m, status } : m,
                ),
              })),
            onInvite: async ({ email, roleSlug }) => {
              setState((s) => ({
                ...s,
                members: [...s.members, { userId: `inv-${Date.now()}`, email, roleSlug, status: "pending" }],
              }));
              return `https://example.com/join/${Math.random().toString(36).slice(2, 10)}`;
            },
          }}
          roles={{
            roles: MANAGED,
            currentPerms: PERMS,
            permissionGroups: GROUPS,
          }}
          teams={{ teams: TEAMS, allMembers: state.members, currentPerms: PERMS }}
          access={{
            tenants: TENANTS,
            users: MATRIX_USERS,
            cells: state.cells,
            roles: ROLES,
            currentPerms: PERMS,
            onAssign: ({ userId, tenantId, roleSlug }) =>
              setState((s) => ({
                ...s,
                cells: {
                  ...s.cells,
                  [userId]: {
                    ...(s.cells[userId] ?? {}),
                    [tenantId ?? "__root__"]: roleSlug,
                  },
                },
              })),
          }}
        />
      </div>
    );
  },
};

export default preview;
