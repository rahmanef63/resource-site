import React, { useMemo, useCallback, useEffect, useState } from 'react';
import type { Schema, Workspace } from '@/frontend/slices/studio/ui/types';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';
import { cn } from '@/lib/utils';
import { getCachedTemplateByKey, preloadTemplateByKey } from '@/frontend/slices/studio/ui/state/templateStore';
import { AnimationWrapper } from '@/frontend/slices/studio/ui/lib/animations';
import { studioErrorLog } from '@/frontend/slices/studio/ui/lib/studioErrorLog';

interface RendererProps {
  schema: Schema;
  activeWs: Workspace;
  onChangeWs: (workspace: Workspace) => void;
  activeRoute: string;
  onNavigate: (path: string) => void;
  commands: {
    newWorkspace: () => void;
    newMenu: () => void;
    newPage: () => void;
  };
  menuOverride: string | null;
  setMenuOverride: (id: string | null) => void;
  onSelectNode: (id: string) => void;
  selectedId: string | null;
  designMode?: boolean;

  // New: allow rendering a subtree starting from this node id (no nav aside when set)
  rootId?: string | null;
}

export interface ResolveRendererRootIdInput {
  schema: Schema;
  activeWs: Workspace;
  activeRoute: string;
  menuOverride?: string | null;
  rootId?: string | null;
}

// ─── Tailwind token → CSS value maps ────────────────────────────────────────
// DynamicInspector writes Tailwind shorthand tokens for some fields.
// We convert them to real CSS so inline styles work correctly.
const TW_FONT_SIZE: Record<string, string> = {
  xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
  xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
};
const TW_BORDER_RADIUS: Record<string, string> = {
  none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem',
  xl: '0.75rem', '2xl': '1rem', full: '9999px',
};
const TW_BOX_SHADOW: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0/0.05)',
  md: '0 4px 6px -1px rgb(0 0 0/0.1),0 2px 4px -2px rgb(0 0 0/0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0/0.1),0 4px 6px -4px rgb(0 0 0/0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0/0.1),0 8px 10px -6px rgb(0 0 0/0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0/0.25)',
};

// Sentinel values that should not be emitted as CSS
const SKIP_SENTINELS = new Set(['Default', 'default', 'Regular', 'none', '', undefined, null]);

// Only apply gap as CSS if it has units or is '0'
const isGapCss = (v: any) => v === '0' || (typeof v === 'string' && /\d+(px|rem|em|%|vw|vh)/.test(v));
const isDecoratableElement = (node: React.ReactNode): node is React.ReactElement<any> => (
  React.isValidElement(node) && node.type !== React.Fragment
);

/**
 * Convert inspector-controlled props to inline CSS style.
 * Applies styles DIRECTLY to the widget's root element (via React.cloneElement),
 * so inline styles correctly override any Tailwind classes on that element.
 *
 * Tailwind shorthand tokens (e.g. fontSize: 'lg', borderRadius: 'md') are
 * mapped to real CSS values before application.
 */
