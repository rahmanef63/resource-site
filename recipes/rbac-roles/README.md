# Recipe: rbac-roles

Workspace-scoped RBAC. Source: superspace `convex/workspace/`.

Already at `template-base/convex/lib/rbac/`:

```
perms.ts            # central PERMS constants (SSOT for permission strings)
role-templates.ts   # 6 system roles + tier presets (solo/influencer/org)
platform-admin.ts   # env-based super-admin bypass (PLATFORM_ADMIN_EMAILS)
permissions.ts      # checkPermission / requirePermission helpers
seed.ts             # seedWorkspaceRoles(ctx, wsId, tier)
```

## System roles

| slug | level | use |
|---|---|---|
| owner | 0 | workspace creator — wildcard `*` |
| admin | 10 | full access minus system actions |
| manager | 30 | content + people |
| staff | 50 | contribute only |
| client | 70 | limited view |
| guest | 90 | read-only |

## Tier presets

```ts
RBAC_TIER_PRESETS = {
  solo:         ["owner", "admin"],            // personal-brand-os
  influencer:   ["owner", "admin", "manager"], // creator + VA
  organization: ["owner", "admin", "manager", "staff", "client", "guest"],
}
```

Choose per workspace in your workspace-create mutation:

```ts
import { seedWorkspaceRoles } from "@/convex/lib/rbac/seed";
const wsId = await ctx.db.insert("workspaces", { ... });
await seedWorkspaceRoles(ctx, wsId, "solo");
```

## Permission helpers

```ts
import { requirePermission, checkPermission } from "@/convex/lib/rbac/permissions";

export const createPost = mutation({
  args: { workspaceId: v.id("workspaces"), title: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "content.create");
    // ...
  },
});
```

Resolution order (first match wins):
1. Platform admin (env `PLATFORM_ADMIN_EMAILS`) → `*`
2. Workspace owner (`workspaces.userId` / `.createdBy`) → `*`
3. `workspaceMemberships.additionalPermissions`
4. Role permissions

Wildcards: `"*"`, `"feature.*"`.

## Schema

`roles` + `workspaceMemberships` already in `template-base/convex/auth/schema.ts`.

## Standalone use

```bash
cp -r template-base/convex/lib/rbac convex/lib/rbac
# Plus the schema tables — see authRbacTables in template-base/convex/auth/schema.ts
```

Requires `@convex-dev/auth` (no Clerk per kitab rule #1).

## Tests to write

1. Unauth → denied
2. Auth + no membership → denied
3. Membership + role without perm → denied
4. Membership + role with perm → allowed
5. Membership + wildcard → allowed
6. Owner (no membership row) → allowed
7. Platform admin (env email) → allowed
