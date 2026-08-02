/**
 * schemaToHtml — converts a Studio UI schema to a self-contained HTML file.
 *
 * Preview mode uses the same serializer as export so iframe preview and
 * downloaded HTML stay aligned.
 */

import { normalizeNodeProps } from "@/frontend/slices/studio/schema";
import type { Schema, SchemaNode } from "@/frontend/slices/studio/ui/types";

export interface SchemaToHtmlOptions {
  designMode?: boolean;
  selectedNodeId?: string | null;
  rootIds?: string[];
}

const SKIP = new Set(["", "none", "default", "Default", "Regular", null, undefined]);
const FLEX_CONTAINERS = new Set(["section", "div", "container", "flex", "twoColumn", "threeColumn", "row", "column"]);
const PREVIEW_MESSAGE_SOURCE = "studio-preview-frame";

interface ExternalLinkConfig {
  href: string;
  rel?: string;
  crossorigin?: string | null;
}

function parseExternalLinkConfig(rawLink: string): ExternalLinkConfig | null {
  const trimmed = rawLink.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as ExternalLinkConfig;
    if (!parsed?.href) return null;
    return {
      href: parsed.href,
      rel: parsed.rel || "stylesheet",
      crossorigin: parsed.crossorigin ?? null,
    };
  } catch {
    return {
      href: trimmed,
      rel: "stylesheet",
      crossorigin: null,
    };
  }
}

function serializeExternalLinkConfig(config: ExternalLinkConfig): string {
  return JSON.stringify({
    href: config.href,
    rel: config.rel || "stylesheet",
    crossorigin: config.crossorigin ?? null,
  });
}

function uniqueExternalLinkConfigs(rawLinks: string[] | undefined): ExternalLinkConfig[] {
  const seen = new Set<string>();
  const links: ExternalLinkConfig[] = [];

  for (const rawLink of rawLinks || []) {
    const parsed = parseExternalLinkConfig(rawLink);
    if (!parsed) continue;

    const key = serializeExternalLinkConfig(parsed);
    if (seen.has(key)) continue;
    seen.add(key);
    links.push(parsed);
  }

  return links;
}

function uniqueExternalStyles(rawStyles: string[] | undefined): string[] {
  const seen = new Set<string>();
  const styles: string[] = [];

  for (const rawStyle of rawStyles || []) {
    const trimmed = rawStyle.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    styles.push(trimmed);
  }

  return styles;
}

function getMaterialSymbolClass(variant: unknown): string {
  if (variant === "rounded") return "material-symbols-rounded";
  if (variant === "sharp") return "material-symbols-sharp";
  return "material-symbols-outlined";
}

function getIconSizeValue(props: Record<string, unknown>): string | null {
  if (typeof props.size === "number") return `${props.size}px`;
  if (typeof props.size === "string" && props.size.trim()) {
    return /^\d+$/.test(props.size.trim()) ? `${props.size.trim()}px` : props.size.trim();
  }
  if (typeof props.fontSize === "string" && props.fontSize.trim()) return props.fontSize.trim();
  return null;
}

function buildIconFontVariation(props: Record<string, unknown>): string | null {
  const fill = props.fill ? 1 : 0;
  const weight = Number(props.weight);
  const grade = Number(props.grade ?? 0);
  const rawSize = props.size ?? props.fontSize;
  const parsedSize = typeof rawSize === "number"
    ? rawSize
    : typeof rawSize === "string"
      ? parseInt(rawSize.replace("px", ""), 10)
      : NaN;
  const opsz = Number.isFinite(parsedSize) ? parsedSize : 24;

  if (!props.fill && !Number.isFinite(weight) && grade === 0 && opsz === 24) {
    return null;
  }

  return `'FILL' ${fill}, 'wght' ${Number.isFinite(weight) ? weight : 400}, 'GRAD' ${grade}, 'opsz' ${opsz}`;
}

function buildIconStyle(props: Record<string, unknown>, baseStyle: string): string {
  const parts = baseStyle ? [baseStyle] : [];
  const size = getIconSizeValue(props);
  const fontVariationSettings = buildIconFontVariation(props);

  if (size) parts.push(`font-size:${size}`);
  if (typeof props.color === "string" && props.color.trim() && props.color !== "inherit") {
    parts.push(`color:${props.color}`);
  }
  if (fontVariationSettings) parts.push(`font-variation-settings:${fontVariationSettings}`);
  parts.push("line-height:1");
  parts.push("display:inline-block");
  parts.push("width:1em");
  parts.push("height:1em");
  parts.push("vertical-align:middle");

  return parts.filter(Boolean).join(";");
}

function renderHeadLink(config: ExternalLinkConfig): string {
  const attrs = [`href="${esc(config.href)}"`, `rel="${esc(config.rel || "stylesheet")}"`];
  if (config.crossorigin !== null && config.crossorigin !== undefined) {
    attrs.push(`crossorigin="${esc(config.crossorigin)}"`);
  }
  return `  <link ${attrs.join(" ")} />`;
}