function propsToStyle(p: Record<string, any>): React.CSSProperties {
  const s: React.CSSProperties = {};
  const v = (val: any) => !SKIP_SENTINELS.has(val);

  // Typography (color/font)
  if (v(p.color)) s.color = p.color;
  if (v(p.backgroundColor)) s.backgroundColor = p.backgroundColor;
  if (v(p.fontFamily)) s.fontFamily = p.fontFamily;
  if (v(p.fontSize)) s.fontSize = TW_FONT_SIZE[p.fontSize] ?? p.fontSize;
  if (v(p.fontWeight) && !isNaN(Number(p.fontWeight))) s.fontWeight = p.fontWeight;
  if (v(p.lineHeight)) s.lineHeight = p.lineHeight;
  if (v(p.letterSpacing)) s.letterSpacing = p.letterSpacing;
  if (v(p.textAlign)) s.textAlign = p.textAlign as any;
  if (v(p.textDecoration) && p.textDecoration !== 'none') s.textDecoration = p.textDecoration;

  // Dimensions
  if (v(p.width) && p.width !== 'auto') s.width = p.width;
  if (v(p.height) && p.height !== 'auto') s.height = p.height;
  if (v(p.minWidth)) s.minWidth = p.minWidth;
  if (v(p.minHeight)) s.minHeight = p.minHeight;
  if (v(p.maxWidth) && p.maxWidth !== 'none') s.maxWidth = p.maxWidth;
  if (v(p.maxHeight)) s.maxHeight = p.maxHeight;

  // Display & Flex/Grid layout
  // Skip 'block' — it is the browser default for div/section/etc.
  // Applying it as inline style would override any 'flex'/'grid' Tailwind
  // class written in the node's `className` prop.
  if (v(p.display) && p.display !== 'block') s.display = p.display as any;
  if (v(p.flexDirection)) s.flexDirection = p.flexDirection as any;
  if (v(p.flexWrap)) s.flexWrap = p.flexWrap as any;
  if (v(p.alignItems)) s.alignItems = p.alignItems as any;
  if (v(p.justifyContent)) s.justifyContent = p.justifyContent as any;
  if (isGapCss(p.gap)) s.gap = p.gap;

  // Spacing (individual sides — written by DynamicInspector layout section)
  if (v(p.paddingTop) && p.paddingTop !== '0px') s.paddingTop = p.paddingTop;
  if (v(p.paddingBottom) && p.paddingBottom !== '0px') s.paddingBottom = p.paddingBottom;
  if (v(p.paddingLeft) && p.paddingLeft !== '0px') s.paddingLeft = p.paddingLeft;
  if (v(p.paddingRight) && p.paddingRight !== '0px') s.paddingRight = p.paddingRight;
  if (v(p.marginTop) && p.marginTop !== '0px') s.marginTop = p.marginTop;
  if (v(p.marginBottom) && p.marginBottom !== '0px') s.marginBottom = p.marginBottom;
  if (v(p.marginLeft) && p.marginLeft !== '0px') s.marginLeft = p.marginLeft;
  if (v(p.marginRight) && p.marginRight !== '0px') s.marginRight = p.marginRight;

  // Border
  if (v(p.borderStyle) && p.borderStyle !== 'Default') s.borderStyle = p.borderStyle as any;
  if (v(p.borderColor) && !['Default', 'default'].includes(p.borderColor)) s.borderColor = p.borderColor;
  if (v(p.borderWidth) && p.borderWidth !== '0px') s.borderWidth = p.borderWidth;
  if (v(p.borderRadius) && p.borderRadius !== 'Default') {
    s.borderRadius = TW_BORDER_RADIUS[p.borderRadius] ?? p.borderRadius;
  }

  // Appearance
  if (v(p.boxShadow) && p.boxShadow !== 'Default') {
    s.boxShadow = TW_BOX_SHADOW[p.boxShadow] ?? p.boxShadow;
  }
  if (p.opacity !== undefined && p.opacity !== '' && p.opacity !== '100') {
    s.opacity = Number(p.opacity) / 100;
  }
  if (v(p.overflow)) s.overflow = p.overflow as any;
  if (v(p.overflowX)) s.overflowX = p.overflowX as any;
  if (v(p.overflowY)) s.overflowY = p.overflowY as any;

  // Position
  if (v(p.position) && p.position !== 'static') s.position = p.position as any;
  if (v(p.zIndex)) s.zIndex = Number(p.zIndex);
  if (v(p.top)) s.top = p.top;
  if (v(p.right)) s.right = p.right;
  if (v(p.bottom)) s.bottom = p.bottom;
  if (v(p.left)) s.left = p.left;

  // Misc
  if (v(p.cursor)) s.cursor = p.cursor;
  if (v(p.pointerEvents)) s.pointerEvents = p.pointerEvents as any;
  if (v(p.userSelect)) s.userSelect = p.userSelect as any;
  if (v(p.visibility)) s.visibility = p.visibility as any;
  if (v(p.transition)) s.transition = p.transition;
  if (v(p.transform)) s.transform = p.transform;
  if (v(p.objectFit)) s.objectFit = p.objectFit as any;
  if (v(p.objectPosition)) s.objectPosition = p.objectPosition;
  if (v(p.whiteSpace)) s.whiteSpace = p.whiteSpace as any;
  if (v(p.textOverflow)) s.textOverflow = p.textOverflow as any;
  if (v(p.wordBreak)) s.wordBreak = p.wordBreak as any;
  if (v(p.gridTemplateColumns)) s.gridTemplateColumns = p.gridTemplateColumns;
  if (v(p.gridTemplateRows)) s.gridTemplateRows = p.gridTemplateRows;
  if (v(p.gridColumn)) s.gridColumn = p.gridColumn;
  if (v(p.gridRow)) s.gridRow = p.gridRow;
  return s;
}

