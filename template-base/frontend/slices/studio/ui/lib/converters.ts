/**
 * Studio JSON ↔ HTML / TSX Converters
 *
 * Provides:
 *   jsonToHtml(schema)       → static HTML string
 *   jsonToTsx(schema, name?) → React TSX component string
 *   htmlToJson(html)         → Studio Schema (best-effort parse)
 *   tsxToJson(tsx)           → Studio Schema (JSX → JSON best-effort)
 *   htmlToJsonStats(schema)  → { nodeCount, emptyCount } after conversion
 */

import { normalizeNodeProps } from '@/frontend/slices/studio/schema';
import type { Schema, SchemaNode } from '@/frontend/slices/studio/ui/types';
export type { Schema, SchemaNode };

/** Stats returned alongside htmlToJson / tsxToJson results */
export interface ConversionStats {
  nodeCount: number;
  emptyNodes: number; // nodes with no content and no children
  textNodesExtracted: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

interface ExternalLinkConfig {
  href: string;
  rel?: string;
  crossorigin?: string | null;
}

const MATERIAL_SYMBOL_CLASS_TO_VARIANT = {
  'material-symbols-outlined': 'outlined',
  'material-symbols-rounded': 'rounded',
  'material-symbols-sharp': 'sharp',
} as const;

type MaterialSymbolVariant = typeof MATERIAL_SYMBOL_CLASS_TO_VARIANT[keyof typeof MATERIAL_SYMBOL_CLASS_TO_VARIANT];

const MATERIAL_SYMBOL_CLASSES = Object.keys(MATERIAL_SYMBOL_CLASS_TO_VARIANT);

function parseExternalLinkConfig(rawLink: string): ExternalLinkConfig | null {
  const trimmed = rawLink.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as ExternalLinkConfig;
    if (!parsed?.href) return null;
    return {
      href: parsed.href,
      rel: parsed.rel || 'stylesheet',
      crossorigin: parsed.crossorigin ?? null,
    };
  } catch {
    return {
      href: trimmed,
      rel: 'stylesheet',
      crossorigin: null,
    };
  }
}

function serializeExternalLinkConfig(config: ExternalLinkConfig): string {
  return JSON.stringify({
    href: config.href,
    rel: config.rel || 'stylesheet',
    crossorigin: config.crossorigin ?? null,
  });
}