function getSchemaHeadAssets(schema: Schema): { links: ExternalLinkConfig[]; styles: string[] } {
  const links = uniqueExternalLinkConfigs(schema.metadata?.externalAssets?.links);
  const styles = uniqueExternalStyles(schema.metadata?.externalAssets?.styles);
  const hasIconNodes = Object.values(schema.nodes || {}).some((node) => node?.type === "icon");

  const pushLink = (config: ExternalLinkConfig) => {
    const serialized = serializeExternalLinkConfig({
      href: config.href,
      rel: config.rel || "stylesheet",
      crossorigin: config.crossorigin ?? null,
    });

    if (links.some((link) => serializeExternalLinkConfig(link) === serialized)) return;
    links.push({ ...config, rel: config.rel || "stylesheet", crossorigin: config.crossorigin ?? null });
  };

  const hasFontsGoogleApis = links.some((link) => link.href.includes("https://fonts.googleapis.com"));
  const hasFontsGstatic = links.some((link) => link.href.includes("https://fonts.gstatic.com"));
  const hasInter = links.some((link) => /family=Inter/i.test(link.href));
  const hasMaterialSymbols = links.some((link) => /Material\+Symbols/i.test(link.href));

  if (!hasInter) {
    if (!hasFontsGoogleApis) pushLink({ href: "https://fonts.googleapis.com", rel: "preconnect", crossorigin: null });
    if (!hasFontsGstatic) pushLink({ href: "https://fonts.gstatic.com", rel: "preconnect", crossorigin: "" });
    pushLink({ href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap", rel: "stylesheet", crossorigin: null });
  }

  if (hasIconNodes && !hasMaterialSymbols) {
    if (!links.some((link) => link.href.includes("https://fonts.googleapis.com"))) {
      pushLink({ href: "https://fonts.googleapis.com", rel: "preconnect", crossorigin: null });
    }
    if (!links.some((link) => link.href.includes("https://fonts.gstatic.com"))) {
      pushLink({ href: "https://fonts.gstatic.com", rel: "preconnect", crossorigin: "" });
    }
    pushLink({
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
      rel: "stylesheet",
      crossorigin: null,
    });
  }

  return { links, styles };
}

function toCssValue(key: string, value: unknown): string | null {
  if (value === null || value === undefined || SKIP.has(value as string)) return null;
  const stringValue = String(value);

  if (key === "gap" && !/\d+(px|rem|em|%|vw|vh|fr)/.test(stringValue) && stringValue !== "0") return null;

  const twFontSize: Record<string, string> = {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  };
  if (key === "fontSize" && twFontSize[stringValue]) return twFontSize[stringValue];

  const twRadius: Record<string, string> = {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  };
  if (key === "borderRadius" && twRadius[stringValue]) return twRadius[stringValue];

  const pxKeys = new Set([
    "padding",
    "margin",
    "gap",
    "width",
    "height",
    "borderWidth",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
  ]);
  if (pxKeys.has(key) && /^\d+(\.\d+)?$/.test(stringValue)) return `${stringValue}px`;

  return stringValue;
}

function propsToStyle(props: Record<string, unknown>): string {
  const cssPropMap: Record<string, string> = {
    display: "display",
    padding: "padding",
    paddingTop: "padding-top",
    paddingBottom: "padding-bottom",
    paddingLeft: "padding-left",
    paddingRight: "padding-right",
    margin: "margin",
    gap: "gap",
    width: "width",
    height: "height",
    minHeight: "min-height",
    maxWidth: "max-width",
    flexDirection: "flex-direction",
    justifyContent: "justify-content",
    alignItems: "align-items",
    flexWrap: "flex-wrap",
    color: "color",
    backgroundColor: "background-color",
    background: "background",
    borderRadius: "border-radius",
    borderWidth: "border-width",
    borderColor: "border-color",
    opacity: "opacity",
    boxShadow: "box-shadow",
    fontSize: "font-size",
    fontWeight: "font-weight",
    lineHeight: "line-height",
    textAlign: "text-align",
    letterSpacing: "letter-spacing",
    textDecoration: "text-decoration",
    objectFit: "object-fit",
    objectPosition: "object-position",
    gridTemplateColumns: "grid-template-columns",
    gridTemplateRows: "grid-template-rows",
    gridColumn: "grid-column",
    gridRow: "grid-row",
  };

  const parts: string[] = [];

  for (const [propKey, cssKey] of Object.entries(cssPropMap)) {
    const resolved = toCssValue(propKey, props[propKey]);
    if (resolved) parts.push(`${cssKey}:${resolved}`);
  }

  if (props.style && typeof props.style === "object" && !Array.isArray(props.style)) {
    for (const [styleKey, styleValue] of Object.entries(props.style as Record<string, unknown>)) {
      if (typeof styleValue !== "string" || !styleValue.trim()) continue;
      parts.push(`${styleKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${styleValue}`);
    }
  }

  return parts.join(";");
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveTag(tag: unknown, fallback: string): string {
  const allowed = new Set(["div", "section", "article", "aside", "header", "footer", "main", "nav", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "label", "strong", "em", "small"]);
  const candidate = typeof tag === "string" ? tag : fallback;
  return allowed.has(candidate) ? candidate : fallback;
}

function normalizeRenderableProps(nodeId: string, type: string, rawProps: Record<string, unknown>): Record<string, unknown> {
  const { props } = normalizeNodeProps(nodeId, rawProps, "lenient", type);
  const normalized = { ...props };

  if (FLEX_CONTAINERS.has(type) && !normalized.display) {
    if (normalized.flexDirection || normalized.alignItems || normalized.justifyContent || normalized.flexWrap || normalized.gap) {
      normalized.display = "flex";
    }
  }

  if (
    type === "text" &&
    typeof normalized.backgroundColor === "string" &&
    normalized.backgroundColor.trim() &&
    (normalized.color === undefined || normalized.color === null || normalized.color === "")
  ) {
    normalized.color = normalized.backgroundColor;
    delete normalized.backgroundColor;
  }

  if (
    type === "link" &&
    typeof normalized.label === "string" &&
    normalized.label.trim() &&
    (normalized.text === undefined || normalized.text === null || normalized.text === "")
  ) {
    normalized.text = normalized.label;
  }

  return normalized;
}

function buildAttrs(
  nodeId: string,
  type: string,
  props: Record<string, unknown>,
  style: string,
  options: SchemaToHtmlOptions,
): string {
  const attrs = [
    `data-studio-node-id="${esc(nodeId)}"`,
    `data-studio-node-type="${esc(type)}"`,
  ];

  // data-studio-selected is now applied locally by the iframe JS (getPreviewBridge)
  // so no static attribute needed here — avoids regenerating HTML on every selection change.

  if (typeof props.className === "string" && props.className.trim()) {
    attrs.push(`class="${esc(props.className)}"`);
  }

  if (typeof props.path === "string" && props.path.trim()) {
    attrs.push(`data-path="${esc(props.path)}"`);
  }

  if (style) {
    attrs.push(`style="${esc(style)}"`);
  }

  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
}

function renderNode(
  nodeId: string,
  nodes: Record<string, SchemaNode>,
  visited: Set<string>,
  options: SchemaToHtmlOptions,
): string {
  if (visited.has(nodeId)) return "";
  visited.add(nodeId);

  const node = nodes[nodeId];
  if (!node) return "";

  const { type, children = [] } = node;
  const props = normalizeRenderableProps(nodeId, type, node.props ?? {});
  const style = propsToStyle(props);
  const attrs = buildAttrs(nodeId, type, props, style, options);
  const childHtml = children
    .map((childId) => renderNode(childId, nodes, new Set(visited), options))
    .join("");

  const text = children.length === 0
    ? esc(props.content ?? props.text ?? props.label ?? props.value ?? "")
    : "";

  switch (type) {
    case "section":
      return `<section${attrs}>${childHtml}</section>`;
    case "container":
      return `<div${attrs}>${childHtml}</div>`;
    case "div": {
      const tag = resolveTag(props.tag, "div");
      return `<${tag}${attrs}>${childHtml}</${tag}>`;
    }
    case "row":
      return `<div${buildAttrs(nodeId, type, props, `display:flex;flex-direction:row;${style}`, options)}>${childHtml}</div>`;
    case "column":
      return `<div${buildAttrs(nodeId, type, props, `display:flex;flex-direction:column;${style}`, options)}>${childHtml}</div>`;
    case "twoColumn": {
      const ratio = esc(props.ratio ?? "50-50");
      const [leftRatio, rightRatio] = ratio.split("-").map(Number);
      const leftFlex = leftRatio || 50;
      const rightFlex = rightRatio || 50;
      return `<div${buildAttrs(nodeId, type, props, `display:flex;${style}`, options)}>${
        children[0] ? `<div style="flex:${leftFlex}">${renderNode(children[0], nodes, new Set(visited), options)}</div>` : ""
      }${
        children[1] ? `<div style="flex:${rightFlex}">${renderNode(children[1], nodes, new Set(visited), options)}</div>` : ""
      }</div>`;
    }
    case "threeColumn":
      return `<div${buildAttrs(nodeId, type, props, `display:flex;gap:1rem;${style}`, options)}>${childHtml}</div>`;
    case "flex":
      return `<div${buildAttrs(nodeId, type, props, `display:flex;${style}`, options)}>${childHtml}</div>`;
    case "group":
      return `<div${attrs}>${childHtml}</div>`;

    case "heading": {
      const level = Math.min(6, Math.max(1, Number(props.level ?? 2)));
      const tag = `h${level}`;
      return `<${tag}${attrs}>${text}${childHtml}</${tag}>`;
    }
    case "icon": {
      const iconProps = { ...props, className: [getMaterialSymbolClass(props.variant), props.className].filter(Boolean).join(" ") };
      const iconStyle = buildIconStyle(iconProps, style);
      const iconAttrs = buildAttrs(nodeId, type, iconProps, iconStyle, options);
      const iconName = esc(props.name ?? "bolt");
      return `<span${iconAttrs} aria-hidden="true">${iconName}</span>`;
    }
    case "text":
    case "paragraph": {
      const tag = resolveTag(props.tag, "p");
      return `<${tag}${attrs}>${text}${childHtml}</${tag}>`;
    }
    case "link": {
      const href = esc(props.href ?? props.url ?? "#");
      return `<a href="${href}"${attrs}>${text}${childHtml}</a>`;
    }

    case "image": {
      const src = String(props.src ?? props.url ?? "").trim();
      const alt = esc(props.alt ?? props.label ?? "");
      if (!src) {
        // Render a placeholder box instead of a broken browser icon
        return `<div${buildAttrs(nodeId, type, props, `background:#f3f4f6;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;min-height:120px;${style}`, options)}>
  <span style="font-size:0.75rem;color:#9ca3af">[ image ]</span>
</div>`;
      }
      return `<img src="${esc(src)}" alt="${alt}"${attrs} />`;
    }
    case "video": {
      const src = esc(props.src ?? "");
      return `<video controls${attrs}><source src="${src}" /></video>`;
    }
    case "avatar": {
      const src = String(props.src ?? "").trim();
      const alt = esc(props.alt ?? "Avatar");
      const fallback = esc(props.fallback ?? props.alt ?? "");
      // Determine size from className or default to 40px
      const sizeClass = typeof props.className === "string" ? props.className : "";
      const sizePx = sizeClass.includes("h-20") ? "80px"
        : sizeClass.includes("h-16") ? "64px"
        : sizeClass.includes("h-12") ? "48px"
        : sizeClass.includes("h-8")  ? "32px"
        : sizeClass.includes("h-6")  ? "24px"
        : "40px";
      if (src) {
        return `<img src="${esc(src)}" alt="${alt}"${buildAttrs(nodeId, type, props, `border-radius:50%;width:${sizePx};height:${sizePx};object-fit:cover;flex-shrink:0;${style}`, options)} />`;
      }
      // Fallback: render initials circle
      return `<div${buildAttrs(nodeId, type, props, `border-radius:50%;width:${sizePx};height:${sizePx};background:#e5e7eb;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;color:#374151;flex-shrink:0;${style}`, options)}>${fallback}</div>`;
    }

    case "button": {
      const variant = String(props.variant ?? "default");
      // Use data-variant attribute + CSS selectors (in <style> block) instead of inline styles.
      // Inline styles have higher specificity (1-0-0) than Tailwind classes (0-1-0) and would
      // prevent className-based overrides. The CSS selector approach keeps them overridable.
      return `<button type="${esc(props.type ?? "button")}"${buildAttrs(nodeId, type, props, style, options)} data-variant="${esc(variant)}">${text}${childHtml}</button>`;
    }
    case "iconButton":
      return `<button type="button"${attrs} aria-label="${text}">${childHtml}</button>`;
    case "input": {
      const placeholder = esc(props.placeholder ?? "");
      const inputType = esc(props.type ?? "text");
      return `<input type="${inputType}" placeholder="${placeholder}"${attrs} />`;
    }
    case "textarea": {
      const placeholder = esc(props.placeholder ?? "");
      return `<textarea placeholder="${placeholder}"${attrs}></textarea>`;
    }
    case "checkbox": {
      const label = esc(props.label ?? "");
      const checked = props.checked ? " checked" : "";
      return `<label${attrs}><input type="checkbox"${checked} /> ${label}</label>`;
    }
    case "select": {
      const optionList = Array.isArray(props.options)
        ? (props.options as unknown[]).map(String)
        : typeof props.options === "string"
          ? props.options.split(",").map((value) => value.trim())
          : [];
      const optionsHtml = optionList.map((option) => `<option>${esc(option)}</option>`).join("");
      return `<select${attrs}>${optionsHtml}</select>`;
    }
    case "radioGroup": {
      const name = `rg-${nodeId}`;
      const optionsList = Array.isArray(props.options)
        ? (props.options as unknown[]).map(String)
        : typeof props.options === "string"
          ? props.options.split(",").map((value) => value.trim())
          : [];
      const radios = optionsList.map((option) => `<label><input type="radio" name="${name}" value="${esc(option)}" /> ${esc(option)}</label>`).join(" ");
      return `<div${attrs}>${radios}</div>`;
    }
    case "switch": {
      const label = esc(props.label ?? "");
      return `<label${attrs}><input type="checkbox" role="switch" /> ${label}</label>`;
    }
    case "toggle": {
      const label = esc(props.label ?? text);
      return `<button type="button"${buildAttrs(nodeId, type, props, `padding:0.25rem 0.75rem;border:1px solid #e5e7eb;border-radius:0.375rem;${style}`, options)}>${label}</button>`;
    }
    case "toggleGroup": {
      const optionsList = Array.isArray(props.options)
        ? (props.options as unknown[]).map((option) => {
            if (typeof option === "object" && option !== null && "label" in option) return String((option as any).label);
            return String(option);
          })
        : typeof props.options === "string"
          ? props.options.split(",").map((value) => value.trim())
          : [];
      const buttons = optionsList.length > 0
        ? optionsList.map((option) => `<button type="button" style="padding:0.25rem 0.75rem;border:1px solid #e5e7eb;border-radius:0.375rem">${esc(option)}</button>`).join("")
        : childHtml;
      return `<div${buildAttrs(nodeId, type, props, `display:inline-flex;gap:0.25rem;${style}`, options)}>${buttons}</div>`;
    }

    case "separator":
    case "divider":
      return `<hr${attrs} />`;
    case "spacer":
      return `<div${buildAttrs(nodeId, type, props, `flex:1;${style}`, options)}></div>`;
    case "badge":
      return `<span${buildAttrs(nodeId, type, props, `display:inline-block;padding:0.125rem 0.5rem;border-radius:9999px;font-size:0.75rem;${style}`, options)}>${text}</span>`;
    case "progress": {
      const value = Math.min(100, Math.max(0, Number(props.value ?? 50)));
      return `<progress value="${value}" max="100"${attrs}>${value}%</progress>`;
    }
    case "slider": {
      const value = props.value ?? props.defaultValue ?? 50;
      const min = props.min ?? 0;
      const max = props.max ?? 100;
      return `<input type="range" min="${esc(min)}" max="${esc(max)}" value="${esc(value)}"${attrs} />`;
    }
    case "tabs": {
      const tabList = Array.isArray(props.tabs)
        ? (props.tabs as unknown[]).map(String)
        : typeof props.tabs === "string"
          ? props.tabs.split(",").map((value) => value.trim())
          : ["Tab 1"];
      const tabButtons = tabList.map((tab, index) => (
        `<button type="button" style="padding:0.25rem 0.75rem;border-bottom:2px solid ${index === 0 ? "currentColor" : "transparent"}">${esc(tab)}</button>`
      )).join("");
      return `<div${attrs}><div style="display:flex;border-bottom:1px solid #e5e7eb">${tabButtons}</div>${childHtml}</div>`;
    }
    case "accordion": {
      const itemList = Array.isArray(props.items)
        ? (props.items as unknown[]).map(String)
        : typeof props.items === "string"
          ? props.items.split(",").map((value) => value.trim())
          : [];
      const items = itemList.map((item) => (
        `<details style="border-bottom:1px solid #e5e7eb;padding:0.5rem 0"><summary>${esc(item)}</summary><div style="padding:0.5rem 0">${childHtml}</div></details>`
      )).join("");
      return `<div${attrs}>${items}</div>`;
    }
    case "breadcrumb": {
      const crumbs = Array.isArray(props.items)
        ? (props.items as unknown[]).map(String)
        : typeof props.items === "string"
          ? props.items.split(",").map((value) => value.trim())
          : [];
      const parts = crumbs.map((crumb, index) => (
        index < crumbs.length - 1
          ? `<a href="#">${esc(crumb)}</a>`
          : `<span>${esc(crumb)}</span>`
      )).join('<span aria-hidden="true"> / </span>');
      return `<nav aria-label="breadcrumb"${attrs}>${parts}</nav>`;
    }
    case "card": {
      // Base card styles are in <style> block via [data-studio-node-type="card"] selector
      // so className Tailwind classes override them (same specificity, Tailwind injected later).
      // Render title/description/image when no children are present.
      let cardInner = childHtml;
      if (!cardInner) {
        const imgSrc = String(props.imageUrl ?? props.src ?? "").trim();
        const imgHtml = imgSrc
          ? `<img src="${esc(imgSrc)}" alt="${esc(String(props.alt ?? props.title ?? ""))}" style="width:100%;border-radius:0.375rem;margin-bottom:0.75rem;object-fit:cover;display:block">`
          : "";
        const titleHtml = props.title
          ? `<div style="font-size:1.125rem;font-weight:700;margin-bottom:0.25rem;line-height:1.3">${esc(String(props.title))}</div>`
          : "";
        const descHtml = props.description
          ? `<div style="font-size:0.875rem;opacity:0.75;line-height:1.6">${esc(String(props.description))}</div>`
          : "";
        cardInner = imgHtml + titleHtml + descHtml;
      }
      return `<div${buildAttrs(nodeId, type, props, style, options)}>${cardInner}</div>`;
    }
    case "alert": {
      const message = esc(props.message ?? props.description ?? text);
      return `<div role="alert"${buildAttrs(nodeId, type, props, `padding:0.75rem 1rem;border-radius:0.375rem;background:#fef9c3;${style}`, options)}>${message}${childHtml}</div>`;
    }
    case "collapsible": {
      const title = esc(props.title ?? props.label ?? "Toggle");
      return `<details${attrs}><summary>${title}</summary>${childHtml}</details>`;
    }
    case "scrollArea":
      return `<div${buildAttrs(nodeId, type, props, `overflow:auto;${style}`, options)}>${childHtml}</div>`;
    case "aspectRatio": {
      const ratio = Number(props.ratio ?? 1);
      const paddingTop = ratio > 0 ? `${(1 / ratio) * 100}%` : "100%";
      return `<div${buildAttrs(nodeId, type, props, `position:relative;padding-top:${paddingTop};${style}`, options)}><div style="position:absolute;inset:0">${childHtml}</div></div>`;
    }
    case "skeleton":
      return `<div${buildAttrs(nodeId, type, props, `background:#e5e7eb;border-radius:0.25rem;min-height:1rem;${style}`, options)}></div>`;
    case "hoverCard":
    case "dialog":
      return `<div${attrs}>${childHtml}</div>`;

    case "grid": {
      const className = String(props.className ?? "");
      // Priority: lg > md > sm > plain (largest wins for desktop-first HTML export)
      const colMatch =
        className.match(/lg:grid-cols-(\d+)/) ??
        className.match(/md:grid-cols-(\d+)/) ??
        className.match(/sm:grid-cols-(\d+)/) ??
        className.match(/(?<![a-z]:)grid-cols-(\d+)/);
      const columns = colMatch ? colMatch[1] : String(props.columns ?? "3");
      // Strip any display: override injected by normalizeRenderableProps so display:grid always survives
      const propsStyle = style.replace(/\bdisplay:[^;]+;?/gi, "");
      const gridStyle = `display:grid;grid-template-columns:repeat(${esc(columns)},minmax(0,1fr));gap:${esc(String(props.gap ?? "1rem"))};${propsStyle}`;
      return `<div${buildAttrs(nodeId, type, props, gridStyle, options)}>${childHtml}</div>`;
    }

    case "metricCardBlock": {
      const title = esc(props.title ?? "Metric");
      const value = esc(props.value ?? "—");
      const description = esc(props.description ?? "");
      const trend = props.trend as { value?: unknown; direction?: string } | undefined;
      let trendHtml = "";
      if (trend && typeof trend === "object") {
        const direction = String(trend.direction ?? "neutral");
        const trendColor = direction === "up" ? "#10b981" : direction === "down" ? "#ef4444" : "#6b7280";
        const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
        const trendValue = Math.abs(Number(trend.value ?? 0));
        trendHtml = `<span style="font-size:0.75rem;font-weight:500;color:${trendColor};display:inline-flex;align-items:center;gap:2px">${arrow} ${trendValue}%</span>`;
      }
      return `<div${buildAttrs(nodeId, type, props, `border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;${style}`, options)}>
  <p style="font-size:0.875rem;font-weight:500;color:#6b7280;margin:0 0 0.5rem 0">${title}</p>
  <p style="font-size:1.5rem;font-weight:700;color:#111827;margin:0 0 0.375rem 0">${value}</p>
  <div style="display:flex;align-items:center;gap:0.5rem">${trendHtml}${description ? `<span style="font-size:0.75rem;color:#9ca3af">${description}</span>` : ""}</div>
</div>`;
    }
    case "chartBlock": {
      const title = esc(props.title ?? "Chart");
      const chartType = esc(props.chartType ?? props.type ?? "bar");
      const height = esc(props.height ?? "280px");
      return `<div${buildAttrs(nodeId, type, props, `border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;${style}`, options)}>
  <p style="font-size:1rem;font-weight:600;color:#111827;margin:0 0 1rem 0">${title}</p>
  <div style="height:${height};background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border-radius:0.5rem;display:flex;align-items:center;justify-content:center">
    <span style="font-size:0.875rem;color:#93c5fd;font-weight:500">[${chartType} chart]</span>
  </div>
</div>`;
    }
    case "statsBlock": {
      const title = esc(props.title ?? "Stats");
      return `<div${buildAttrs(nodeId, type, props, `border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;${style}`, options)}>
  <p style="font-size:1rem;font-weight:600;color:#111827;margin:0 0 1rem 0">${title}</p>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem">
    ${["Metric A", "Metric B", "Metric C", "Metric D"].map((metric) => `<div style="padding:0.75rem;background:#f9fafb;border-radius:0.5rem"><p style="font-size:0.75rem;color:#6b7280;margin:0">${metric}</p><p style="font-size:1.125rem;font-weight:700;color:#111827;margin:0.25rem 0 0">—</p></div>`).join("")}
  </div>
</div>`;
    }
    case "tableBlock": {
      const title = esc(props.title ?? "Table");
      const columns = Array.isArray(props.columns) ? (props.columns as unknown[]).map(String) : ["Column 1", "Column 2", "Column 3"];
      const headerCells = columns.map((column) => `<th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;text-transform:uppercase;letter-spacing:0.05em">${esc(column)}</th>`).join("");
      const placeholderRow = columns.map(() => `<td style="padding:0.75rem 1rem;font-size:0.875rem;color:#374151;border-bottom:1px solid #f3f4f6">—</td>`).join("");
      const rows = [1, 2, 3].map(() => `<tr>${placeholderRow}</tr>`).join("");
      return `<div${buildAttrs(nodeId, type, props, `border:1px solid #e5e7eb;border-radius:0.75rem;overflow:hidden;background:#fff;${style}`, options)}>
  <div style="padding:1rem 1.5rem;border-bottom:1px solid #e5e7eb"><p style="font-size:1rem;font-weight:600;color:#111827;margin:0">${title}</p></div>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div>
</div>`;
    }
    case "kanbanBlock": {
      const title = esc(props.title ?? "Kanban");
      const rawCols = props.columns;
      const isStructured = Array.isArray(rawCols) && rawCols.length > 0 && typeof (rawCols as unknown[])[0] === "object";

      let columnHtml: string;
      if (isStructured) {
        columnHtml = (rawCols as Array<{ id?: string; title?: string; items?: Array<{ id?: string; title?: string; priority?: string; tags?: string[]; dueDate?: string }> }>)
          .map(col => {
            const colTitle = esc(col.title ?? "Column");
            const items = Array.isArray(col.items) ? col.items : [];
            const cardHtml = items.map(item => {
              const cardTitle = esc(item.title ?? "Task");
              const priorityColor = item.priority === "high" ? "#ef4444" : item.priority === "medium" ? "#f59e0b" : "#6b7280";
              const priorityHtml = item.priority
                ? `<span style="font-size:0.625rem;padding:0.1rem 0.4rem;border-radius:9999px;background:${priorityColor}1a;color:${priorityColor};font-weight:600;text-transform:capitalize">${esc(item.priority)}</span>`
                : "";
              const tagsHtml = (item.tags ?? []).map(t => `<span style="font-size:0.625rem;padding:0.1rem 0.4rem;border-radius:9999px;border:1px solid #e5e7eb;color:#6b7280">${esc(t)}</span>`).join("");
              const dueDateHtml = item.dueDate ? `<span style="font-size:0.625rem;color:#9ca3af">${esc(item.dueDate)}</span>` : "";
              return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.625rem;margin-bottom:0.375rem;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
  <p style="font-size:0.8125rem;font-weight:500;color:#111827;margin:0 0 0.375rem">${cardTitle}</p>
  <div style="display:flex;flex-wrap:wrap;gap:0.25rem;align-items:center">${priorityHtml}${tagsHtml}${dueDateHtml}</div>
</div>`;
            }).join("");
            const emptyHtml = items.length === 0
              ? `<div style="border:2px dashed #e5e7eb;border-radius:0.375rem;padding:1rem;text-align:center"><span style="font-size:0.75rem;color:#9ca3af">No items</span></div>`
              : "";
            return `<div style="flex:0 0 13rem;background:#f9fafb;border-radius:0.5rem;padding:0.75rem">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.625rem">
    <p style="font-size:0.75rem;font-weight:600;color:#374151;margin:0">${colTitle}</p>
    <span style="font-size:0.625rem;padding:0.1rem 0.4rem;border-radius:9999px;background:#e5e7eb;color:#6b7280">${items.length}</span>
  </div>
  ${cardHtml}${emptyHtml}
</div>`;
          }).join("");
      } else {
        // Fallback — just column headers from string array
        const cols = Array.isArray(rawCols) ? (rawCols as unknown[]).map(String) : ["To Do", "In Progress", "Done"];
        columnHtml = cols.map(col => `<div style="flex:1;min-width:180px;background:#f9fafb;border-radius:0.5rem;padding:0.75rem"><p style="font-size:0.75rem;font-weight:600;color:#6b7280;margin:0 0 0.75rem;text-transform:uppercase;letter-spacing:0.05em">${esc(col)}</p><div style="height:80px;border:2px dashed #e5e7eb;border-radius:0.375rem"></div></div>`).join("");
      }

      return `<div${buildAttrs(nodeId, type, props, `border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;${style}`, options)}>
  <p style="font-size:1rem;font-weight:600;color:#111827;margin:0 0 1rem 0">${title}</p>
  <div style="display:flex;gap:0.75rem;overflow-x:auto;padding-bottom:0.5rem">${columnHtml}</div>
</div>`;
    }
    case "listBlock": {
      const title = esc(props.title ?? "List");
      const items = [1, 2, 3, 4].map((index) => `<div style="padding:0.75rem 0;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:0.75rem"><div style="width:32px;height:32px;border-radius:50%;background:#eff6ff;flex-shrink:0"></div><div style="flex:1"><div style="height:0.75rem;background:#e5e7eb;border-radius:4px;width:${60 + index * 10}%"></div></div></div>`).join("");
      return `<div${buildAttrs(nodeId, type, props, `border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;${style}`, options)}>
  <p style="font-size:1rem;font-weight:600;color:#111827;margin:0 0 0.75rem 0">${title}</p>
  ${items}
</div>`;
    }
    case "filterBlock":
    case "formBlock":
    case "calendarBlock": {
      const title = esc(props.title ?? type.replace("Block", ""));
      return `<div${buildAttrs(nodeId, type, props, `border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;${style}`, options)}>
  <p style="font-size:1rem;font-weight:600;color:#111827;margin:0 0 0.75rem 0">${title}</p>
  <div style="height:120px;background:#f9fafb;border-radius:0.5rem;display:flex;align-items:center;justify-content:center">
    <span style="font-size:0.875rem;color:#9ca3af">[${esc(type)}]</span>
  </div>
</div>`;
    }

    case "navGroup": {
      const label = esc(props.label ?? "");
      return `<nav${attrs}>${label ? `<p style="font-weight:600;font-size:0.75rem;margin-bottom:0.5rem">${label}</p>` : ""}${childHtml}</nav>`;
    }

    default:
      return `<div${attrs}>${childHtml}</div>`;
  }
}

