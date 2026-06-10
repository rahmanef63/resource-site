// Agentic tool collection (Tier A* — ADMIN). The slice is NOT an agent — it
// exports function-calling tools a shared agent host drives. Every mutating
// ctx method MUST be bound to a server-gated implementation (RBAC
// `members.manage` / `members.invite` via your backend's requirePermission);
// the tool layer never bypasses authz — it only forwards.

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import type { Member, MemberStatus } from "../types";

export type UserManagementCtx = {
  /** Current member rows (already permission-filtered by the host). */
  members: () => Member[];
  /** Server-gated ops — each resolves to a short readback. */
  invite: (input: { email: string; roleSlug: string }) => Promise<string>;
  setRole: (userId: string, roleSlug: string) => Promise<string>;
  setStatus: (userId: string, status: MemberStatus) => Promise<string>;
  remove: (userId: string) => Promise<string>;
};

const summary = (ctx: UserManagementCtx): string => {
  const m = ctx.members();
  return `${m.length} member(s): ${m.slice(0, 8).map((x) => `${x.name}<${x.email}>:${x.roleSlug}/${x.status}`).join(", ")}${m.length > 8 ? ", …" : ""}`;
};

export const userManagementTools = defineToolCollection<UserManagementCtx>({
  namespace: "user-management",
  describe: summary,
  tools: [
    {
      name: "list",
      description: "List members (name, email, role, status, userId).",
      parameters: noArgs,
      run: (ctx) =>
        ctx.members().map((m) => `${m.userId} ${m.name} <${m.email}> ${m.roleSlug} ${m.status}`).join("\n") || "no members",
    },
    {
      name: "invite",
      description: "Invite a new member by email with a role (server-gated: members.invite).",
      parameters: obj({ "email!": str("invitee email"), "roleSlug!": str("role slug, e.g. admin/staff") }),
      run: (ctx, a) => ctx.invite({ email: a.email as string, roleSlug: a.roleSlug as string }),
    },
    {
      name: "set_role",
      description: "Change a member's role (server-gated: members.manage).",
      parameters: obj({ "userId!": str("member userId"), "roleSlug!": str("new role slug") }),
      run: (ctx, a) => ctx.setRole(a.userId as string, a.roleSlug as string),
    },
    {
      name: "disable",
      description: "Deactivate a member (status → inactive; server-gated: members.manage).",
      parameters: obj({ "userId!": str("member userId") }),
      run: (ctx, a) => ctx.setStatus(a.userId as string, "inactive"),
    },
    {
      name: "remove",
      description: "Remove a member entirely (server-gated: members.manage). Prefer disable unless removal is explicit.",
      parameters: obj({ "userId!": str("member userId") }),
      run: (ctx, a) => ctx.remove(a.userId as string),
    },
  ],
});
