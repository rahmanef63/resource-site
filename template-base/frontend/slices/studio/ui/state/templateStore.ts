/**
 * Studio Template Store
 *
 * Built-in template schemas live in `./templates/*` and are loaded lazily
 * on demand so the main store stays small and the editor does not eagerly
 * hydrate every large schema up front.
 */

import {
  BUILTIN_TEMPLATE_KEYS,
  BUILTIN_TEMPLATE_REGISTRY,
} from './templates/registry';

type TemplateSchema = any;
type TemplateFactory = () => TemplateSchema;

const BUILTIN_TEMPLATE_CACHE = new Map<string, TemplateSchema>();
const BUILTIN_TEMPLATE_PENDING = new Map<string, Promise<TemplateSchema | null>>();

// ─────────────────────────────────────────────────────────────────────────────
// Layout normalization — auto-extracts Tailwind flex/grid layout classes
// into explicit inspector-visible props so the inspector accurately reflects
// the visual state of every template node.
// ─────────────────────────────────────────────────────────────────────────────

/** Check whether a className token list contains an exact class */
const hasClass = (tokens: string[], cls: string) => tokens.includes(cls);

/**
 * Extract Tailwind flex/grid layout classes from `className` and promote them
 * to explicit CSS props (display, flexDirection, alignItems, justifyContent,
 * flexWrap). Only fills props that aren't already explicitly set.
 *
 * Also fixes the historical mistake of writing `flexDirection: 'col'` (not
 * valid CSS — the correct value is `'column'`).
 */
function normalizeLayoutProps(props: Record<string, any>): Record<string, any> {
  const raw: string = props.className || '';
  const tokens = raw.split(/\s+/).filter(Boolean);
  const p = { ...props };

  // Fix `flexDirection: 'col'` → `'column'` (common typo from Tailwind shorthand)
  if (p.flexDirection === 'col') p.flexDirection = 'column';

  // display
  if (!p.display) {
    if (hasClass(tokens, 'flex') || hasClass(tokens, 'inline-flex')) {
      p.display = hasClass(tokens, 'inline-flex') ? 'inline-flex' : 'flex';
    } else if (hasClass(tokens, 'grid') || hasClass(tokens, 'inline-grid')) {
      p.display = hasClass(tokens, 'inline-grid') ? 'inline-grid' : 'grid';
    } else if (hasClass(tokens, 'hidden')) {
      p.display = 'none';
    } else if (hasClass(tokens, 'block')) {
      p.display = 'block';
    } else if (hasClass(tokens, 'inline-block')) {
      p.display = 'inline-block';
    }
  }

  // flexDirection
  if (!p.flexDirection) {
    if (hasClass(tokens, 'flex-row') || hasClass(tokens, 'flex-row-reverse')) {
      p.flexDirection = hasClass(tokens, 'flex-row-reverse') ? 'row-reverse' : 'row';
    } else if (hasClass(tokens, 'flex-col') || hasClass(tokens, 'flex-col-reverse')) {
      p.flexDirection = hasClass(tokens, 'flex-col-reverse') ? 'column-reverse' : 'column';
    }
  }

  // alignItems
  if (!p.alignItems) {
    if (hasClass(tokens, 'items-center')) p.alignItems = 'center';
    else if (hasClass(tokens, 'items-start')) p.alignItems = 'flex-start';
    else if (hasClass(tokens, 'items-end')) p.alignItems = 'flex-end';
    else if (hasClass(tokens, 'items-baseline')) p.alignItems = 'baseline';
    else if (hasClass(tokens, 'items-stretch')) p.alignItems = 'stretch';
  }

  // justifyContent
  if (!p.justifyContent) {
    if (hasClass(tokens, 'justify-between')) p.justifyContent = 'space-between';
    else if (hasClass(tokens, 'justify-center')) p.justifyContent = 'center';
    else if (hasClass(tokens, 'justify-start')) p.justifyContent = 'flex-start';
    else if (hasClass(tokens, 'justify-end')) p.justifyContent = 'flex-end';
    else if (hasClass(tokens, 'justify-around')) p.justifyContent = 'space-around';
    else if (hasClass(tokens, 'justify-evenly')) p.justifyContent = 'space-evenly';
  }

  // flexWrap
  if (!p.flexWrap) {
    if (hasClass(tokens, 'flex-wrap')) p.flexWrap = 'wrap';
    else if (hasClass(tokens, 'flex-wrap-reverse')) p.flexWrap = 'wrap-reverse';
    else if (hasClass(tokens, 'flex-nowrap')) p.flexWrap = 'nowrap';
  }

  return p;
}

