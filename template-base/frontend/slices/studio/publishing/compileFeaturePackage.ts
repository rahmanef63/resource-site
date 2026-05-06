import {
  type AnyStudioDocument,
  isUiSchema,
  isUnifiedDocument,
} from "@/frontend/slices/studio/schema/types/studio";
import { validateStudioDocument } from "@/frontend/slices/studio/schema";
import type { StudioUISchema } from "@/frontend/slices/studio/ui/types/StudioUISchema";
import type {
  StudioDocument,
  StudioFlowNode,
} from "@/frontend/slices/studio/workflow/schema/studio-unified.types";
import {
  FeaturePackageSchema,
  type FeaturePackage,
} from "@/lib/features/package-contract";
import { isFeatureUiCategory } from "@/lib/features/constants";
import { getFeatureById } from "@/frontend/shared/lib/features/registry";

import { analyzeStudioDocumentPublishSafety, assertStudioDocumentPublishable } from "./publishSafety";

export interface CompileStudioDocumentOptions {
  slug?: string;
  namespace?: string;
  name?: string;
  description?: string;
  version?: string;
  compilerVersion?: string;
  routeBase?: string;
  category?: string;
  targetFeatureId?: string;
}

export class StudioFeaturePackageCompileError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[]) {
    super(message);
    this.name = "StudioFeaturePackageCompileError";
    this.issues = issues;
  }
}

const STUDIO_DOCUMENT_SCHEMA_URL =
  "https://superspace.app/schemas/studio/v1.0" as const;
type FeaturePackagePage = FeaturePackage["ui"]["pages"][number];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function uniqueSorted(values: Iterable<string>) {
  return [...new Set(values)].sort();
}

function toUiSchema(document: AnyStudioDocument): StudioUISchema | undefined {
  if (isUiSchema(document)) return document;
  if (isUnifiedDocument(document)) return document.ui;
  return undefined;
}

function toUnifiedDocument(document: AnyStudioDocument): StudioDocument | undefined {
  if (!isUnifiedDocument(document)) return undefined;

  return {
    $schema: STUDIO_DOCUMENT_SCHEMA_URL,
    studioVersion: document.studioVersion,
    kind: document.kind,
    metadata: document.metadata,
    ui: document.ui
      ? {
          ...document.ui,
          version: "0.5" as const,
        }
      : undefined,
    flow: document.flow as StudioDocument["flow"],
  };
}

function getDisplayName(document: AnyStudioDocument, options: CompileStudioDocumentOptions) {
  if (options.name) return options.name;
  if (isUiSchema(document)) return document.metadata?.name ?? "Generated Feature";
  return document.metadata.name;
}

function getDescription(document: AnyStudioDocument, options: CompileStudioDocumentOptions) {
  if (options.description) return options.description;
  if (isUiSchema(document)) return document.metadata?.description ?? "";
  return document.metadata.description ?? "";
}

function getVersion(document: AnyStudioDocument, options: CompileStudioDocumentOptions) {
  if (options.version) return options.version;
  if (isUiSchema(document)) return document.metadata?.version ?? "1.0.0";
  return document.metadata.version ?? "1.0.0";
}

function getSourceUiSchemaVersion(input: unknown): string | undefined {
  if (typeof input !== "object" || input === null) return undefined;

  if ("version" in input && "root" in input && "nodes" in input && !("studioVersion" in input)) {
    const version = (input as { version?: unknown }).version;
    return typeof version === "string" ? version : undefined;
  }

  if ("ui" in input) {
    const ui = (input as { ui?: { version?: unknown } }).ui;
    return typeof ui?.version === "string" ? ui.version : undefined;
  }

  return undefined;
}

function getEffectiveUiSchemaVersion(
  document: AnyStudioDocument,
  sourceUiSchemaVersion: string | undefined,
) {
  if (sourceUiSchemaVersion === "0.4") return "0.5";

  if (isUiSchema(document)) return document.version;

  return document.ui?.version;
}

