import {
  ACTIVE_WIDGET_TYPES,
  type StudioUISchema,
  type WidgetType,
} from "@/frontend/slices/studio/ui/types/StudioUISchema";
import { nodeManifestMap } from "@/frontend/slices/studio/workflow/nodes/registry";
import type {
  StudioDocument,
  StudioDocumentKind,
  StudioFlowNode,
} from "@/frontend/slices/studio/workflow/schema/studio-unified.types";

export const PUBLISH_CERTIFIED_WIDGET_TYPES = [
  "section",
  "div",
  "grid",
  "flex",
  "twoColumn",
  "threeColumn",
  "text",
  "image",
  "button",
  "link",
  "input",
  "textarea",
  "select",
  "checkbox",
  "radioGroup",
  "switch",
  "label",
  "slider",
  "toggle",
  "separator",
  "spacer",
  "card",
  "badge",
  "tabs",
  "accordion",
  "alert",
  "progress",
  "avatar",
  "table",
  "formGroup",
  "navGroup",
  "navItem",
  "sidebarNav",
  "hero",
  "heroComposite",
] as const satisfies readonly WidgetType[];

export const PUBLISH_CERTIFIED_NODE_TYPES = [
  "trigger.manual",
  "trigger.event",
  "data.set",
  "data.expression",
  "flow.if",
  "flow.switch",
  "flow.wait",
] as const;

export interface StudioPublishSafetyReport {
  kind: StudioDocumentKind | "ui-layout";
  certifiedWidgets: string[];
  unsupportedWidgets: string[];
  certifiedNodes: string[];
  unsupportedNodes: string[];
}

const CERTIFIED_WIDGET_SET = new Set<string>(PUBLISH_CERTIFIED_WIDGET_TYPES);
const CERTIFIED_NODE_SET = new Set<string>(PUBLISH_CERTIFIED_NODE_TYPES);

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

function getWidgetTypes(ui: StudioUISchema | undefined): string[] {
  if (!ui) return [];
  return Object.values(ui.nodes ?? {}).map((node) => node.type);
}

function getUnsupportedWidgets(widgetTypes: string[]) {
  return uniqueSorted(
    widgetTypes.filter(
      (type) => !ACTIVE_WIDGET_TYPES.has(type as WidgetType) || !CERTIFIED_WIDGET_SET.has(type),
    ),
  );
}

function getUnsupportedNodes(nodes: StudioFlowNode[]) {
  return uniqueSorted(
    nodes
      .map((node) => node.type)
      .filter((type) => !nodeManifestMap[type] || !CERTIFIED_NODE_SET.has(type)),
  );
}

export function getPublishCertifiedWidgetTypes(): WidgetType[] {
  return [...PUBLISH_CERTIFIED_WIDGET_TYPES];
}

export function getPublishCertifiedNodeTypes(): string[] {
  return [...PUBLISH_CERTIFIED_NODE_TYPES];
}

export function isWidgetPublishCertified(type: string): boolean {
  return ACTIVE_WIDGET_TYPES.has(type as WidgetType) && CERTIFIED_WIDGET_SET.has(type);
}

export function isNodePublishCertified(type: string): boolean {
  return Boolean(nodeManifestMap[type]) && CERTIFIED_NODE_SET.has(type);
}

export function analyzeStudioDocumentPublishSafety(
  document: StudioDocument | StudioUISchema,
): StudioPublishSafetyReport {
  const isUiOnly = "root" in document && "nodes" in document && !("studioVersion" in document);
  const kind =
    isUiOnly ? "ui-layout" : "kind" in document ? document.kind ?? "ui-layout" : "ui-layout";
  const ui =
    isUiOnly ? (document as StudioUISchema) : "ui" in document ? document.ui : undefined;
  const flowNodes =
    isUiOnly ? [] : "flow" in document ? document.flow?.nodes ?? [] : [];
  const widgetTypes = getWidgetTypes(ui);
  const certifiedWidgets = uniqueSorted(widgetTypes.filter((type) => isWidgetPublishCertified(type)));
  const certifiedNodes = uniqueSorted(flowNodes.map((node) => node.type).filter((type) => isNodePublishCertified(type)));

  return {
    kind,
    certifiedWidgets,
    unsupportedWidgets: getUnsupportedWidgets(widgetTypes),
    certifiedNodes,
    unsupportedNodes: getUnsupportedNodes(flowNodes),
  };
}

export function assertStudioDocumentPublishable(
  document: StudioDocument | StudioUISchema,
): StudioPublishSafetyReport {
  const report = analyzeStudioDocumentPublishSafety(document);
  if (report.unsupportedWidgets.length === 0 && report.unsupportedNodes.length === 0) {
    return report;
  }

  const reasons = [
    report.unsupportedWidgets.length > 0
      ? `Unsupported widgets: ${report.unsupportedWidgets.join(", ")}`
      : null,
    report.unsupportedNodes.length > 0
      ? `Unsupported workflow nodes: ${report.unsupportedNodes.join(", ")}`
      : null,
  ].filter(Boolean);

  throw new Error(reasons.join(" | "));
}