function getPreviewBridge(options: SchemaToHtmlOptions): string {
  if (!options.designMode) return "";

  return `
  <style>
    html[data-studio-design-mode="true"] [data-studio-node-id] {
      cursor: pointer;
      outline: 1px dashed transparent;
      outline-offset: 2px;
    }
    html[data-studio-design-mode="true"] [data-studio-node-id]:hover {
      outline-color: #93c5fd;
    }
    [data-studio-selected="true"] {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px;
    }
  </style>
  <script>
    (function () {
      document.documentElement.setAttribute("data-studio-design-mode", "true");
      var _sel = null;
      document.addEventListener("click", function (event) {
        var target = event.target;
        if (!(target instanceof Element)) return;
        var node = target.closest("[data-studio-node-id]");
        if (!node) return;
        event.preventDefault();
        event.stopPropagation();
        // Local highlight — no iframe reload needed
        if (_sel) _sel.removeAttribute("data-studio-selected");
        node.setAttribute("data-studio-selected", "true");
        _sel = node;
        var nodeId = node.getAttribute("data-studio-node-id");
        if (!nodeId || window.parent === window) return;
        window.parent.postMessage({
          source: "${PREVIEW_MESSAGE_SOURCE}",
          type: "node-select",
          nodeId: nodeId
        }, "*");
      }, true);
    })();
  </script>`;
}