function getCompilerMetadata(
  document: AnyStudioDocument,
  options: CompileStudioDocumentOptions,
  sourceUiSchemaVersion: string | undefined,
) {
  const effectiveUiSchemaVersion = getEffectiveUiSchemaVersion(
    document,
    sourceUiSchemaVersion,
  );

  if (isUiSchema(document)) {
    return {
      studioDocumentId: document.metadata?.id,
      studioDocumentKind: "ui-layout" as const,
      sourceUiSchemaVersion,
      uiSchemaVersion: effectiveUiSchemaVersion,
      compilerVersion: options.compilerVersion ?? "1.0.0",
    };
  }

  return {
    studioDocumentId: document.metadata.id,
    studioDocumentKind: document.kind,
    studioDocumentVersion: document.studioVersion,
    sourceUiSchemaVersion,
    uiSchemaVersion: effectiveUiSchemaVersion,
    compilerVersion: options.compilerVersion ?? "1.0.0",
  };
}

function inferEntrypoints(nodes: StudioFlowNode[]) {
  const entrypoints = new Set<"manual" | "schedule" | "event" | "webhook">();
  for (const node of nodes) {
    if (node.type === "trigger.manual") entrypoints.add("manual");
    if (node.type === "trigger.schedule") entrypoints.add("schedule");
    if (node.type === "trigger.event") entrypoints.add("event");
    if (node.type === "trigger.webhook") entrypoints.add("webhook");
  }
  return [...entrypoints];
}

function buildPages(
  ui: StudioUISchema | undefined,
  slug: string,
  displayName: string,
  routeBase: string,
): FeaturePackagePage[] {
  if (!ui || ui.root.length === 0) {
    return [
      {
        id: `${slug}-page`,
        title: displayName,
        route: routeBase,
        componentId: `generated.${slug}.page`,
        icon: undefined,
        widgetsUsed: [],
        menu: {
          slug,
          type: "route" as const,
          label: displayName,
          order: 0,
          icon: undefined,
        },
      },
    ];
  }

  return ui.root.map((rootId, index) => {
    const rootNode = ui.nodes[rootId];
    const title =
      String(rootNode?.props?.name ?? rootNode?.props?.title ?? displayName);
    const rawRoute = rootNode?.props?.path;
    const route =
      typeof rawRoute === "string" && rawRoute.startsWith("/")
        ? rawRoute
        : index === 0
          ? routeBase
          : `${routeBase}/${slugify(title) || `page-${index + 1}`}`;
    const pageId = slugify(String(rootNode?.props?.name ?? rootId)) || `${slug}-page-${index + 1}`;
    const icon =
      typeof rootNode?.props?.icon === "string" && rootNode.props.icon.trim().length > 0
        ? rootNode.props.icon
        : undefined;

    return {
      id: pageId,
      title,
      route,
      componentId: `generated.${slug}.${pageId}.page`,
      rootNodeId: rootId,
      icon,
      widgetsUsed: uniqueSorted(
        Object.values(ui.nodes)
          .filter((node) => node.type)
          .map((node) => node.type),
      ),
      menu: {
        slug: index === 0 ? slug : `${slug}-${pageId}`,
        type: "route" as const,
        label: title,
        order: index,
        icon,
      },
    };
  });
}

