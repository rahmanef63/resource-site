import type {
  FeaturePackage,
  WorkspaceFeatureInstall,
} from "./package-contract";
import { WorkspaceFeatureInstallSchema } from "./package-contract";

type InstallActorOptions = {
  installedBy?: string;
  menuSetId?: string;
  workspaceMenuAssignmentId?: string;
};

function isoNow() {
  return new Date().toISOString();
}

export function buildWorkspaceInstallPlan(featurePackage: FeaturePackage) {
  return {
    enabledFeatures: [featurePackage.identity.slug],
    menuBindings: featurePackage.install.menuItems.map((item) => ({
      slug: item.slug,
      route: item.route,
      status: "planned" as const,
    })),
    componentBindings: featurePackage.install.componentBindings.map((binding) => ({
      slug: binding.pageId,
      route: binding.route,
      status: "planned" as const,
    })),
    databaseBindings: featurePackage.dataModel.tables.map((table) => ({
      slug: table.id,
      status: featurePackage.dataModel.status === "compiled"
        ? ("planned" as const)
        : ("removed" as const),
    })),
  };
}

export function createWorkspaceFeatureInstall(
  featurePackage: FeaturePackage,
  workspaceId: string,
  options: InstallActorOptions = {},
): WorkspaceFeatureInstall {
  const now = isoNow();
  const plan = buildWorkspaceInstallPlan(featurePackage);

  return WorkspaceFeatureInstallSchema.parse({
    kind: "workspace-feature-install/v1",
    workspaceId,
    packageId: featurePackage.identity.packageId,
    packageVersion: featurePackage.identity.version,
    featureSlug: featurePackage.identity.slug,
    namespace: featurePackage.identity.namespace,
    status: "installed",
    enabled: featurePackage.install.defaultEnabled,
    installTarget: {
      enabledFeatures: plan.enabledFeatures,
      menuSetId: options.menuSetId,
      workspaceMenuAssignmentId: options.workspaceMenuAssignmentId,
    },
    menuBindings: plan.menuBindings,
    componentBindings: plan.componentBindings,
    databaseBindings: plan.databaseBindings,
    migrationState: {
      status: "not_required",
    },
    overrides: {},
    audit: {
      installedBy: options.installedBy,
      installedAt: now,
      updatedAt: now,
    },
  });
}

export function upgradeWorkspaceFeatureInstall(
  currentInstall: WorkspaceFeatureInstall,
  nextPackage: FeaturePackage,
): WorkspaceFeatureInstall {
  const now = isoNow();
  const plan = buildWorkspaceInstallPlan(nextPackage);
  const requiresMigration =
    currentInstall.packageVersion !== nextPackage.identity.version;

  return WorkspaceFeatureInstallSchema.parse({
    ...currentInstall,
    packageId: nextPackage.identity.packageId,
    packageVersion: nextPackage.identity.version,
    status: "installed",
    enabled: nextPackage.install.defaultEnabled,
    installTarget: {
      ...currentInstall.installTarget,
      enabledFeatures: plan.enabledFeatures,
    },
    menuBindings: plan.menuBindings,
    componentBindings: plan.componentBindings,
    databaseBindings: plan.databaseBindings,
    migrationState: requiresMigration
      ? {
          status: "completed",
          fromVersion: currentInstall.packageVersion,
          toVersion: nextPackage.identity.version,
        }
      : {
          status: "not_required",
        },
    audit: {
      ...currentInstall.audit,
      updatedAt: now,
    },
  });
}

export function uninstallWorkspaceFeatureInstall(
  currentInstall: WorkspaceFeatureInstall,
): WorkspaceFeatureInstall {
  const now = isoNow();

  return WorkspaceFeatureInstallSchema.parse({
    ...currentInstall,
    status: "uninstalled",
    enabled: false,
    menuBindings: currentInstall.menuBindings.map((binding) => ({
      ...binding,
      status: "removed" as const,
    })),
    componentBindings: currentInstall.componentBindings.map((binding) => ({
      ...binding,
      status: "removed" as const,
    })),
    databaseBindings: currentInstall.databaseBindings.map((binding) => ({
      ...binding,
      status: "removed" as const,
    })),
    audit: {
      ...currentInstall.audit,
      updatedAt: now,
      uninstalledAt: now,
    },
  });
}

export function rollbackWorkspaceFeatureInstallUpgrade(
  currentInstall: WorkspaceFeatureInstall,
  targetVersion: string,
): WorkspaceFeatureInstall {
  const now = isoNow();

  return WorkspaceFeatureInstallSchema.parse({
    ...currentInstall,
    packageVersion: targetVersion,
    status: "rolled_back",
    migrationState: {
      status: "rolled_back",
      fromVersion: currentInstall.packageVersion,
      toVersion: targetVersion,
    },
    audit: {
      ...currentInstall.audit,
      updatedAt: now,
    },
  });
}

export function reinstallWorkspaceFeatureInstall(
  currentInstall: WorkspaceFeatureInstall,
): WorkspaceFeatureInstall {
  const now = isoNow();

  return WorkspaceFeatureInstallSchema.parse({
    ...currentInstall,
    status: "installed",
    enabled: true,
    menuBindings: currentInstall.menuBindings.map((binding) => ({
      ...binding,
      status: "planned" as const,
    })),
    componentBindings: currentInstall.componentBindings.map((binding) => ({
      ...binding,
      status: "planned" as const,
    })),
    databaseBindings: currentInstall.databaseBindings.map((binding) => ({
      ...binding,
      status: binding.slug ? ("planned" as const) : binding.status,
    })),
    audit: {
      ...currentInstall.audit,
      updatedAt: now,
    },
  });
}