/**
 * Walk every node in a template schema and normalize layout props.
 * This is idempotent — running it twice gives the same result.
 */
function normalizeTemplateSchema(schema: TemplateSchema): TemplateSchema {
  if (!schema?.nodes) return schema;
  const nodes: Record<string, any> = {};
  for (const [id, node] of Object.entries<any>(schema.nodes)) {
    nodes[id] = { ...node, props: normalizeLayoutProps(node.props || {}) };
  }
  return { ...schema, nodes };
}

function instantiateFactory(factory: TemplateFactory | undefined): TemplateSchema | null {
  return factory ? normalizeTemplateSchema(factory()) : null;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function loadBuiltinTemplate(name: string): Promise<TemplateSchema | null> {
  const cached = BUILTIN_TEMPLATE_CACHE.get(name);
  if (cached) return cached;

  const pending = BUILTIN_TEMPLATE_PENDING.get(name);
  if (pending) return pending;

  const loader = BUILTIN_TEMPLATE_REGISTRY[name];
  if (!loader) return null;

  const next = loader()
    .then((module) => {
      const schema = instantiateFactory(module.default);
      if (schema) {
        BUILTIN_TEMPLATE_CACHE.set(name, schema);
      }
      return schema;
    })
    .catch((error) => {
      console.error(`[Studio] Failed to load builtin template "${name}"`, error);
      return null;
    })
    .finally(() => {
      BUILTIN_TEMPLATE_PENDING.delete(name);
    });

  BUILTIN_TEMPLATE_PENDING.set(name, next);
  return next;
}

function readAssetTemplate(name: string): TemplateSchema | null {
  const all = listAssetTemplates();
  return all[name] ? normalizeTemplateSchema(all[name]) : null;
}

function splitTemplateKey(key: string) {
  if (key.startsWith('builtin:')) {
    return { source: 'builtin' as const, name: key.slice('builtin:'.length) };
  }

  if (key.startsWith('asset:')) {
    return { source: 'asset' as const, name: key.slice('asset:'.length) };
  }

  return { source: 'unknown' as const, name: key };
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────

const ASSET_KEY = 'cms-asset-templates';

export function getDefaultTemplates() {
  return { ...BUILTIN_TEMPLATE_REGISTRY };
}

export function getBuiltinTemplateKeys() {
  return [...BUILTIN_TEMPLATE_KEYS];
}

export function isBuiltinKey(key: string) {
  return !!BUILTIN_TEMPLATE_REGISTRY[key];
}

export function getCachedBuiltinTemplate(name: string) {
  return BUILTIN_TEMPLATE_CACHE.get(name) ?? null;
}

export function getCachedTemplateByKey(key: string) {
  const parsed = splitTemplateKey(key);

  if (parsed.source === 'builtin') {
    return getCachedBuiltinTemplate(parsed.name);
  }

  if (parsed.source === 'asset') {
    return readAssetTemplate(parsed.name);
  }

  return getCachedBuiltinTemplate(parsed.name) || readAssetTemplate(parsed.name);
}

export async function instantiateDefaultTemplate(key: string) {
  return loadBuiltinTemplate(key);
}

export async function preloadBuiltinTemplates(keys: string[] = BUILTIN_TEMPLATE_KEYS) {
  return Promise.all(keys.map((key) => loadBuiltinTemplate(key)));
}

export async function preloadTemplateByKey(key: string) {
  const parsed = splitTemplateKey(key);

  if (parsed.source === 'builtin') {
    return loadBuiltinTemplate(parsed.name);
  }

  if (parsed.source === 'asset') {
    return readAssetTemplate(parsed.name);
  }

  return loadBuiltinTemplate(parsed.name).then((schema) => schema || readAssetTemplate(parsed.name));
}

export function listAssetTemplates(): Record<string, any> {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(ASSET_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function saveAssetTemplate(name: string, schema: any) {
  const storage = getStorage();
  if (!storage) return;

  const all = listAssetTemplates();
  all[name] = schema;
  storage.setItem(ASSET_KEY, JSON.stringify(all));
}

export function deleteAssetTemplate(name: string) {
  const storage = getStorage();
  if (!storage) return;

  const all = listAssetTemplates();
  delete all[name];
  storage.setItem(ASSET_KEY, JSON.stringify(all));
}

export async function getTemplateByKey(key: string) {
  const parsed = splitTemplateKey(key);

  if (parsed.source === 'builtin') {
    return loadBuiltinTemplate(parsed.name);
  }

  if (parsed.source === 'asset') {
    return readAssetTemplate(parsed.name);
  }

  return loadBuiltinTemplate(parsed.name).then((schema) => schema || readAssetTemplate(parsed.name));
}
