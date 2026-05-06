import { z } from "zod";

import {
  FEATURE_ACTION_KINDS,
  FEATURE_BINDING_STATUSES,
  FEATURE_DATA_FIELD_TYPES,
  FEATURE_DATA_MODEL_STATUSES,
  FEATURE_GENERATION_MODES,
  FEATURE_INSTALL_STATUSES,
  FEATURE_MENU_ITEM_TYPES,
  FEATURE_MIGRATION_STATUSES,
  FEATURE_PACKAGE_RUNTIMES,
  FEATURE_PACKAGE_SOURCES,
  FEATURE_PACKAGE_VERSIONING_STRATEGIES,
  FEATURE_PERMISSION_SOURCES,
  FEATURE_UI_CATEGORIES,
  FEATURE_VIEW_TYPES,
  SEMVER_REGEX,
} from "./constants";

const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "Must be kebab-case");

const RouteSchema = z.string().startsWith("/");

const SemverSchema = z
  .string()
  .regex(SEMVER_REGEX, "Version must follow semver");

const FeaturePermissionSchema = z.object({
  key: z.string().min(1),
  source: z.enum(FEATURE_PERMISSION_SOURCES),
  description: z.string().optional(),
});

const FeaturePackageIdentitySchema = z.object({
  kind: z.literal("feature-package/v1"),
  packageId: z.string().min(1),
  slug: SlugSchema,
  namespace: SlugSchema,
  name: z.string().min(1),
  description: z.string().default(""),
  version: SemverSchema,
  source: z.enum(FEATURE_PACKAGE_SOURCES),
  runtime: z.enum(FEATURE_PACKAGE_RUNTIMES),
  generationMode: z.enum(FEATURE_GENERATION_MODES).default("full-json"),
  sharedEngineId: z.string().min(1).optional(),
  category: z.enum(FEATURE_UI_CATEGORIES).optional(),
  createdFrom: z
    .object({
      sourceUiSchemaVersion: z.string().optional(),
      uiSchemaVersion: z.string().optional(),
      compilerVersion: z.string().optional(),
    })
    .optional(),
});

const FeaturePackagePageSchema = z.object({
  id: SlugSchema,
  title: z.string().min(1),
  route: RouteSchema,
  componentId: z.string().min(1),
  rootNodeId: z.string().optional(),
  icon: z.string().optional(),
  widgetsUsed: z.array(z.string()).default([]),
  menu: z
    .object({
      slug: SlugSchema,
      type: z.enum(FEATURE_MENU_ITEM_TYPES).default("route"),
      label: z.string().min(1),
      order: z.number().int().min(0).default(0),
      icon: z.string().optional(),
    })
    .default({
      slug: "page",
      type: "route",
      label: "Page",
      order: 0,
    }),
});