function uniqueExternalLinkConfigs(rawLinks: string[] | undefined): ExternalLinkConfig[] {
  const seen = new Set<string>();
  const configs: ExternalLinkConfig[] = [];

  for (const rawLink of rawLinks || []) {
    const parsed = parseExternalLinkConfig(rawLink);
    if (!parsed) continue;

    const key = serializeExternalLinkConfig(parsed);
    if (seen.has(key)) continue;
    seen.add(key);
    configs.push(parsed);
  }

  return configs;
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

function getMaterialSymbolVariant(rawClass: string): MaterialSymbolVariant | null {
  for (const symbolClass of MATERIAL_SYMBOL_CLASSES) {
    if (rawClass.includes(symbolClass)) {
      return MATERIAL_SYMBOL_CLASS_TO_VARIANT[symbolClass as keyof typeof MATERIAL_SYMBOL_CLASS_TO_VARIANT];
    }
  }

  return null;
}

function getMaterialSymbolClass(variant: unknown): keyof typeof MATERIAL_SYMBOL_CLASS_TO_VARIANT {
  if (variant === 'rounded') return 'material-symbols-rounded';
  if (variant === 'sharp') return 'material-symbols-sharp';
  return 'material-symbols-outlined';
}

function buildIconFontVariation(props: Record<string, any>): string | null {
  const fill = props.fill ? 1 : 0;
  const weight = Number(props.weight);
  const grade = Number(props.grade ?? 0);
  const rawSize = props.size ?? props.fontSize;
  const parsedSize = typeof rawSize === 'number'
    ? rawSize
    : typeof rawSize === 'string'
      ? parseInt(rawSize.replace('px', ''), 10)
      : NaN;
  const opsz = Number.isFinite(parsedSize) ? parsedSize : 24;

  if (!props.fill && !Number.isFinite(weight) && grade === 0 && opsz === 24) {
    return null;
  }

  return `'FILL' ${fill}, 'wght' ${Number.isFinite(weight) ? weight : 400}, 'GRAD' ${grade}, 'opsz' ${opsz}`;
}

function getIconSizeValue(props: Record<string, any>): string | null {
  if (typeof props.size === 'number') return `${props.size}px`;
  if (typeof props.size === 'string' && props.size.trim()) {
    return /^\d+$/.test(props.size.trim()) ? `${props.size.trim()}px` : props.size.trim();
  }
  if (typeof props.fontSize === 'string' && props.fontSize.trim()) return props.fontSize.trim();
  return null;
}

function buildIconStyleString(props: Record<string, any>): string {
  const styleParts: string[] = [];
  const size = getIconSizeValue(props);
  const variation = buildIconFontVariation(props);

  if (size) styleParts.push(`font-size:${size}`);
  if (typeof props.color === 'string' && props.color.trim() && props.color !== 'inherit') {
    styleParts.push(`color:${props.color}`);
  }
  if (variation) styleParts.push(`font-variation-settings:${variation}`);
  styleParts.push('line-height:1');
  styleParts.push('display:inline-block');
  styleParts.push('width:1em');
  styleParts.push('height:1em');
  styleParts.push('vertical-align:middle');

  return styleParts.join(';');
}

function buildIconJsxStyle(props: Record<string, any>): string {
  const styleParts: string[] = [];
  const size = getIconSizeValue(props);
  const variation = buildIconFontVariation(props);

  if (size) styleParts.push(`fontSize: ${JSON.stringify(size)}`);
  if (typeof props.color === 'string' && props.color.trim() && props.color !== 'inherit') {
    styleParts.push(`color: ${JSON.stringify(props.color)}`);
  }
  if (variation) styleParts.push(`fontVariationSettings: ${JSON.stringify(variation)}`);
  styleParts.push(`lineHeight: 1`);
  styleParts.push(`display: "inline-block"`);
  styleParts.push(`width: "1em"`);
  styleParts.push(`height: "1em"`);
  styleParts.push(`verticalAlign: "middle"`);

  return styleParts.length > 0 ? ` style={{ ${styleParts.join(', ')} }}` : '';
}

function renderExternalHeadLink(config: ExternalLinkConfig): string {
  const attrs = [`href="${escapeAttr(config.href)}"`];
  attrs.push(`rel="${escapeAttr(config.rel || 'stylesheet')}"`);
  if (config.crossorigin !== null && config.crossorigin !== undefined) {
    attrs.push(`crossorigin="${escapeAttr(config.crossorigin)}"`);
  }
  return `  <link ${attrs.join(' ')} />`;
}

function renderExternalTsxLink(config: ExternalLinkConfig, indent = 2): string {
  const pad = ' '.repeat(indent * 2);
  const attrs = [`href="${config.href}"`, `rel="${config.rel || 'stylesheet'}"`];
  if (config.crossorigin !== null && config.crossorigin !== undefined) {
    attrs.push(`crossOrigin="${config.crossorigin}"`);
  }
  return `${pad}<link ${attrs.join(' ')} />`;
}

function getSchemaHeadAssets(schema: Schema): { links: ExternalLinkConfig[]; styles: string[] } {
  const links = uniqueExternalLinkConfigs(schema.metadata?.externalAssets?.links);
  const styles = uniqueExternalStyles(schema.metadata?.externalAssets?.styles);
  const hasIconNodes = Object.values(schema.nodes || {}).some((node) => node?.type === 'icon');

  const pushLink = (config: ExternalLinkConfig) => {
    const key = serializeExternalLinkConfig({
      href: config.href,
      rel: config.rel || 'stylesheet',
      crossorigin: config.crossorigin ?? null,
    });
    const exists = links.some((link) => serializeExternalLinkConfig(link) === key);
    if (!exists) links.push({ ...config, rel: config.rel || 'stylesheet', crossorigin: config.crossorigin ?? null });
  };

  const hasFontsGoogleApis = links.some((link) => link.href.includes('https://fonts.googleapis.com'));
  const hasFontsGstatic = links.some((link) => link.href.includes('https://fonts.gstatic.com'));
  const hasInter = links.some((link) => /family=Inter/i.test(link.href));
  const hasMaterialSymbols = links.some((link) => /Material\+Symbols/i.test(link.href));

  if (!hasInter) {
    if (!hasFontsGoogleApis) pushLink({ href: 'https://fonts.googleapis.com', rel: 'preconnect', crossorigin: null });
    if (!hasFontsGstatic) pushLink({ href: 'https://fonts.gstatic.com', rel: 'preconnect', crossorigin: '' });
    pushLink({ href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap', rel: 'stylesheet', crossorigin: null });
  }

  if (hasIconNodes && !hasMaterialSymbols) {
    if (!links.some((link) => link.href.includes('https://fonts.googleapis.com'))) {
      pushLink({ href: 'https://fonts.googleapis.com', rel: 'preconnect', crossorigin: null });
    }
    if (!links.some((link) => link.href.includes('https://fonts.gstatic.com'))) {
      pushLink({ href: 'https://fonts.gstatic.com', rel: 'preconnect', crossorigin: '' });
    }
    pushLink({
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
      rel: 'stylesheet',
      crossorigin: null,
    });
  }

  return { links, styles };
}

/** Map Studio widget type → HTML tag */
function widgetTypeToTag(type: string): string {
  const map: Record<string, string> = {
    div: 'div',
    section: 'section',
    container: 'div',
    row: 'div',
    column: 'div',
    flex: 'div',
    grid: 'div',
    twoColumn: 'div',
    threeColumn: 'div',
    text: 'span',
    heading: 'h2',
    button: 'button',
    image: 'img',
    link: 'a',
    card: 'div',
    hero: 'section',
    separator: 'hr',
    spacer: 'div',
    navGroup: 'nav',
    badge: 'span',
    icon: 'span',
  };
  return map[type] ?? 'div';
}

/** Convert props record to HTML attribute string */
function propsToHtmlAttrs(type: string, props: Record<string, any>): string {
  const attrs: string[] = [];

  // className → class
  const cls = props.className ?? '';
  if (cls) attrs.push(`class="${escapeAttr(cls)}"`);

  // Image-specific
  if (type === 'image') {
    if (props.src) attrs.push(`src="${escapeAttr(props.src)}"`);
    if (props.alt !== undefined) attrs.push(`alt="${escapeAttr(String(props.alt))}"`);
    if (props.width) attrs.push(`width="${escapeAttr(String(props.width))}"`);
    if (props.height) attrs.push(`height="${escapeAttr(String(props.height))}"`);
    return attrs.join(' ');
  }

  // Link
  if (type === 'link') {
    if (props.href) attrs.push(`href="${escapeAttr(props.href)}"`);
    if (props.target) attrs.push(`target="${escapeAttr(props.target)}"`);
  }

  // data-path for routing containers
  if (props.path) attrs.push(`data-path="${escapeAttr(props.path)}"`);

  // style from inline layout props
  const style = buildInlineStyle(props);
  if (style) attrs.push(`style="${escapeAttr(style)}"`);

  return attrs.join(' ');
}

function buildInlineStyle(props: Record<string, any>): string {
  const parts: string[] = [];
  if (props.backgroundColor) parts.push(`background-color:${props.backgroundColor}`);
  if (props.backgroundImage) parts.push(`background-image:${props.backgroundImage}`);
  if (props.color) parts.push(`color:${props.color}`);
  if (props.fontSize) parts.push(`font-size:${props.fontSize}`);
  if (props.display && props.display !== 'block') parts.push(`display:${props.display}`);
  if (props.flexDirection) parts.push(`flex-direction:${props.flexDirection}`);
  if (props.justifyContent) parts.push(`justify-content:${props.justifyContent}`);
  if (props.alignItems) parts.push(`align-items:${props.alignItems}`);
  if (props.gap) parts.push(`gap:${props.gap}`);
  return parts.join(';');
}

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Get the inner text content for a node */
function nodeInnerText(type: string, props: Record<string, any>): string | null {
  if (type === 'text' || type === 'heading') return escapeHtml(String(props.content ?? ''));
  if (type === 'button') return escapeHtml(String(props.text ?? props.label ?? 'Button'));
  // BUG 4 FIX: link uses `label` prop (consistent with LinkPropsSchema)
  if (type === 'link') return escapeHtml(String(props.label ?? props.text ?? props.children ?? ''));
  if (type === 'badge') return escapeHtml(String(props.text ?? props.label ?? ''));
  return null;
}

// ─── JSON → HTML ──────────────────────────────────────────────────────────────

function renderNodeHtml(schema: Schema, id: string, indent = 0, visited = new Set<string>()): string {
  if (visited.has(id)) return `<!-- cycle: ${id} -->`;
  visited.add(id);

  const node = schema.nodes[id];
  if (!node) return '';

  const type = node.type;
  const props = node.props ?? {};
  if (type === 'icon') {
    const pad = '  '.repeat(indent);
    const className = [getMaterialSymbolClass(props.variant), props.className].filter(Boolean).join(' ');
    const style = buildIconStyleString(props);
    const attrs = [
      `class="${escapeAttr(className)}"`,
      `aria-hidden="true"`,
    ];
    if (style) attrs.push(`style="${escapeAttr(style)}"`);
    return `${pad}<span ${attrs.join(' ')}>${escapeHtml(String(props.name ?? 'bolt'))}</span>`;
  }

  const tag = props.tag ?? widgetTypeToTag(type);
  const attrs = propsToHtmlAttrs(type, props);
  const pad = '  '.repeat(indent);

  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag}${attrs ? ' ' + attrs : ''} />`;
  }

  const childIds = node.children ?? [];
  const innerText = childIds.length === 0 ? nodeInnerText(type, props) : null;

  if (innerText !== null && childIds.length === 0) {
    return `${pad}<${tag}${attrs ? ' ' + attrs : ''}>${innerText}</${tag}>`;
  }

  const childrenHtml = childIds
    .map((cid) => renderNodeHtml(schema, cid, indent + 1, new Set(visited)))
    .filter(Boolean)
    .join('\n');

  if (!childrenHtml && innerText === null) {
    return `${pad}<${tag}${attrs ? ' ' + attrs : ''}></${tag}>`;
  }

  const inner = [innerText ?? '', childrenHtml].filter(Boolean).join('\n');
  return `${pad}<${tag}${attrs ? ' ' + attrs : ''}>\n${inner}\n${pad}</${tag}>`;
}

/** Convert Studio JSON schema to a static HTML string */
export function jsonToHtml(schema: Schema): string {
  const roots = schema.root ?? [];
  const body = roots
    .map((id) => renderNodeHtml(schema, id, 1))
    .filter(Boolean)
    .join('\n');
  const title = escapeHtml(String(schema.metadata?.name ?? 'Studio Export'));
  const { links, styles } = getSchemaHeadAssets(schema);
  const externalLinksHtml = links.map((link) => renderExternalHeadLink(link)).join('\n');
  const externalStylesHtml = styles
    .map((css) => `  <style>\n${css}\n  </style>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
${externalLinksHtml ? `${externalLinksHtml}\n` : ''}
${externalStylesHtml ? `${externalStylesHtml}\n` : ''}
  
  <script>
    // Auto-detect system theme for Tailwind dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  </script>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            background: { light: "#f6f7f8", dark: "#111418" },
            surface: { light: "#ffffff", dark: "#283039" },
            primary: { DEFAULT: "#2b8cee" },
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased overflow-x-hidden">
${body}
</body>
</html>`;
}

// ─── JSON → TSX ───────────────────────────────────────────────────────────────

function propsToJsxAttrs(type: string, props: Record<string, any>): string {
  const attrs: string[] = [];

  if (props.className) attrs.push(`className="${props.className}"`);

  if (type === 'image') {
    if (props.src) attrs.push(`src="${props.src}"`);
    if (props.alt !== undefined) attrs.push(`alt="${String(props.alt)}"`);
    const w = Number(props.width) || 640;
    const h = Number(props.height) || 420;
    attrs.push(`width={${w}}`);
    attrs.push(`height={${h}}`);
    if (props.objectFit) attrs.push(`style={{ objectFit: '${props.objectFit}' }}`);
  }

  if (type === 'link') {
    if (props.href) attrs.push(`href="${props.href}"`);
    if (props.target) attrs.push(`target="${props.target}"`);
  }

  if (props.path) attrs.push(`data-path="${props.path}"`);

  // inline style from layout props
  const styleParts: string[] = [];
  if (props.backgroundColor) styleParts.push(`backgroundColor: '${props.backgroundColor}'`);
  if (props.backgroundImage) styleParts.push(`backgroundImage: '${props.backgroundImage}'`);
  if (props.color) styleParts.push(`color: '${props.color}'`);
  if (props.display && props.display !== 'block') styleParts.push(`display: '${props.display}'`);
  if (props.flexDirection) styleParts.push(`flexDirection: '${props.flexDirection}'`);
  if (props.justifyContent) styleParts.push(`justifyContent: '${props.justifyContent}'`);
  if (props.alignItems) styleParts.push(`alignItems: '${props.alignItems}'`);
  if (props.gap) styleParts.push(`gap: '${props.gap}'`);
  if (styleParts.length > 0) attrs.push(`style={{ ${styleParts.join(', ')} }}`);

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

function renderNodeTsx(schema: Schema, id: string, indent = 1, visited = new Set<string>()): string {
  if (visited.has(id)) return `${' '.repeat(indent * 2)}{/* cycle: ${id} */}`;
  visited.add(id);

  const node = schema.nodes[id];
  if (!node) return '';

  const type = node.type;
  const props = node.props ?? {};
  const childIds = node.children ?? [];
  const pad = ' '.repeat(indent * 2);

  if (type === 'icon') {
    const className = [getMaterialSymbolClass(props.variant), props.className].filter(Boolean).join(' ');
    const classAttr = className ? ` className="${className}"` : '';
    const styleAttr = buildIconJsxStyle(props);
    return `${pad}<span${classAttr}${styleAttr} aria-hidden="true">${escapeHtml(String(props.name ?? 'bolt'))}</span>`;
  }

  // Special: Next.js Image for img nodes
  if (type === 'image') {
    const src = props.src ?? 'https://picsum.photos/640/420';
    const alt = props.alt ?? '';
    const w = Number(props.width) || 640;
    const h = Number(props.height) || 420;
    const cls = props.className ? ` className="${props.className}"` : '';
    return `${pad}<Image src="${src}" alt="${alt}" width={${w}} height={${h}}${cls} />`;
  }

  const tag = props.tag ?? widgetTypeToTag(type);
  const attrs = propsToJsxAttrs(type, props);
  const innerText = childIds.length === 0 ? nodeInnerText(type, props) : null;

  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag}${attrs} />`;
  }

  const childrenTsx = childIds
    .map((cid) => renderNodeTsx(schema, cid, indent + 1, new Set(visited)))
    .filter(Boolean)
    .join('\n');

  if (innerText !== null && !childrenTsx) {
    return `${pad}<${tag}${attrs}>${innerText}</${tag}>`;
  }

  if (!childrenTsx && innerText === null) {
    return `${pad}<${tag}${attrs} />`;
  }

  const inner = [innerText ? `${pad}  ${innerText}` : '', childrenTsx].filter(Boolean).join('\n');
  return `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`;
}

/** Convert Studio JSON schema to a React TSX component string */
export function jsonToTsx(schema: Schema, componentName = 'StudioPage'): string {
  const roots = schema.root ?? [];
  const hasImages = Object.values(schema.nodes).some((n) => n.type === 'image');
  const { links, styles } = getSchemaHeadAssets(schema);

  const body = roots
    .map((id) => renderNodeTsx(schema, id, 2))
    .filter(Boolean)
    .join('\n');
  const assets = [
    ...links.map((link) => renderExternalTsxLink(link, 2)),
    ...styles.map((css) => `    <style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(css)} }} />`),
  ].join('\n');

  const imageImport = hasImages ? "import Image from 'next/image';\n" : '';

  return `import React from 'react';
${imageImport}
export default function ${componentName}() {
  return (
    <>
${assets ? `${assets}\n` : ''}
${body}
    </>
  );
}
`;
}

// ─── HTML → JSON ──────────────────────────────────────────────────────────────

let _nodeCounter = 0;
function genId(prefix: string): string {
  // Sanitize prefix: only lowercase letters, digits, hyphens
  const safe = prefix.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'node';
  return `${safe}-${++_nodeCounter}`;
}

// ── BUG 6 FIX: font-weight name → numeric string ─────────────────────────────
const FONT_WEIGHT_MAP: Record<string, string> = {
  thin: '100',
  extralight: '200',
  'extra-light': '200',
  light: '300',
  normal: '400',
  regular: '400',
  medium: '500',
  semibold: '600',
  'semi-bold': '600',
  bold: '700',
  extrabold: '800',
  'extra-bold': '800',
  black: '900',
  heavy: '900',
};

// ── BUG 6 FIX: CSS prop → Studio prop mapping ─────────────────────────────────
const CSS_TO_STUDIO_PROP: Record<string, string> = {
  'display': 'display',
  'flex-direction': 'flexDirection',
  'justify-content': 'justifyContent',
  'align-items': 'alignItems',
  'flex-wrap': 'flexWrap',
  'gap': 'gap',
  'background-color': 'backgroundColor',
  'background': 'backgroundColor',
  'background-image': 'backgroundImage',
  'color': 'color',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'padding': 'padding',
  'padding-top': 'paddingTop',
  'padding-bottom': 'paddingBottom',
  'padding-left': 'paddingLeft',
  'padding-right': 'paddingRight',
  'margin': 'margin',
  'width': 'width',
  'height': 'height',
  'min-height': 'minHeight',
  'max-width': 'maxWidth',
  'border-radius': 'borderRadius',
  'border': 'border',
  'box-shadow': 'boxShadow',
  'text-align': 'textAlign',
  'letter-spacing': 'letterSpacing',
  'line-height': 'lineHeight',
  'overflow': 'overflow',
  'z-index': 'zIndex',
  'object-fit': 'objectFit',
};

/**
 * BUG 2 FIX: Parse inline style string → Studio props record
 * e.g. "display:flex;gap:1.5rem;background-color:#1e293b" →
 *      { display: 'flex', gap: '1.5rem', backgroundColor: '#1e293b' }
 */
function parseInlineStyle(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!styleStr) return result;

  for (const declaration of styleStr.split(';')) {
    const colonIdx = declaration.indexOf(':');
    if (colonIdx < 0) continue;
    const cssProp = declaration.slice(0, colonIdx).trim().toLowerCase();
    let cssValue = declaration.slice(colonIdx + 1).trim();
    if (!cssProp || !cssValue) continue;

    const studioProp = CSS_TO_STUDIO_PROP[cssProp];
    if (!studioProp) continue;

    // BUG 6 FIX: Normalize font-weight names to numeric strings
    if (studioProp === 'fontWeight') {
      cssValue = FONT_WEIGHT_MAP[cssValue.toLowerCase()] ?? cssValue;
    }

    // Skip CSS var references which we can't resolve
    if (cssValue.startsWith('var(')) continue;

    result[studioProp] = cssValue;
  }

  return result;
}

