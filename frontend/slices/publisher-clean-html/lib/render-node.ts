// Recursive, bottom-up node renderer. Trimmed from Instatic
// `src/core/publisher/renderNode.ts`: dropped the visual-component-ref / loop
// specialised renderers, Layer-C holes, media/auto-sizes prefetch, page-ref
// resolution, template bindings, and TypeBox validation — the static publisher
// is the 80%. Per node: render children → escape props by schema type → call the
// module's pure render() → dedup CSS by moduleId → splice author classes/styles.

import type { NodeTree, ModuleRegistry } from "./types";
import { CssCollector } from "./css-collector";
import { escapeProps } from "./escape-props";
import { injectNodeClassIds, injectNodeInlineStyles } from "./class-injection";
import { escapeHtml } from "./sanitize";

export interface RenderContext {
  readonly tree: NodeTree;
  readonly registry: ModuleRegistry;
  /** Shared CSS accumulator, threaded down the whole walk. */
  readonly css: CssCollector;
  /**
   * Module id whose render() returns naked children (no wrapper element) — its
   * author classes go on `<body>` in publishPage, not on its own output.
   * Defaults to "base.body".
   */
  readonly bodyModuleId?: string;
}

/** Render a node and its entire subtree to an HTML string. */
export function renderNode(nodeId: string, ctx: RenderContext): string {
  const node = ctx.tree.nodes[nodeId];
  if (!node) return "";
  if (node.hidden) return "";

  const def = ctx.registry.get(node.moduleId);
  if (!def) {
    // Unknown module — emit a comment so the page doesn't silently lose content.
    return `<!-- publisher: unknown module "${escapeHtml(node.moduleId)}" -->`;
  }

  const renderedChildren = (node.children ?? []).map((childId) => renderNode(childId, ctx));

  const safeProps = escapeProps(node.props ?? {}, def.schema ?? {});
  const output = def.render(safeProps, renderedChildren);

  if (output.css) ctx.css.add(node.moduleId, output.css);

  // A "body" module emits naked children — its classes land on <body> instead.
  if (node.moduleId === (ctx.bodyModuleId ?? "base.body")) return output.html;

  const withClasses = injectNodeClassIds(output.html, node.classIds);
  return injectNodeInlineStyles(withClasses, node.inlineStyles);
}