export function schemaToHtml(schema: Schema, options: SchemaToHtmlOptions = {}): string {
  if (!schema?.nodes || !Array.isArray(schema.root)) {
    return "<!DOCTYPE html><html><body><p>Empty schema.</p></body></html>";
  }

  const roots = options.rootIds && options.rootIds.length > 0 ? options.rootIds : schema.root;
  const visited = new Set<string>();
  const body = roots
    .map((id) => renderNode(id, schema.nodes, visited, options))
    .join("\n");

  const title = schema.metadata?.name ?? "Studio Export";
  const { links, styles } = getSchemaHeadAssets(schema);
  const externalLinksHtml = links.map((link) => renderHeadLink(link)).join("\n");
  const externalStylesHtml = styles
    .map((css) => `  <style>\n${css}\n  </style>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
${externalLinksHtml ? `${externalLinksHtml}\n` : ""}
${externalStylesHtml ? `${externalStylesHtml}\n` : ""}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      font-family: system-ui, sans-serif;
      font-size: 1rem;
      color: #111827;
      background: #ffffff;
    }
    img { max-width: 100%; height: auto; display: block; }
    /* Button base — tag selector (0-0-1) so Tailwind CDN classes (0-1-0) always win.
       These are fallback styles shown before/without Tailwind CDN. */
    button {
      cursor: pointer; font: inherit;
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 0.375rem;
      border: 1px solid #e5e7eb; background: #fff; color: #111827;
      font-size: 0.875rem; font-weight: 500; white-space: nowrap;
      text-decoration: none; line-height: 1.25rem;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    /* Variant overrides — attribute selector (0-1-0) = same specificity as Tailwind classes,
       but our <style> appears BEFORE Tailwind CDN's injected <style> → Tailwind wins on conflicts. */
    [data-variant="ghost"], [data-variant="link"] { background: transparent; border-color: transparent; }
    [data-variant="outline"] { background: transparent; }
    [data-variant="primary"] { background: #1e293b; color: #fff; border-color: #1e293b; }
    [data-variant="destructive"] { background: #dc2626; color: #fff; border-color: #b91c1c; }
    [data-variant="secondary"] { background: #f1f5f9; border-color: #e2e8f0; }
    /* Card base — same specificity pattern as buttons above */
    [data-studio-node-type="card"] {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
    }
    input, textarea, select { font: inherit; }
    details > summary { cursor: pointer; }
    .material-symbols-outlined,
    .material-symbols-rounded,
    .material-symbols-sharp {
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: "liga";
      vertical-align: middle;
    }
    .material-symbols-outlined { font-family: "Material Symbols Outlined" !important; }
    .material-symbols-rounded { font-family: "Material Symbols Rounded" !important; }
    .material-symbols-sharp { font-family: "Material Symbols Sharp" !important; }
  </style>
  ${getPreviewBridge(options)}
</head>
<body>
${body}
</body>
</html>`;
}