// Internal Error Boundary — shown in canvas when a widget crashes during render
class WidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; id: string },
  { hasError: boolean; message: string; copied: boolean }
> {
  constructor(props: { children: React.ReactNode; id: string }) {
    super(props);
    this.state = { hasError: false, message: '', copied: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message ?? String(error) };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(`[Studio] Widget "${this.props.id}" render error:`, error, errorInfo);
    studioErrorLog.push(this.props.id, error);
  }

  handleCopy = () => {
    const text = `[Studio Error] node "${this.props.id}": ${this.state.message}`;
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col gap-1 p-2 border-2 border-red-500 bg-red-950/40 rounded text-xs text-red-300 ring-2 ring-red-500/40">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-red-400 truncate">⚠ Widget error: <code className="font-mono opacity-80">{this.props.id}</code></span>
            <button
              onClick={this.handleCopy}
              className="shrink-0 px-1.5 py-0.5 rounded bg-red-800/60 hover:bg-red-700/60 text-[10px] text-red-200 transition-colors"
            >
              {this.state.copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          </div>
          <p className="text-[11px] text-red-400/80 font-mono truncate">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="self-start text-[10px] underline text-red-400/60 hover:text-red-300"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function resolveRendererRootId({
  schema,
  activeWs,
  activeRoute,
  menuOverride = null,
  rootId = null,
}: ResolveRendererRootIdInput): string | null {
  if (rootId) return rootId;

  const byId = schema.nodes ?? {};
  const getChildren = (id: string): string[] => (byId[id]?.children || []).slice();
  const nodeType = (id: string): string | undefined => byId[id]?.type;
  const nodeProps = (id: string): Record<string, any> => byId[id]?.props ?? {};

  const workspaces = Object.keys(byId)
    .filter((id) => nodeType(id) === "navNode" && nodeProps(id).kind === "workspace")
    .map((id) => {
      const props = nodeProps(id);
      return {
        id,
        category: typeof props.category === "string" ? props.category : "personal",
        key: typeof props.key === "string" ? props.key : "",
      };
    });

  const activeWsIds = workspaces
    .filter((workspace) => (
      (workspace.category || "personal") === (activeWs.category || "personal") &&
      (workspace.key || "") === (activeWs.key || "")
    ))
    .map((workspace) => workspace.id);

  const navGroupsByPlacement = (placement: string) =>
    Object.keys(byId).filter((id) => (
      nodeType(id) === "navGroup" &&
      (nodeProps(id).placement || "sidebar") === placement
    ));

  const menus = Object.keys(byId).filter((id) => (
    nodeType(id) === "navNode" && nodeProps(id).kind === "menu"
  ));

  const pickMenuForPlacement = (placement: string) => {
    if (placement === "sidebar" && menuOverride) return menuOverride;

    const attached = menus.find((id) => {
      const props = nodeProps(id);
      return props.attachWorkspaceRef && activeWsIds.includes(props.attachWorkspaceRef);
    });
    if (attached) return attached;

    for (const navGroupId of navGroupsByPlacement(placement)) {
      const menuId = getChildren(navGroupId).find((childId) => (
        nodeType(childId) === "navNode" && nodeProps(childId).kind === "menu"
      ));
      if (menuId) return menuId;
    }

    return menus[0] || null;
  };

  const menuForSidebar = pickMenuForPlacement("sidebar");

  const pageCandidates = menuForSidebar
    ? getChildren(menuForSidebar).filter((childId) => {
        const type = nodeType(childId);
        return type === "container" || type === "section" || type === "div";
      })
    : Object.keys(byId).filter((id) => {
        const type = nodeType(id);
        return (type === "container" || type === "section" || type === "div") && byId[id]?.props?.path;
      });

  const normalizedRoute = (activeRoute || "").replace(/\/*$/, "");
  const matchedPageId = pageCandidates.find((id) => {
    const path = typeof byId[id]?.props?.path === "string" ? byId[id].props.path : "/";
    return path.replace(/\/*$/, "") === normalizedRoute;
  });

  return matchedPageId || pageCandidates[0] || schema.root?.[0] || null;
}

export const Renderer: React.FC<RendererProps> = ({
  schema,
  activeWs,
  onChangeWs,
  activeRoute,
  onNavigate,
  commands,
  menuOverride,
  setMenuOverride,
  onSelectNode,
  selectedId,
  designMode = true,
  rootId = null,
}) => {
  const byId = schema.nodes;
  const [templateSchemas, setTemplateSchemas] = useState<Record<string, Schema | null>>({});
  const getChildren = (id: string): string[] => (byId[id]?.children || []).slice();
  const nodeType = (id: string): string | undefined => byId[id]?.type;
  const nodeProps = (id: string): Record<string, any> => {
    const type = byId[id]?.type;
    const props = {
      ...getWidgetConfig(type)?.defaults,
      ...(byId[id]?.props || {}),
    } as Record<string, any>;

    if (type === "text") {
      if ((props.content === undefined || props.content === null || props.content === "") && typeof props.text === "string") {
        props.content = props.text;
      }
      if ((props.color === undefined || props.color === null || props.color === "") && typeof props.backgroundColor === "string" && props.backgroundColor.trim()) {
        props.color = props.backgroundColor;
        delete props.backgroundColor;
      }
    }

    if (type === "link") {
      if ((props.text === undefined || props.text === null || props.text === "") && typeof props.label === "string") {
        props.text = props.label;
      }
    }

    return props;
  };

  // Memoized so widget render() functions get a stable reference — prevents
  // unnecessary re-renders of memoised widgets on every schema keystroke.
  const helpers = useMemo(() => ({
    getText: (id: string) => (id && byId[id] && byId[id].type === "text" ? nodeProps(id).content : null),
    getImage: (id: string) => (id && byId[id] && byId[id].type === "image" ? { src: nodeProps(id).src, alt: nodeProps(id).alt } : null),
  }), [byId]); // eslint-disable-line react-hooks/exhaustive-deps

  const workspaces = useMemo(() => {
    return Object.keys(byId)
      .filter((id) => byId[id].type === "navNode" && byId[id].props?.kind === "workspace")
      .map((id) => {
        const props = nodeProps(id);
        return {
          id,
          category: typeof props.category === "string" ? props.category : "personal",
          key: typeof props.key === "string" ? props.key : "",
        };
      });
  }, [byId]);

  const activeWsIds = useMemo(() => workspaces
    .filter((w) => (w.category || "personal") === (activeWs.category || "personal") && (w.key || "") === (activeWs.key || ""))
    .map((w) => w.id), [workspaces, activeWs]);

  const navGroupsByPlacement = (placement: string) => Object.keys(byId).filter((id) => byId[id].type === "navGroup" && (byId[id].props?.placement || "sidebar") === placement);

  const menus = useMemo(() => Object.keys(byId).filter((id) => (byId[id].type === "navNode" && byId[id].props?.kind === "menu")), [byId]);

  const pickMenuForPlacement = useCallback((placement: string) => {
    if (placement === "sidebar" && menuOverride) return menuOverride;
    const attached = menus.find((id) => {
      const p = nodeProps(id);
      return p.attachWorkspaceRef && activeWsIds.includes(p.attachWorkspaceRef);
    });
    if (attached) return attached;
    for (const ng of navGroupsByPlacement(placement)) {
      const m = getChildren(ng).find(
        (cid: string) => nodeType(cid) === "navNode" && nodeProps(cid).kind === "menu"
      );
      if (m) return m;
    }
    return menus[0] || null;
  }, [menus, menuOverride, activeWsIds, byId]);

  const menuForSidebar = useMemo(() => pickMenuForPlacement("sidebar"), [pickMenuForPlacement]);

  const templateRefKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const node of Object.values<any>(byId)) {
      if (node?.type === 'templateRef' && typeof node?.props?.tplKey === 'string' && node.props.tplKey) {
        keys.add(node.props.tplKey);
      }
    }
    return Array.from(keys);
  }, [byId]);

  useEffect(() => {
    if (templateRefKeys.length === 0) return;

    let cancelled = false;
    const cachedEntries = templateRefKeys.map((key) => [key, getCachedTemplateByKey(key) as Schema | null] as const);

    setTemplateSchemas((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const [key, cachedSchema] of cachedEntries) {
        if (cachedSchema && prev[key] !== cachedSchema) {
          next[key] = cachedSchema;
          changed = true;
        }
      }

      return changed ? next : prev;
    });

    const missingKeys = templateRefKeys.filter((key) => !getCachedTemplateByKey(key));
    if (missingKeys.length === 0) return;

    Promise.all(
      missingKeys.map(async (key) => [key, await preloadTemplateByKey(key)] as const)
    ).then((entries) => {
      if (cancelled) return;

      setTemplateSchemas((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const [key, loadedSchema] of entries) {
          if (prev[key] !== loadedSchema) {
            next[key] = loadedSchema as Schema | null;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [templateRefKeys]);

  const matchesVisibility = useCallback((p: any) => {
    if (!p) return true;
    if (p.isStatic) return true;
    const vis = p.visibility || "global";
    if (vis === "global") return true;
    if (vis === "workspace" || vis === "subworkspace") {
      if (p.parentKind === "workspace" && p.parentRef) return activeWsIds.includes(p.parentRef);
      return true;
    }
    return true;
  }, [activeWsIds]);

  const collectMenuItems = useCallback((menuId: string | null) => {
    if (!menuId) return [];
    const topChildren = getChildren(menuId).filter(
      (cid: string) => nodeType(cid) === "navNode" && nodeProps(cid).kind === "item"
    );
    const extraFromWs = Object.keys(byId).filter((id: string) =>
      byId[id].type === "navNode" &&
      byId[id].props?.kind === "item" &&
      byId[id].props?.parentKind === "workspace" &&
      activeWsIds.includes(byId[id].props?.parentRef)
    );
    const initial = [...topChildren, ...extraFromWs];
    const seen = new Set<string>();
    return initial
      .filter((id: string) => {
        const ok = !seen.has(id);
        seen.add(id);
        return ok;
      })
      .filter((id: string) => matchesVisibility(nodeProps(id)));
  }, [byId, activeWsIds, matchesVisibility]);

  // Updated to look for both container and section widgets with path property
  const pageCandidates = useMemo(() => {
    const fromMenu = menuForSidebar ? getChildren(menuForSidebar).filter((cid: string) => {
      const type = nodeType(cid);
      return type === "container" || type === "section" || type === "div";
    }) : [];

    if (fromMenu.length > 0) return fromMenu;

    // Look for any container / section / div widgets with EXPLICITLY set path property.
    // Must use byId[id].props.path directly — nodeProps() merges widget defaults which
    // includes sectionManifest.defaults.path = "/" causing false positives.
    return Object.keys(byId).filter((id: string) => {
      const type = byId[id].type;
      return (type === "container" || type === "section" || type === "div") && byId[id]?.props?.path;
    });
  }, [byId, menuForSidebar]);

  const activePageId = useMemo(() => {
    if (rootId) return rootId; // render subtree
    const normalized = (activeRoute || "").replace(/\/*$/, "");
    const found = pageCandidates.find((id) => (nodeProps(id).path || "/").replace(/\/*$/, "") === normalized);
    // Fall back to schema.root[0] so imported HTML layouts (no path properties)
    // still render the full tree from the intended root node.
    return found || pageCandidates[0] || schema.root?.[0] || null;
  }, [activeRoute, pageCandidates, byId, rootId]);

  const renderContentNode = (id: string, visited: Set<string> = new Set()): React.ReactNode => {
    if (visited.has(id)) {
      return (
        <div key={id} className="p-2 border border-yellow-500/50 bg-yellow-500/10 rounded text-xs text-yellow-600 mb-2">
          ⚠ Cycle Detected (ID: {id})
        </div>
      );
    }
    const newVisited = new Set(visited).add(id);

    const n = byId[id];
    if (!n) return null;
    const t = n.type;
    const p = nodeProps(id);

    // Support template instance rendering
    if (t === 'templateRef') {
      const tplKey = p.tplKey as string;
      if (!tplKey) return null;
      const hasResolvedTemplate = Object.prototype.hasOwnProperty.call(templateSchemas, tplKey);
      const tplSchema = templateSchemas[tplKey] ?? getCachedTemplateByKey(tplKey);

      if (!tplSchema) {
        if (!designMode) return null;

        return (
          <div
            key={id}
            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 p-3 text-xs text-zinc-400"
            data-studio-node-id={id}
          >
            {hasResolvedTemplate
              ? `Template "${tplKey}" could not be loaded.`
              : `Loading template "${tplKey}"...`}
          </div>
        );
      }

      const roots = tplSchema.root;
      return (
        <div key={id} className="space-y-2">
          {roots.map((rid: string) => (
            <div key={`${tplKey}-${rid}`}>
              {/* render each root of template schema */}
              {renderTemplateNode(tplSchema, rid, newVisited)}
            </div>
          ))}
        </div>
      );
    }

    const children = (n.children || []).map((cid: string) => renderContentNode(cid, newVisited));
    const config = getWidgetConfig(t);
    const renderer = config?.render;

    // Unknown node type → render as a custom block placeholder so templates/imports never silently disappear
    if (!renderer) {
      if (!designMode) return null;
      return (
        <WidgetErrorBoundary key={id} id={id}>
          <div
            className="relative group border-2 border-dashed border-purple-500/50 bg-purple-950/20 rounded-lg p-3 text-xs"
            onClick={(e) => { e.stopPropagation(); onSelectNode?.(id); }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-purple-400">⬡ Custom Block: <code className="font-mono text-purple-300">{t}</code></span>
              <span className="text-purple-500/60 text-[10px]">id: {id}</span>
            </div>
            {Object.keys(p).length > 0 && (
              <pre className="text-[10px] text-purple-300/70 overflow-hidden max-h-24 leading-tight">
                {JSON.stringify(p, null, 2)}
              </pre>
            )}
            {children && <div className="mt-2 border-t border-purple-500/20 pt-2 space-y-1">{children}</div>}
          </div>
        </WidgetErrorBoundary>
      );
    }

    try {
      const body = renderer(p, children, { ...helpers });
      const selectable = designMode;
      const overrideStyle = propsToStyle(p);
      const selectionClassName = selectable && selectedId === id
        ? "ring-2 ring-blue-500 ring-offset-2 rounded-xl"
        : undefined;

      let enhancedBody: React.ReactNode = body;
      if (isDecoratableElement(body)) {
        const decoratableBody = body as React.ReactElement<any>;
        const existingProps = (decoratableBody.props ?? {}) as Record<string, any>;
        const existingOnClick = typeof existingProps.onClick === 'function'
          ? existingProps.onClick
          : undefined;

        enhancedBody = React.cloneElement(decoratableBody, {
          className: cn(existingProps.className, "relative group", selectionClassName),
          style: { ...(existingProps.style ?? {}), ...overrideStyle },
          'data-studio-node-id': id,
          'data-studio-node-type': t,
          onClick: (e: React.MouseEvent) => {
            existingOnClick?.(e);
            if (!selectable || e.defaultPrevented) return;
            e.stopPropagation();
            onSelectNode?.(id);
          },
        });
      }

      // Wrap with Framer Motion animation when `animation` prop is set
      const animatedBody = p.animation && p.animation !== 'none' && !designMode ? (
        <AnimationWrapper
          animation={p.animation}
          animationDelay={Number(p.animationDelay) || 0}
          animationDuration={Number(p.animationDuration) || 0.5}
          animationEasing={p.animationEasing || 'easeOut'}
          animationOnce={p.animationOnce !== false}
        >
          {enhancedBody}
        </AnimationWrapper>
      ) : enhancedBody;

      const wrapperClickHandler = selectable
        ? (e: React.MouseEvent) => {
          e.stopPropagation();
          onSelectNode?.(id);
        }
        : undefined;

      return (
        <WidgetErrorBoundary key={id} id={id}>
          {isDecoratableElement(animatedBody) ? animatedBody : (
            <div
              data-studio-node-id={id}
              data-studio-node-type={t}
              className="contents"
              onClick={wrapperClickHandler}
            >
              {animatedBody}
            </div>
          )}
        </WidgetErrorBoundary>
      );
    } catch (err: any) {
      console.error(`[Studio] Widget "${id}" sync render error:`, err);
      return (
        <div key={id} className="flex items-center justify-between gap-2 p-2 border-2 border-red-500 bg-red-950/40 rounded text-xs text-red-300">
          <span>⚠ <code className="font-mono">{id}</code> — {err?.message ?? 'render error'}</span>
        </div>
      );
    }
  };

  const renderTemplateNode = (templateSchema: Schema, id: string, visited: Set<string> = new Set()): React.ReactNode => {
    if (visited.has(id)) {
      return <div key={id} className="text-xs text-yellow-500">Cycle in template {id}</div>;
    }
    const newVisited = new Set(visited).add(id);

    const n = templateSchema.nodes[id];
    if (!n) return null;
    const cfg = getWidgetConfig(n.type);
    const p = { ...(cfg?.defaults || {}), ...(n.props || {}) };
    const children = (n.children || []).map((cid: string) =>
      renderTemplateNode(templateSchema, cid, newVisited)
    );
    const renderer = cfg?.render;
    if (!renderer) {
      // Custom block fallback for unknown types in template schemas
      return (
        <div key={id} className="border border-dashed border-purple-500/40 bg-purple-950/10 rounded p-2 text-xs text-purple-400">
          ⬡ <code>{n.type}</code>
          {children}
        </div>
      );
    }
    return renderer(p, children, helpers);
  };

  // Render — the root node's className/style fully defines its own layout.
  // No max-width or padding wrapper here so templates can go full-bleed.
  const emptyHint = rootId
    ? <div className="text-sm text-muted-foreground p-4">Nothing to render.</div>
    : (
      <div className="text-sm text-muted-foreground p-6">
        Add a <b>Section</b> with a <b>path</b> property and connect it from a <b>Menu</b> to see the preview.
      </div>
    );

  // Head Asset Injection
  useEffect(() => {
    const head = document.head;
    const injectedElements: (HTMLLinkElement | HTMLStyleElement)[] = [];

    // 1. Inject Links (Deduplicated)
    const uniqueLinkConfigs = Array.from(new Set(schema.metadata?.externalAssets?.links || []));
    uniqueLinkConfigs.forEach(l => {
      try {
        const config = JSON.parse(l);
        const link = document.createElement('link');
        link.href = config.href;
        link.rel = config.rel || 'stylesheet';
        if (config.crossorigin) link.setAttribute('crossorigin', config.crossorigin);
        link.dataset.studioAsset = 'true';
        head.appendChild(link);
        injectedElements.push(link);
      } catch {
        const link = document.createElement('link');
        link.href = l;
        link.rel = 'stylesheet';
        link.dataset.studioAsset = 'true';
        head.appendChild(link);
        injectedElements.push(link);
      }
    });

    // 2. Inject Styles (Deduplicated)
    const uniqueStyles = Array.from(new Set(schema.metadata?.externalAssets?.styles || []));
    uniqueStyles.forEach(css => {
      const style = document.createElement('style');
      style.textContent = css;
      style.dataset.studioAsset = 'true';
      head.appendChild(style);
      injectedElements.push(style);
    });

    // 3. Always inject Material Symbols Core CSS for robustness
    const symbolsCss = `
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
        font-feature-settings: 'liga';
      }
      .material-symbols-outlined { font-family: 'Material Symbols Outlined' !important; }
      .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; }
      .material-symbols-sharp { font-family: 'Material Symbols Sharp' !important; }
    `;
    const coreStyle = document.createElement('style');
    coreStyle.textContent = symbolsCss;
    coreStyle.dataset.studioAsset = 'core-symbols';
    head.appendChild(coreStyle);
    injectedElements.push(coreStyle);

    return () => {
      injectedElements.forEach(el => {
        if (el.parentNode === head) {
          head.removeChild(el);
        }
      });
    };
  }, [schema.metadata?.externalAssets?.links, schema.metadata?.externalAssets?.styles]);

  return (
    <div className="w-full h-full overflow-y-auto">
      {activePageId ? renderContentNode(activePageId) : emptyHint}
    </div>
  );
};