const FeaturePackageUiSchema = z
  .object({
    pages: z.array(FeaturePackagePageSchema).default([]),
    widgetsUsed: z.array(z.string()).default([]),
    publishCertifiedWidgets: z.array(z.string()).default([]),
  })
  .superRefine((value, ctx) => {
    const routes = new Set<string>();
    for (const page of value.pages) {
      if (routes.has(page.route)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate page route: ${page.route}`,
          path: ["pages"],
        });
      }
      routes.add(page.route);
    }
  });

const FeatureDataFieldSchema = z.object({
  id: SlugSchema,
  name: z.string().min(1),
  type: z.enum(FEATURE_DATA_FIELD_TYPES),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  indexed: z.boolean().default(false),
  options: z.record(z.string(), z.unknown()).optional(),
});

const FeatureDataViewSchema = z.object({
  id: SlugSchema,
  name: z.string().min(1),
  type: z.enum(FEATURE_VIEW_TYPES),
  config: z.record(z.string(), z.unknown()).default({}),
});

const FeatureDataTableSchema = z.object({
  id: SlugSchema,
  name: z.string().min(1),
  icon: z.string().optional(),
  fields: z.array(FeatureDataFieldSchema).default([]),
  views: z.array(FeatureDataViewSchema).default([]),
});

const FeaturePackageDataModelSchema = z.object({
  status: z.enum(FEATURE_DATA_MODEL_STATUSES).default("none"),
  tables: z.array(FeatureDataTableSchema).default([]),
});

const FeatureWorkflowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()).default({}),
});

const FeatureWorkflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.number().int().optional(),
  targetHandle: z.number().int().optional(),
});

const FeaturePackageWorkflowSchema = z.object({
  id: SlugSchema,
  name: z.string().min(1),
  runtime: z.enum(FEATURE_PACKAGE_RUNTIMES).default("interpreted"),
  entrypoints: z.array(z.enum(["manual", "schedule", "event", "webhook"])).default([]),
  nodes: z.array(FeatureWorkflowNodeSchema).default([]),
  edges: z.array(FeatureWorkflowEdgeSchema).default([]),
  publishCertifiedNodes: z.array(z.string()).default([]),
});

const FeaturePackageActionSchema = z.object({
  id: SlugSchema,
  kind: z.enum(FEATURE_ACTION_KINDS),
  name: z.string().min(1),
  runtime: z.enum(FEATURE_PACKAGE_RUNTIMES).default("interpreted"),
  sourceWorkflowId: SlugSchema.optional(),
  config: z.record(z.string(), z.unknown()).default({}),
});

const FeaturePackageActionsSchema = z.object({
  workflows: z.array(FeaturePackageWorkflowSchema).default([]),
  actions: z.array(FeaturePackageActionSchema).default([]),
  publishCertifiedNodes: z.array(z.string()).default([]),
});

const FeaturePackageMenuItemSchema = z.object({
  slug: SlugSchema,
  name: z.string().min(1),
  type: z.enum(FEATURE_MENU_ITEM_TYPES).default("route"),
  route: RouteSchema.optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

const FeaturePackageComponentBindingSchema = z.object({
  pageId: SlugSchema,
  componentId: z.string().min(1),
  route: RouteSchema,
});

const FeaturePackageInstallSchema = z.object({
  defaultEnabled: z.boolean().default(true),
  menuItems: z.array(FeaturePackageMenuItemSchema).default([]),
  componentBindings: z.array(FeaturePackageComponentBindingSchema).default([]),
  enabledFeatures: z.array(z.string()).default([]),
});

const FeaturePackageAgentSchema = z.object({
  enabled: z.boolean().default(false),
  capabilities: z.array(z.string()).default([]),
  definitionPath: z.string().optional(),
});

const FeaturePackageVersioningSchema = z.object({
  schemaVersion: z.literal("1.0"),
  strategy: z
    .enum(FEATURE_PACKAGE_VERSIONING_STRATEGIES)
    .default("compatible-upgrade"),
  migrations: z
    .array(
      z.object({
        fromVersion: SemverSchema,
        toVersion: SemverSchema,
        notes: z.string().optional(),
      }),
    )
    .default([]),
});

export const FeaturePackageSchema = z
  .object({
    identity: FeaturePackageIdentitySchema,
    ui: FeaturePackageUiSchema.default({
      pages: [],
      widgetsUsed: [],
      publishCertifiedWidgets: [],
    }),
    dataModel: FeaturePackageDataModelSchema.default({
      status: "none",
      tables: [],
    }),
    actions: FeaturePackageActionsSchema.default({
      workflows: [],
      actions: [],
      publishCertifiedNodes: [],
    }),
    install: FeaturePackageInstallSchema.default({
      defaultEnabled: true,
      menuItems: [],
      componentBindings: [],
      enabledFeatures: [],
    }),
    permissions: z.object({
      required: z.array(FeaturePermissionSchema).default([]),
    }),
    agent: FeaturePackageAgentSchema.default({
      enabled: false,
      capabilities: [],
    }),
    versioning: FeaturePackageVersioningSchema.default({
      schemaVersion: "1.0",
      strategy: "compatible-upgrade",
      migrations: [],
    }),
  })
  .superRefine((value, ctx) => {
    const expectedPackageId = `${value.identity.namespace}.${value.identity.slug}`;
    if (value.identity.packageId !== expectedPackageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `packageId must match namespace.slug (${expectedPackageId})`,
        path: ["identity", "packageId"],
      });
    }

    if (
      value.identity.generationMode !== "full-json" &&
      !value.identity.sharedEngineId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sharedEngineId is required when generationMode is not full-json",
        path: ["identity", "sharedEngineId"],
      });
    }
  });

export type FeaturePackage = z.infer<typeof FeaturePackageSchema>;

const FeatureBindingSchema = z.object({
  slug: SlugSchema,
  route: RouteSchema.optional(),
  bindingId: z.string().optional(),
  status: z.enum(FEATURE_BINDING_STATUSES).default("planned"),
});

const WorkspaceFeatureInstallAuditSchema = z.object({
  installedBy: z.string().optional(),
  installedAt: z.string(),
  updatedAt: z.string(),
  uninstalledAt: z.string().optional(),
});

export const WorkspaceFeatureInstallSchema = z.object({
  kind: z.literal("workspace-feature-install/v1"),
  workspaceId: z.string().min(1),
  packageId: z.string().min(1),
  packageVersion: SemverSchema,
  featureSlug: SlugSchema,
  namespace: SlugSchema,
  status: z.enum(FEATURE_INSTALL_STATUSES),
  enabled: z.boolean(),
  installTarget: z.object({
    enabledFeatures: z.array(z.string()).default([]),
    menuSetId: z.string().optional(),
    workspaceMenuAssignmentId: z.string().optional(),
  }),
  menuBindings: z.array(FeatureBindingSchema).default([]),
  componentBindings: z.array(FeatureBindingSchema).default([]),
  databaseBindings: z.array(FeatureBindingSchema).default([]),
  migrationState: z.object({
    status: z.enum(FEATURE_MIGRATION_STATUSES).default("not_required"),
    fromVersion: SemverSchema.optional(),
    toVersion: SemverSchema.optional(),
    error: z.string().optional(),
  }),
  overrides: z.object({
    displayName: z.string().optional(),
    routePrefix: z.string().optional(),
    permissions: z.array(FeaturePermissionSchema).optional(),
  }),
  audit: WorkspaceFeatureInstallAuditSchema,
});

export type WorkspaceFeatureInstall = z.infer<
  typeof WorkspaceFeatureInstallSchema
>;

export function validateFeaturePackage(
  value: unknown,
): FeaturePackage {
  return FeaturePackageSchema.parse(value);
}

export function validateFeaturePackageSet(
  values: unknown[],
): FeaturePackage[] {
  const packages = values.map((value) => validateFeaturePackage(value));
  const seenPackageIds = new Set<string>();
  const seenNamespaceKeys = new Set<string>();

  for (const featurePackage of packages) {
    const packageId = featurePackage.identity.packageId;
    const namespaceKey = `${featurePackage.identity.namespace}.${featurePackage.identity.slug}`;

    if (seenPackageIds.has(packageId) || seenNamespaceKeys.has(namespaceKey)) {
      throw new Error(`Feature package namespace collision: ${namespaceKey}`);
    }

    seenPackageIds.add(packageId);
    seenNamespaceKeys.add(namespaceKey);
  }

  return packages;
}

export function validateWorkspaceFeatureInstall(
  value: unknown,
): WorkspaceFeatureInstall {
  return WorkspaceFeatureInstallSchema.parse(value);
}
