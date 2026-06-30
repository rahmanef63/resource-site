// publishPage — orchestrate a node tree into a standalone, framework-runtime-
// free HTML document with one deduped CSS bundle. Trimmed from Instatic
// `src/core/publisher/render.ts` (565 lines of host head-assembly: importmaps,
// runtime scripts, favicons, template frames — all dropped). Pure + env-free.

import type { NodeTree, ModuleRegistry } from "./types";
import { CssCollector, sanitizeModuleCSS } from "./css-collector";
import { renderNode, type RenderContext } from "./render-node";
import { PUBLISHER_RESET_CSS } from "./reset-css";
import { createBaseCspPlan, cspMetaTag, type CspPlan } from "./csp-plan";
import { escapeHtml, safeUrl } from "./sanitize";

export interface PublishOptions {
  title?: string;
  description?: string;
  /** `<html lang>` (default "en"). */
  lang?: string;
  /** Extra `<head>` HTML the host injects (SEO meta, JSON-LD, link tags). */
  headExtra?: string;
  /** Framework / design-token CSS, inserted after the reset (host-built). */
  frameworkCss?: string;
  /** Author class CSS (host-built from its style rules), inserted last. */
  userClassCss?: string;
  /** Class names applied to `<body>` — the root node's author classes. */
  bodyClassIds?: string[];
  /** Skip the built-in reset CSS. */
  noReset?: boolean;
  /** "inline" (default) embeds CSS in `<style>`; "external" links `cssHref` + returns css. */
  cssEmission?: "inline" | "external";
  /** href used when `cssEmission: "external"`. */
  cssHref?: string;
  /** Mutate the base CSP plan (e.g. add an asset host). */
  csp?: (plan: CspPlan) => void;
  /** Module id whose render returns naked children (default "base.body"). */
  bodyModuleId?: string;
}

export interface PublishedPage {
  html: string;
  /** The CSS bundle when `cssEmission: "external"`; '' when inlined. */
  css: string;
}

export function publishPage(
  tree: NodeTree,
  registry: ModuleRegistry,
  options: PublishOptions = {},
): PublishedPage {
  const collector = new CssCollector();
  const ctx: RenderContext = {
    tree,
    registry,
    css: collector,
    bodyModuleId: options.bodyModuleId,
  };
  const bodyInner = renderNode(tree.rootNodeId, ctx);

  const cssBundle = [
    options.noReset ? "" : PUBLISHER_RESET_CSS,
    options.frameworkCss ?? "",
    collector.collect(),
    options.userClassCss ? sanitizeModuleCSS(options.userClassCss) : "",
  ]
    .filter(Boolean)
    .join("\n");

  const cspPlan = createBaseCspPlan({ anyScriptTag: false });
  options.csp?.(cspPlan);

  const external = options.cssEmission === "external";
  const styleOrLink = external
    ? options.cssHref
      ? `<link rel="stylesheet" href="${safeUrl(options.cssHref)}">`
      : ""
    : `<style>${cssBundle}</style>`;

  const bodyClass = (options.bodyClassIds ?? []).map(escapeHtml).join(" ");

  const html = [
    "<!DOCTYPE html>",
    `<html lang="${escapeHtml(options.lang ?? "en")}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    options.title ? `<title>${escapeHtml(options.title)}</title>` : "",
    options.description
      ? `<meta name="description" content="${escapeHtml(options.description)}">`
      : "",
    cspMetaTag(cspPlan),
    styleOrLink,
    options.headExtra ?? "",
    "</head>",
    bodyClass ? `<body class="${bodyClass}">` : "<body>",
    bodyInner,
    "</body>",
    "</html>",
  ]
    .filter(Boolean)
    .join("\n");

  return { html, css: external ? cssBundle : "" };
}
