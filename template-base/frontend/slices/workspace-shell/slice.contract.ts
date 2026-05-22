/**
 * Slice contract for `workspace-shell` — v1.0.0.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "workspace-shell",
  version: "1.0.0",
  category: "ui",
  kind: "full",
  requires: {
    auth: "convex" as const,
    rbac: [
      "workspace.view",
      "menus.view",
      "menus.manage",
      "menus.fork",
    ] as string[],
    env: [] as string[],
    convex: {
      prefix: "workspaceShell_",
      tables: [
        "workspaceShell_menuSets",
        "workspaceShell_menuItems",
        "workspaceShell_itemComponents",
        "workspaceShell_wsAssignments",
        "workspaceShell_userAssignments",
        "workspaceShell_rolePerms",
        "workspaceShell_navContext",
      ] as string[],
    },
    deps: ["convex-auth"] as const,
  },
  provides: {
    routes: ["/workspace-shell"] as string[],
    hooks: [
      "useNavContext",
      "useWorkspaceContext",
      "useMenuStore",
    ] as string[],
    components: [
      "WorkspaceSwitcher",
      "MenuSetPicker",
      "WorkspaceTree",
      "ContextBadge",
      "NavContextProvider",
    ] as string[],
    tables: [
      "workspaceShell_menuSets",
      "workspaceShell_menuItems",
      "workspaceShell_navContext",
    ] as string[],
    events: [
      "workspaceShell.context.switched",
      "workspaceShell.menuSet.forked",
    ] as string[],
  },
  conflicts: [
    // Consumers with their own menu primitive should declare these as conflicts:
    // "menu-system:tables.menuSets",
  ] as string[],
  bidir: {
    syncPolicy: "auto-pr" as const,
    generalization: {
      level: "portable" as const,
      forbiddenTerms: [
        "rahmanef",
        "rahmanef.com",
        "superspace",
        "/dashboard/",
      ] as string[],
      requiredProps: [
        "basePath",
        "permissionScheme",
        "labels",
      ] as string[],
    },
  },
});