export function compileStudioDocumentToFeaturePackage(
  input: unknown,
  options: CompileStudioDocumentOptions = {},
): FeaturePackage {
  const sourceUiSchemaVersion = getSourceUiSchemaVersion(input);
  const validation = validateStudioDocument(input, {
    mode: "lenient",
    normalize: true,
  });

  if (!validation.valid || !validation.normalizedDocument) {
    const issues = validation.errors.map((issue) => issue.message);
    throw new StudioFeaturePackageCompileError(
      "Studio document validation failed",
      issues,
    );
  }

  const normalizedDocument = validation.normalizedDocument as AnyStudioDocument;
  const targetFeature = options.targetFeatureId
    ? getFeatureById(options.targetFeatureId)
    : undefined;
  const generationMode = targetFeature?.generation.mode ?? "full-json";
  const sharedEngineId = targetFeature?.generation.sharedEngineId;

  if (generationMode === "engine-owned") {
    throw new StudioFeaturePackageCompileError(
      `Feature "${targetFeature?.id ?? options.targetFeatureId}" is engine-owned and cannot be generated from Studio JSON`,
      [
        "Engine-owned features must be installed or bound to an existing shared engine.",
      ],
    );
  }

  const displayName = getDisplayName(normalizedDocument, options);
  const slug = options.slug ?? slugify(displayName);
  const namespace = options.namespace ?? "studio";
  const version = getVersion(normalizedDocument, options);
  const ui = toUiSchema(normalizedDocument);
  const unified = toUnifiedDocument(normalizedDocument);
  const routeBase = options.routeBase ?? `/dashboard/${slug}`;
  const description = getDescription(normalizedDocument, options);

  let publishReport;
  try {
    publishReport = assertStudioDocumentPublishable(
      unified ?? ui ?? (normalizedDocument as StudioUISchema),
    );
  } catch (error) {
    const report = analyzeStudioDocumentPublishSafety(
      unified ?? ui ?? (normalizedDocument as StudioUISchema),
    );
    const issues = [
      ...report.unsupportedWidgets.map(
        (widget) => `Widget "${widget}" is not publish-certified`,
      ),
      ...report.unsupportedNodes.map(
        (node) => `Workflow node "${node}" is not publish-certified`,
      ),
    ];
    throw new StudioFeaturePackageCompileError(
      error instanceof Error ? error.message : "Publish safety validation failed",
      issues,
    );
  }

  const pages = buildPages(ui, slug, displayName, routeBase);
  const flowNodes = unified?.flow?.nodes ?? [];
  const flowEdges = unified?.flow?.edges ?? [];
  const hasFlow = flowNodes.length > 0;
  const shouldCompileWorkflow = hasFlow && generationMode === "full-json";
  const enabledFeatureId = targetFeature?.id ?? slug;
  const requiredPermissions = [
    { key: `${slug}.view`, source: "generated" as const },
    ...(shouldCompileWorkflow ? [{ key: `${slug}.manage`, source: "generated" as const }] : []),
  ];

  const featurePackage = FeaturePackageSchema.parse({
    identity: {
      kind: "feature-package/v1",
      packageId: `${namespace}.${slug}`,
      slug,
      namespace,
      name: displayName,
      description,
      version,
      source: "studio",
      runtime: shouldCompileWorkflow ? "interpreted" : "hybrid",
      generationMode,
      sharedEngineId,
      category: isFeatureUiCategory(options.category ?? "") ? options.category : undefined,
      createdFrom: getCompilerMetadata(
        normalizedDocument,
        options,
        sourceUiSchemaVersion,
      ),
    },
    ui: {
      pages,
      widgetsUsed: publishReport.certifiedWidgets,
      publishCertifiedWidgets: publishReport.certifiedWidgets,
    },
    dataModel: {
      status: (shouldCompileWorkflow || generationMode === "hybrid-json" || (ui && ui.root.length > 0))
        ? "deferred"
        : "none",
      tables: [],
    },
    actions: {
      workflows: shouldCompileWorkflow
        ? [
            {
              id: `${slug}-workflow`,
              name: `${displayName} Workflow`,
              runtime: "interpreted",
              entrypoints: inferEntrypoints(flowNodes),
              nodes: flowNodes.map((node) => ({
                id: node.id,
                type: node.type,
                name: node.name,
                parameters: node.parameters ?? {},
              })),
              edges: flowEdges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
              })),
              publishCertifiedNodes: publishReport.certifiedNodes,
            },
          ]
        : [],
      actions: shouldCompileWorkflow
        ? [
            {
              id: `${slug}-workflow-action`,
              kind: "workflow",
              name: `${displayName} Workflow Action`,
              runtime: "interpreted",
              sourceWorkflowId: `${slug}-workflow`,
              config: {},
            },
          ]
        : pages.map((page) => ({
            id: `${slug}-${page.id}-view`,
            kind: "view" as const,
            name: `${page.title} View`,
            runtime: "interpreted" as const,
            config: {
              route: page.route,
            },
          })),
      publishCertifiedNodes: shouldCompileWorkflow ? publishReport.certifiedNodes : [],
    },
    install: {
      defaultEnabled: true,
      menuItems: pages.map((page, index) => ({
        slug: page.menu.slug,
        name: page.menu.label,
        type: page.menu.type,
        route: page.route,
        icon: page.icon,
        order: index,
      })),
      componentBindings: pages.map((page) => ({
        pageId: page.id,
        componentId: page.componentId,
        route: page.route,
      })),
      enabledFeatures: [enabledFeatureId],
    },
    permissions: {
      required: requiredPermissions,
    },
    agent: {
      enabled: shouldCompileWorkflow || Boolean(targetFeature?.agent),
      capabilities: shouldCompileWorkflow
        ? ["execute_workflow", "read_state"]
        : targetFeature?.agent?.capabilities ?? [],
      definitionPath: targetFeature?.agent?.definitionPath,
    },
    versioning: {
      schemaVersion: "1.0",
      strategy: "compatible-upgrade",
      migrations: [],
    },
  });

  return featurePackage;
}