// ── Leaf text element tags (take textContent, don't recurse into children) ────
const LEAF_TEXT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'small', 'label', 'li']);

// ── Container tags that should be recursively processed ───────────────────────
const CONTAINER_TAGS = new Set(['div', 'section', 'article', 'nav', 'header', 'footer', 'main', 'aside', 'ul', 'ol', 'form', 'fieldset']);

// ── Semantic layout tags that preserve their tag name via `tag` prop ──────────
const SEMANTIC_LAYOUT_TAGS = new Set(['section', 'article', 'nav', 'header', 'footer', 'main', 'aside', 'ul', 'ol', 'li']);

/**
 * Extract custom Tailwind colors from a script tag containing tailwind.config
 */
function extractTailwindColors(html: string): Record<string, string> {
  const colors: Record<string, string> = {};
  const match = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})/);
  if (!match) return colors;
  try {
     const colorsBlockMatch = match[1].match(/colors:\s*\{([\s\S]*?)\}/);
     if (colorsBlockMatch) {
         const colorLines = colorsBlockMatch[1].split('\n');
         for (const line of colorLines) {
            const kv = line.match(/(['"]?)([a-zA-Z0-9_-]+)\1\s*:\s*(['"])(#[a-fA-F0-9]{3,8})\3/);
            if (kv) {
               colors[kv[2]] = kv[4];
            }
         }
     }
  } catch(e) { /* ignore */ }
  return colors;
}

/**
 * Replace custom color utility classes with explicit bracket Arbitrary values
 * e.g. text-text-secondary -> text-[#9dabb9]
 */
function resolveCustomClasses(className: string, colors: Record<string, string>): string {
   if (!className || Object.keys(colors).length === 0) return className;
   
   return className.split(/\s+/).map(token => {
       const parts = token.split(':');
       const utility = parts.pop();
       if (!utility) return token;
       
       const variants = parts.join(':'); 
       const colorPrefixes = ['bg-', 'text-', 'border-', 'border-t-', 'border-b-', 'border-l-', 'border-r-', 'border-x-', 'border-y-', 'ring-', 'ring-offset-', 'fill-', 'stroke-', 'shadow-', 'divide-', 'to-', 'from-', 'via-'];
       
       for (const prefix of colorPrefixes) {
           if (utility.startsWith(prefix)) {
               const colorName = utility.slice(prefix.length);
               const [baseColor, opacity] = colorName.split('/');
               
               if (colors[baseColor]) {
                   const replaceColor = colors[baseColor];
                   const newUtility = opacity ? `${prefix}[${replaceColor}]/${opacity}` : `${prefix}[${replaceColor}]`;
                   return variants ? `${variants}:${newUtility}` : newUtility;
               }
           }
       }
       return token;
   }).join(' ');
}

function sanitizeImportedHtml(html: string): string {
  return html
    .replace(/\sdata-stitch-added-classes="[^"]*"/gi, '')
    .replace(/\sspellcheck="false"/gi, '')
    .replace(/\scontenteditable="(?:true|false)"/gi, '');
}

function getClassTokens(el: Element): string[] {
  return (el.getAttribute('class') ?? '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function setClassTokens(el: Element, tokens: string[]): void {
  const next = Array.from(new Set(tokens.filter(Boolean)));
  if (next.length === 0) {
    el.removeAttribute('class');
    return;
  }
  el.setAttribute('class', next.join(' '));
}

function getComparableClassTokens(className: string): string[] {
  return className
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !/^text-\[/.test(token) && !/^font-size:/.test(token));
}

function sharesComparableClasses(a: Element, b: Element): boolean {
  const aTokens = getComparableClassTokens(a.getAttribute('class') ?? '');
  const bTokens = getComparableClassTokens(b.getAttribute('class') ?? '');

  if (aTokens.length === 0 || bTokens.length === 0) return false;
  if (aTokens.join(' ') === bTokens.join(' ')) return true;

  const overlap = aTokens.filter((token) => bTokens.includes(token)).length;
  return overlap >= Math.min(aTokens.length, bTokens.length) - 1 && overlap >= 2;
}

function hasVisibleTextNode(node: Element): boolean {
  return Array.from(node.childNodes).some((child) => (
    child.nodeType === 3 && (child.textContent?.trim() ?? '') !== ''
  ));
}

function isIconOnlyAnchor(anchor: Element): boolean {
  const children = Array.from(anchor.children);
  return children.length > 0 &&
    children.every((child) => child.tagName.toLowerCase() === 'span' && getMaterialSymbolVariant(child.getAttribute('class') ?? '') !== null) &&
    !hasVisibleTextNode(anchor);
}

function isTextOnlyAnchor(anchor: Element): boolean {
  if (isIconOnlyAnchor(anchor)) return false;
  const hasNonIconChildren = Array.from(anchor.children).every((child) => (
    child.tagName.toLowerCase() === 'span' && getMaterialSymbolVariant(child.getAttribute('class') ?? '') === null
  ));
  return !!anchor.textContent?.trim() && hasNonIconChildren;
}

function appendNodeContent(target: Element, source: Element): void {
  while (source.firstChild) {
    target.appendChild(source.firstChild);
  }
}

function collapseFragmentedAnchors(root: ParentNode): void {
  root.querySelectorAll('*').forEach((parent) => {
    let current = parent.firstElementChild;

    while (current) {
      if (current.tagName.toLowerCase() !== 'a') {
        current = current.nextElementSibling;
        continue;
      }

      let cursor = current.nextElementSibling;
      while (cursor && cursor.tagName.toLowerCase() === 'a') {
        const sameHref = current.getAttribute('href') && current.getAttribute('href') === cursor.getAttribute('href');
        const mergeable = sameHref &&
          sharesComparableClasses(current, cursor) &&
          (
            isIconOnlyAnchor(current) ||
            isIconOnlyAnchor(cursor) ||
            isTextOnlyAnchor(current) ||
            isTextOnlyAnchor(cursor)
          );

        if (!mergeable) break;

        const nextCursor = cursor.nextElementSibling;
        appendNodeContent(current, cursor);
        cursor.remove();
        cursor = nextCursor;
      }

      current = current.nextElementSibling;
    }
  });
}

function promoteBaseWidthToBreakpoint(tokens: string[], breakpoint = 'md'): string[] {
  const next = tokens.filter((token) => !(token.startsWith('w-') && !token.includes(':') && token !== 'w-full'));
  const baseWidth = tokens.find((token) => token.startsWith('w-') && !token.includes(':') && token !== 'w-full');

  if (baseWidth) {
    if (!next.includes('w-full')) next.unshift('w-full');
    const responsiveWidth = `${breakpoint}:${baseWidth}`;
    if (!next.includes(responsiveWidth)) next.push(responsiveWidth);
  }

  return next;
}

function promoteShrinkToBreakpoint(tokens: string[], breakpoint = 'md'): string[] {
  const next = tokens.filter((token) => token !== 'shrink-0');
  if (tokens.includes('shrink-0') && !next.includes(`${breakpoint}:shrink-0`)) {
    next.push(`${breakpoint}:shrink-0`);
  }
  return next;
}

function replaceShellRowWithResponsiveStack(tokens: string[]): string[] {
  const next = tokens.filter((token) => token !== 'flex-row');
  if (!next.includes('flex-col')) next.push('flex-col');
  if (!next.includes('md:flex-row')) next.push('md:flex-row');
  return next;
}

function repairResponsiveShells(body: HTMLElement): void {
  const shellRoots = Array.from(body.querySelectorAll<HTMLElement>('*')).filter((el) => {
    const tokens = getClassTokens(el);
    return tokens.includes('flex') && tokens.includes('h-screen') && tokens.includes('w-full') && tokens.includes('flex-row');
  });

  shellRoots.forEach((shellRoot) => {
    setClassTokens(shellRoot, replaceShellRowWithResponsiveStack(getClassTokens(shellRoot)));

    Array.from(shellRoot.children).forEach((child) => {
      const element = child as Element;
      const tokens = getClassTokens(element);
      const tag = element.tagName.toLowerCase();

      if ((tag === 'aside' || tokens.includes('shrink-0')) && tokens.some((token) => token.startsWith('w-') && !token.includes(':'))) {
        let next = promoteBaseWidthToBreakpoint(tokens);
        next = promoteShrinkToBreakpoint(next);
        setClassTokens(element, next);
      }

      if (tag === 'main' || tokens.includes('flex-1')) {
        const next = [...tokens];
        if (!next.includes('w-full')) next.push('w-full');
        if (!next.includes('min-w-0')) next.push('min-w-0');
        setClassTokens(element, next);
      }
    });

    shellRoot.querySelectorAll<HTMLElement>('input').forEach((input) => {
      const wrapper = input.parentElement;
      if (!wrapper) return;

      const tokens = getClassTokens(wrapper);
      const hasBaseWidth = tokens.some((token) => token.startsWith('w-') && !token.includes(':') && token !== 'w-full');
      const hasResponsiveWidth = tokens.some((token) => token.startsWith('md:w-'));
      if (!hasBaseWidth || !hasResponsiveWidth) return;

      const next = tokens.filter((token) => !(token.startsWith('w-') && !token.includes(':') && token !== 'w-full'));
      if (!next.includes('w-full')) next.unshift('w-full');
      if (!next.includes('max-w-full')) next.push('max-w-full');
      setClassTokens(wrapper, next);
    });
  });
}

function normalizeImportedDocument(doc: Document): void {
  doc.querySelectorAll('[data-stitch-added-classes]').forEach((node) => {
    node.removeAttribute('data-stitch-added-classes');
  });

  collapseFragmentedAnchors(doc.body);
  repairResponsiveShells(doc.body);
}

/**
 * BUG 1 & 3 FIX: Process DOM children recursively, capturing both text nodes
 * and element children properly based on whether the element is a leaf or container.
 */
function domNodeToStudio(
  el: Element,
  nodes: Record<string, SchemaNode>,
  stats: { textNodesExtracted: number },
  extractedColors: Record<string, string> = {}
): string | null {
  const tag = el.tagName.toLowerCase();
  const id = genId(tag);

  // ── HTMLtag → Studio type mapping ──────────────────────────────────────────
  const typeMap: Record<string, string> = {
    img: 'image',
    a: 'link',
    button: 'button',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    hr: 'separator',
    // Headings and text elements
    h1: 'text', h2: 'text', h3: 'text', h4: 'text', h5: 'text', h6: 'text',
    p: 'text', span: 'text', strong: 'text', em: 'text', small: 'text', label: 'text',
    // Container elements → div with tag prop preserved
    section: 'div', article: 'div', nav: 'div',
    header: 'div', footer: 'div', main: 'div', aside: 'div',
    ul: 'div', ol: 'div', li: 'div', form: 'div', fieldset: 'div',
  };

  const type = typeMap[tag] ?? 'div';
  const props: Record<string, any> = {};

  // className
  const rawClass = el.getAttribute('class') ?? '';
  const className = resolveCustomClasses(rawClass, extractedColors);
  if (className) props.className = className;

  // BUG 2 FIX: Parse inline style attribute
  const styleAttr = el.getAttribute('style') ?? '';
  if (styleAttr) {
    const styleProps = parseInlineStyle(styleAttr);
    Object.assign(props, styleProps);
  }

  // BUG 5 FIX: Preserve data-path for routing
  const dataPath = el.getAttribute('data-path') ?? '';
  if (dataPath) props.path = dataPath;

  // Preserve semantic HTML tag via the `tag` prop so Renderer outputs correct HTML
  if (SEMANTIC_LAYOUT_TAGS.has(tag)) {
    props.tag = tag;
  }

  if (type === 'text') {
    props.tag = tag;
  }

  // ── SPECIAL: Icon Widget Detection (Material Symbols) ────────────────────
  const materialSymbolVariant = tag === 'span' ? getMaterialSymbolVariant(rawClass) : null;
  if (tag === 'span' && materialSymbolVariant) {
    const name = el.textContent?.trim() ?? 'bolt';
    props.name = name;
    props.variant = materialSymbolVariant;
    
    // Extract inline styles (color, font-size -> size)
    const styleAttr = el.getAttribute('style') ?? '';
    const styleProps = parseInlineStyle(styleAttr);
    if (styleProps.color) props.color = styleProps.color;
    // Prioritize 'size' for our widget, but fontSize is a common CSS prop
    if (styleProps.fontSize) {
      props.size = parseInt(styleProps.fontSize.replace('px', '')) || 24;
    }

    // Extract tailwind font size if present (e.g. text-[20px])
    const sizeMatch = rawClass.match(/text-\[(\d+)px\]/);
    if (sizeMatch) props.size = parseInt(sizeMatch[1]);

    // Cleanup className for the icon widget
    const filteredClass = MATERIAL_SYMBOL_CLASSES.reduce(
      (result, symbolClass) => result.replace(symbolClass, ''),
      className,
    ).trim();
    if (filteredClass) props.className = filteredClass;

    nodes[id] = { type: 'icon', props, children: [] };
    return id;
  }

  // ── Type-specific props ──────────────────────────────────────────────────
  if (type === 'image') {
    props.src = el.getAttribute('src') ?? '';
    props.alt = el.getAttribute('alt') ?? '';
    const w = el.getAttribute('width');
    const h = el.getAttribute('height');
    if (w) props.width = w;
    if (h) props.height = h;
    nodes[id] = { type, props, children: [] };
    return id;
  }

  if (type === 'link') {
    const href = el.getAttribute('href') ?? '';
    if (href) props.href = href;
    const target = el.getAttribute('target');
    if (target) props.target = target;
    // Fallback label ONLY IF it has no element children
    if (el.childElementCount === 0) {
      props.label = el.textContent?.trim() ?? '';
      nodes[id] = { type, props, children: [] };
      return id;
    }
  }

  if (type === 'button') {
    // Fallback text ONLY IF it has no element children
    if (el.childElementCount === 0) {
      props.text = el.textContent?.trim() ?? 'Button';
      nodes[id] = { type, props, children: [] };
      return id;
    }
  }

  if (type === 'input') {
    props.type = el.getAttribute('type') ?? 'text';
    const placeholder = el.getAttribute('placeholder');
    if (placeholder) props.placeholder = placeholder;
    nodes[id] = { type, props, children: [] };
    return id;
  }

  if (type === 'textarea') {
    const placeholder = el.getAttribute('placeholder');
    if (placeholder) props.placeholder = placeholder;
    nodes[id] = { type, props, children: [] };
    return id;
  }

  if (type === 'separator') {
    nodes[id] = { type, props, children: [] };
    return id;
  }

  // ── LEAF TEXT ELEMENTS (h1-h6, p, span, strong, em, etc.) ───────────────
  // BUG 3 FIX: Only take textContent for true leaf text tags.
  // We only treat them as leaf text IF they have no element children (e.g. an icon span).
  if (LEAF_TEXT_TAGS.has(tag) && el.childElementCount === 0) {
    props.content = el.textContent?.trim() ?? '';
    nodes[id] = { type: 'text', props, children: [] };
    stats.textNodesExtracted++;
    return id;
  }

  // ── CONTAINER ELEMENTS: recurse into children ────────────────────────────
  // BUG 1 & 3 FIX: For container elements, process all children:
  // - Element children → recursive domNodeToStudio
  // - Text nodes (non-empty) → create text nodes
  const childIds: string[] = [];

  for (const child of Array.from(el.childNodes)) {
    // BUG 1 FIX: Handle text nodes (nodeType === 3)
    if (child.nodeType === 3 /* TEXT_NODE */) {
      const text = child.textContent?.trim() ?? '';
      if (text) {
        const textId = genId('text');
        nodes[textId] = {
          type: 'text',
          props: { tag: 'span', content: text },
          children: [],
        };
        childIds.push(textId);
        stats.textNodesExtracted++;
      }
      continue;
    }

    // Element children
    if (child.nodeType === 1 /* ELEMENT_NODE */) {
      const cid = domNodeToStudio(child as Element, nodes, stats, extractedColors);
      if (cid) childIds.push(cid);
    }
  }

  const { props: normalizedProps } = normalizeNodeProps(id, props, 'lenient', type);
  nodes[id] = { type, props: normalizedProps, children: childIds };
  return id;
}

/** Best-effort: parse static HTML into Studio Schema nodes */
export function htmlToJson(html: string): Schema {
  _nodeCounter = 0;
  const nodes: Record<string, SchemaNode> = {};
  const trimmedHtml = sanitizeImportedHtml(html).trim();

  if (!trimmedHtml) {
    return { version: '0.5', root: [], nodes };
  }

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmedHtml, 'text/html');
    normalizeImportedDocument(doc);
    const body = doc.body;
    
    // Extract external assets
    const links = uniqueExternalLinkConfigs(
      Array.from(doc.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]'))
        .map((link) => serializeExternalLinkConfig({
          href: link.getAttribute('href') ?? '',
          rel: link.getAttribute('rel') ?? 'stylesheet',
          crossorigin: link.getAttribute('crossorigin'),
        }))
        .filter(Boolean),
    );
    const styles = uniqueExternalStyles(
      Array.from(doc.querySelectorAll('style'))
        .map((style) => style.textContent?.trim() ?? '')
        .filter(Boolean),
    );

    // Smart Fallback: Auto-detect Material Symbols
    const hasSymbols = doc.querySelector('.material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp') !== null;
    const hasSymbolLink = links.some((link) => /Material\+Symbols/i.test(link.href));
    if (hasSymbols && !hasSymbolLink) {
      links.push({
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        rel: 'stylesheet',
        crossorigin: null,
      });
    }

    const childIds: string[] = [];
    const stats = { textNodesExtracted: 0 };

    const extractedColors = extractTailwindColors(html);
    const bodyClassRaw = body.getAttribute('class') ?? '';
    const bodyClass = resolveCustomClasses(bodyClassRaw, extractedColors);

    for (const child of Array.from(body.childNodes)) {
      if (child.nodeType === 3 /* TEXT_NODE */) {
        const text = (child as Text).textContent?.trim() ?? '';
        if (text) {
          const textId = genId('text');
          nodes[textId] = { type: 'text', props: { tag: 'p', content: text }, children: [] };
          childIds.push(textId);
          stats.textNodesExtracted++;
        }
        continue;
      }
      if (child.nodeType === 1 /* ELEMENT_NODE */) {
        const id = domNodeToStudio(child as Element, nodes, stats, extractedColors);
        if (id) childIds.push(id);
      }
    }

    const metadata = {
      name: 'Imported Layout',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      externalAssets: {
        links: links.length > 0 ? links.map((link) => serializeExternalLinkConfig(link)) : undefined,
        styles: styles.length > 0 ? styles : undefined,
      }
    };

    if (bodyClass && childIds.length > 0) {
      const bodyWrapperId = genId('div');
      nodes[bodyWrapperId] = {
        type: 'div',
        props: { className: bodyClass },
        children: childIds
      };
      return { version: '0.5', root: [bodyWrapperId], nodes, metadata };
    }

    return { version: '0.5', root: childIds, nodes, metadata };
  }

  const htmlId = genId('html-block');
  nodes[htmlId] = { type: 'customHtml', props: { html: trimmedHtml, className: '' }, children: [] };
  return { version: '0.5', root: [htmlId], nodes };
}

/**
 * Compute stats from a converted schema (call after htmlToJson / tsxToJson).
 * Exported so the dialog can display them.
 */
export function computeConversionStats(schema: Schema): ConversionStats {
  const nodeCount = Object.keys(schema.nodes).length;
  let emptyNodes = 0;
  let textNodesExtracted = 0;

  for (const [, node] of Object.entries(schema.nodes)) {
    if (node.type === 'text') textNodesExtracted++;
    
    // Consider nodes with visual properties (classes, backgrounds) as "not empty" 
    // to avoid false warnings on decorative elements like spacer divs, avatars, or progress bars.
    const hasContent =
      node.children.length > 0 ||
      node.props?.content ||
      node.props?.text ||
      node.props?.label ||
      node.props?.name ||
      node.props?.src ||
      node.props?.href ||
      node.props?.className ||
      node.props?.backgroundImage ||
      node.props?.backgroundColor;
      
    if (!hasContent) emptyNodes++;
  }

  return { nodeCount, emptyNodes, textNodesExtracted };
}

// ─── TSX → JSON ───────────────────────────────────────────────────────────────

// BUG 7 FIX: Known HTML tags to keep; PascalCase custom components get replaced with div
const KNOWN_HTML_TAGS = new Set([
  'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'img', 'input', 'textarea',
  'select', 'label', 'form', 'ul', 'ol', 'li', 'strong', 'em', 'small', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary', 'figure', 'figcaption',
  'Image', // Next.js Image → will be converted to img
]);

/**
 * Best-effort TSX → Studio JSON.
 * Strips React boilerplate, then passes the JSX body through htmlToJson
 * after converting JSX attribute syntax to HTML attributes.
 */
export function tsxToJson(tsx: string): Schema {
  // Extract JSX return body
  const returnMatch = tsx.match(/return\s*\(([\s\S]*?)\);\s*(?:}|$)/);
  const jsxBody = returnMatch ? returnMatch[1].trim() : tsx;

  // JSX → HTML attribute conversions
  let html = jsxBody
    .replace(/className=/g, 'class=')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // strip JSX comments

    // BUG 7 FIX: Replace PascalCase custom component tags (not in KNOWN_HTML_TAGS)
    // e.g. <MyComponent /> → <div />, <MyComponent> → <div>, </MyComponent> → </div>
    .replace(/<\/([A-Z][a-zA-Z0-9]*)\s*>/g, (_, name) => KNOWN_HTML_TAGS.has(name) ? `</${name}>` : '</div>')
    .replace(/<([A-Z][a-zA-Z0-9]*)(\s[^>]*)?\s*\/>/g, (_, name, attrs) => KNOWN_HTML_TAGS.has(name) ? `<${name}${attrs ?? ''} />` : '<div />')
    .replace(/<([A-Z][a-zA-Z0-9]*)(\s[^>]*)?>/g, (_, name, attrs) => KNOWN_HTML_TAGS.has(name) ? `<${name}${attrs ?? ''}>` : '<div>')

    // Handle JSX expressions
    .replace(/\{[^{}]+\}/g, (m) => {
      const inner = m.slice(1, -1).trim();
      // String literals → unwrap
      if (inner.startsWith('"') || inner.startsWith("'")) return inner.slice(1, -1);
      // Boolean/number → return as string
      if (/^(true|false|\d+(\.\d+)?)$/.test(inner)) return inner;
      // template literals → strip backtick
      if (inner.startsWith('`')) return inner.slice(1, inner.length - 1);
      return inner; // keep as-is for arbitrary expressions
    })

    .replace(/<Image\b/g, '<img')
    .replace(/<>/g, '<div>')
    .replace(/<\/>/g, '</div>');

  return htmlToJson(html);
}
