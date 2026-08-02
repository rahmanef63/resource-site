/**
 * ⚠️ TECHNICAL DEBT NOTICE ⚠️
 *
 * This file currently has CMS feature coupling that needs to be addressed.
 * Despite being in `frontend/shared/`, it imports from `frontend/slices/cms/`.
 *
 * CURRENT COUPLING (lines 13-16):
 * - INITIAL_CMS_SCHEMA from cms/mockdata
 * - getWidgetConfig from cms/shared/registry
 * - CMSNode, CMSEdge, etc. types from cms/shared/types
 *
 * WHY THIS EXISTS:
 * SharedCanvasProvider was designed specifically for CMS use case and later
 * moved to shared folder to enable reuse. However, the core logic is still
 * tightly coupled to CMS data structures and widget registry.
 *
 * MIGRATION PLAN:
 * 1. Extract generic canvas types (Node, Edge, Schema) from CMS types
 * 2. Create CanvasConfigProvider interface for dependency injection
 * 3. Make INITIAL_SCHEMA and widgetConfigGetter optional props
 * 4. Move CMS-specific logic to CMSCanvasProvider wrapper
 *
 * FUTURE USAGE (after migration):
 * ```tsx
 * // Generic canvas
 * <SharedCanvasProvider
 *   initialSchema={mySchema}
 *   widgetConfigGetter={myConfigGetter}
 * >
 *   {children}
 * </SharedCanvasProvider>
 *
 * // CMS canvas (wrapper)
 * <CMSCanvasProvider>
 *   {children}
 * </CMSCanvasProvider>
 * ```
 *
 * ESTIMATED EFFORT: 1-2 days for full decoupling
 * PRIORITY: Medium (works fine for now, but limits reusability)
 *
 * See also:
 * - docs/architecture/shared-system-decoupling.md
 * - GitHub Issue #XXX: Decouple SharedCanvasProvider from CMS
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { addEdge, useNodesState, useEdgesState } from 'reactflow';
import type { Node, Edge, OnConnect, ReactFlowInstance } from 'reactflow';

// Builder foundation hooks (canonical location: shared/builder/hooks)
import {
  useBuilderHistory,
  useBuilderKeyboardShortcuts,
  type HistorySnapshot,
} from '@/frontend/shared/builder/hooks/useBuilderHistory';
import {
  useBuilderClipboard,
  useBuilderClipboardShortcuts,
} from '@/frontend/shared/builder/hooks/useBuilderClipboard';

// Import from builder feature (restored from archived CMS)
import { uid, clamp } from '@/lib/utils';

// Generic types - kept local to avoid coupling to studio
export interface CMSNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { comp: string; props: Record<string, any> };
}

export interface CMSEdge {
  id: string;
  source: string;
  target: string;
  data?: { order?: number };
  animated?: boolean;
}

export interface Schema {
  version: string;
  root: string[];
  nodes: Record<string, { type: string; props: Record<string, any>; children: string[] }>;
  metadata?: Record<string, any>;
}

export interface Workspace {
  category: string;
  key: string;
}

/** Recursive tree node for block explode decomposition (mirrors studio WidgetNode) */
interface WidgetNode {
  type: string;
  props: Record<string, any>;
  children?: WidgetNode[];
}

/** Injectable widget config getter - defaults to returning undefined (no widget config) */
type WidgetConfigGetter = (type: string) => {
  defaults?: Record<string, any>;
  label?: string;
  explode?: (props: Record<string, any>) => WidgetNode;
} | undefined;

interface ChildInfo {
  id: string;
  edgeId: string;
  label: string;
}

// Default key used for localStorage when no consumer-specific key is provided.
const DEFAULT_STORAGE_KEY = "shared-canvas-state-v1";

// Schema parser, kept here to avoid import cycles.
// Accepts an optional widgetConfigGetter for resolving widget defaults.
const fromSchema = (
  schema: Schema,
  widgetConfigGetter?: WidgetConfigGetter
): { nodes: CMSNode[], edges: CMSEdge[] } => {
  if (!schema || !schema.nodes || typeof schema.nodes !== 'object') {
    return { nodes: [], edges: [] };
  }

  const nodes: CMSNode[] = Object.entries(schema.nodes).map(([id, v], i) => {
    if (!v || typeof v !== 'object' || !v.type) {
      console.warn(`Skipping node with unknown type: ${v?.type}`);
      return null;
    }

    const config = widgetConfigGetter ? widgetConfigGetter(v.type) : undefined;

    return {
      id,
      type: "shadcnNode",
      position: {
        x: 120 + (i % 6) * 240,
        y: 120 + Math.floor(i / 6) * 160
      },
      data: {
        comp: v.type,
        props: {
          ...config?.defaults,
          ...(v.props || {})
        }
      },
    };
  }).filter(Boolean) as CMSNode[];

  const edges: CMSEdge[] = [];
  Object.entries(schema.nodes).forEach(([id, v]) => {
    if (!v || !Array.isArray(v.children)) return;

    v.children.forEach((childId, idx) => {
      if (typeof childId === 'string' && nodes.some(n => n.id === childId)) {
        edges.push({
          id: uid(),
          source: id,
          target: childId,
          data: { order: idx },
          animated: false
        });
      }
    });
  });

  return { nodes, edges };
};

type CanvasMode = 'cms' | 'automation' | 'database' | 'studio';

interface SharedCanvasContextType {
  canvasMode: CanvasMode;
  setCanvasMode: (mode: CanvasMode) => void;
  nodes: Node<any>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<any>[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: OnConnect;
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedNode: Node<any> | null;
  addNode: (nodeConfig: Partial<Node<any>>) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  setNodeProps: (nodeId: string, props: Record<string, any>) => void;
  childrenOrdered: ChildInfo[];
  reorderChild: (from: number, to: number) => void;
  removeChildEdge: (edgeId: string) => void;
  removeSelectedNode: () => void;
  clearAll: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  createNode: (compKey: string) => CMSNode;
  commands: {
    newWorkspace: () => void;
    newMenu: () => void;
    newPage: () => void;
  };
  activeWs: Workspace;
  setActiveWs: React.Dispatch<React.SetStateAction<Workspace>>;
  activeRoute: string;
  setActiveRoute: React.Dispatch<React.SetStateAction<string>>;
  menuOverride: string | null;
  setMenuOverride: React.Dispatch<React.SetStateAction<string | null>>;

  // Pin preview controls
  pin: (id: string) => void;
  unpin: (id: string) => void;
  isPinned: (id: string) => boolean;
  pinnedIds: string[];

  // History (undo/redo)
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Clipboard (copy/paste)
  copy: () => void;
  cut: () => void;
  paste: () => void;
  canPaste: boolean;

  // Group / Ungroup (SketchUp-style components)
  groupSelectedNodes: () => void;
  ungroupNode: (groupId: string) => void;
  // Focus mode: "enter" a group to edit its children in isolation
  focusedGroupId: string | null;
  enterGroup: (groupId: string) => void;
  exitGroup: () => void;
  /** Pan & zoom the ReactFlow canvas to a node (used for preview→canvas sync) */
  focusNode: (nodeId: string) => void;
  /** Called by SharedCanvas on mount to register the pan callback */
  registerFocusCallback: (fn: (nodeId: string) => void) => void;
  /**
   * Explode a block node into its constituent primitive layout nodes.
   * Requires the widget's WidgetConfig to define an `explode(props)` function.
   * Reconnects the block's parent to the new root node automatically.
   */
  explodeBlock: (nodeId: string) => void;
  /**
   * Smart delete: if the node has both a parent and children, offers to
   * reconnect them before removing. Always removes if reconnect is false.
   */
  deleteNodeWithReconnect: (nodeId: string, reconnect?: boolean) => void;
}

export const SharedCanvasContext = createContext<SharedCanvasContextType | undefined>(
  undefined
);

const newNode = (comp: string, pos = { x: 0, y: 0 }, widgetConfigGetter?: WidgetConfigGetter): CMSNode => {
  const config = widgetConfigGetter ? widgetConfigGetter(comp) : undefined;
  return {
    id: uid(),
    type: "shadcnNode",
    position: pos,
    data: {
      comp,
      props: { ...config?.defaults }
    }
  };
};

export const SharedCanvasProvider: React.FC<{
  children: React.ReactNode;
  initialMode?: CanvasMode;
  /** Injectable widget config getter. Other consumers can pass their own or omit. */
  widgetConfigGetter?: WidgetConfigGetter;
  /** Initial schema to load. Defaults to empty canvas. */
  initialSchema?: Schema;
  /** Optional storage key for consumer-specific persistence boundaries. */
  storageKey?: string;
}> = ({
  children,
  initialMode = 'cms',
  widgetConfigGetter,
  initialSchema,
  storageKey = DEFAULT_STORAGE_KEY,
}) => {
  // Use a stable no-op getter when none provided
  const getWidgetConfig = widgetConfigGetter ?? (() => undefined);
  const [canvasMode, setCanvasMode] = useState(initialMode);
  // Use proper generic types for React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<{ order?: number }>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeWs, setActiveWs] = useState<Workspace>({ category: "personal", key: "" });
  const [activeRoute, setActiveRoute] = useState("/");
  const [menuOverride, setMenuOverride] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  // Registered by SharedCanvas; called to pan the canvas to a node
  const focusNodeCbRef = useRef<((nodeId: string) => void) | null>(null);
  const registerFocusCallback = useCallback((fn: (nodeId: string) => void) => {
    focusNodeCbRef.current = fn;
  }, []);
  const focusNode = useCallback((nodeId: string) => {
    focusNodeCbRef.current?.(nodeId);
  }, []);

  const onConnect: OnConnect = useCallback((params) => {
    // UI nodes (cms / studio / database) form a tree where each child has exactly
    // one parent.  Automation mode allows many-to-one connections (workflow graph).
    const already = edges.find((e) => e.target === params.target);
    if (already && canvasMode !== 'automation') return;

    const maxOrder = Math.max(-1, ...edges.filter((e) => e.source === params.source).map((e: any) => e.data?.order ?? 0));
    const newEdge = { ...params, data: { order: maxOrder + 1 } };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [edges, setEdges, canvasMode]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const createNode = useCallback((compKey: string) => {
    const pos = reactFlowInstance.current?.project({ x: 140, y: 120 }) || { x: 140, y: 120 };
    const node = newNode(compKey, pos, getWidgetConfig);
    setNodes((ns) => [...ns, node as Node<any>]);
    return node;
  }, [setNodes]);

  const addNode = useCallback((nodeConfig: Partial<Node<any>>) => {
    const compKey = (nodeConfig.data as any)?.comp || (nodeConfig.data as any)?.type;
    const config = compKey ? getWidgetConfig(String(compKey)) : undefined;
    const defaultProps = config?.defaults || {};

    const newNodeData = {
      comp: compKey,
      ...nodeConfig.data,
      props: { ...defaultProps, ...(nodeConfig.data as any)?.props },
    };

    const newN: Node<any> = {
      id: uid(),
      position: { x: 150, y: 150 },
      ...nodeConfig,
      data: newNodeData,
    };

    setNodes((nds) => [...nds, newN]);
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node));
  }, [setNodes]);

  const setNodeProps = (id: string, nextProps: Record<string, any>) => {
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, data: { ...n.data, props: nextProps } } : n));
  };

  const childrenOrdered = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter((e) => e.source === selectedNode.id)
      .sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0))
      .map((e: any) => {
        const n = nodes.find((x) => x.id === e.target);
        const config = getWidgetConfig((n as any)?.data?.comp || '');
        return {
          id: e.target,
          edgeId: e.id,
          // data.label is a user-defined override (set via Layers panel rename)
          label: (n as any)?.data?.label || config?.label || (n as any)?.data?.comp || e.target,
        };
      });
  }, [edges, nodes, selectedNode]);

  const reorderChild = (from: number, to: number) => {
    if (!selectedNode) return;
    const list: any[] = edges
      .filter((e) => e.source === selectedNode.id)
      .sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0));

    const nextTo = clamp(to, 0, list.length - 1);
    if (nextTo === from) return;

    const item = list.splice(from, 1)[0];
    list.splice(nextTo, 0, item);
    list.forEach((e, i) => { e.data = { ...e.data, order: i }; });

    setEdges((eds) => eds.map((e) => list.find((x) => x.id === e.id) || e));
  };

  const removeChildEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  };

  const removeSelectedNode = () => {
    if (!selectedNode) return;
    const id = selectedNode.id;
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setSelectedNodeId(null);
    setPinnedIds((ids) => ids.filter((x) => x !== id));
  };

  /**
   * Smart delete: reconnect=true wires the deleted node's parent to all its children.
   * This is the "delete middle node" pattern from React Flow examples.
   */
  const deleteNodeWithReconnect = useCallback((nodeId: string, reconnect = false) => {
    if (reconnect) {
      const parentEdge = edges.find((e) => e.target === nodeId);
      if (parentEdge) {
        const childEdges = edges.filter((e) => e.source === nodeId);
        const reconnectEdges: Edge[] = childEdges.map((ce, i) => ({
          id: uid(),
          source: parentEdge.source,
          target: ce.target,
          data: { order: i },
        }));
        setEdges((eds) => [
          ...eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
          ...reconnectEdges,
        ]);
      } else {
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      }
    } else {
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    }
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setPinnedIds((ids) => ids.filter((x) => x !== nodeId));
  }, [edges, selectedNodeId, setEdges, setNodes]);

  /**
   * Explode a block node into its primitive layout nodes.
   * Reads the widget's `explode(props)` function to produce a WidgetNode tree,
   * then flattens it into React Flow nodes + edges and replaces the original node.
   */
  const explodeBlock = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const config = getWidgetConfig(node.data?.comp || '');
    if (!config?.explode) return;

    const tree = config.explode(node.data?.props ?? {});
    const newNodes: Node<any>[] = [];
    const newEdges: Edge[] = [];
    const originX = node.position.x;
    const originY = node.position.y;

    // BFS: convert WidgetNode tree → flat nodes + edges
    // Columns are spread horizontally; rows go down
    function flatten(wn: WidgetNode, parentId: string | null, depth: number, sibIdx: number, totalSibs: number) {
      const id = uid();
      const colOffset = totalSibs > 1 ? (sibIdx - (totalSibs - 1) / 2) * 230 : 0;
      newNodes.push({
        id,
        type: 'shadcnNode',
        position: {
          x: originX + colOffset,
          y: originY + depth * 130,
        },
        data: { comp: wn.type, props: { ...wn.props } },
      });
      if (parentId) {
        newEdges.push({ id: uid(), source: parentId, target: id, data: { order: sibIdx } });
      }
      (wn.children ?? []).forEach((child, ci) =>
        flatten(child, id, depth + 1, ci, (wn.children ?? []).length)
      );
      return id;
    }

    const rootId = flatten(tree, null, 0, 0, 1);

    // Reconnect original node's parent to the new exploded root
    const parentEdge = edges.find((e) => e.target === nodeId);
    setEdges((eds) => {
      const filtered = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
      if (parentEdge) {
        return [...filtered, { id: uid(), source: parentEdge.source, target: rootId, data: parentEdge.data }];
      }
      return filtered;
    });
    setNodes((ns) => [...ns.filter((n) => n.id !== nodeId), ...newNodes]);
    setEdges((eds) => {
      const withoutOld = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
      return [...withoutOld, ...newEdges];
    });
    if (selectedNodeId === nodeId) setSelectedNodeId(rootId);
  }, [nodes, edges, selectedNodeId, setNodes, setEdges, getWidgetConfig]);

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setPinnedIds([]);
    localStorage.removeItem(storageKey);
  }, [setNodes, setEdges, storageKey]);

  const saveToStorage = useCallback(() => {
    if (!nodes.length && !edges.length) return;
    const dataToSave = { nodes, edges };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [nodes, edges, storageKey]);

  const loadFromStorage = useCallback(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.nodes) && Array.isArray(parsed?.edges)) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          return;
        }
        if (parsed && parsed.nodes && typeof parsed.nodes === 'object' && !Array.isArray(parsed.nodes)) {
          const { nodes: ns, edges: es } = fromSchema(parsed, getWidgetConfig);
          setNodes(ns as Node<any>[]);
          setEdges(es as Edge<{ order?: number }>[]);
          return;
        }
      } catch (error) {
        console.error('Failed to parse stored schema:', error);
        clearAll();
      }
    }
    // Fall back to initialSchema prop (e.g. INITIAL_CMS_SCHEMA from studio) or empty canvas
    if (initialSchema) {
      const { nodes: ns, edges: es } = fromSchema(initialSchema, getWidgetConfig);
      setNodes(ns as Node<any>[]);
      setEdges(es as Edge<{ order?: number }>[]);
    }
  }, [setNodes, setEdges, clearAll, initialSchema, getWidgetConfig, storageKey]);

  const commands = useMemo(() => ({
    newWorkspace: () => {
      const ws = createNode("navNode");
      setNodeProps(ws.id, { ...ws.data.props, kind: "workspace", category: "family", key: "Smiths" });
    },
    newMenu: () => {
      const menu = createNode("navNode");
      setNodeProps(menu.id, { ...menu.data.props, kind: "menu", title: "Menu " + Math.random().toString(36).slice(2, 5) });
    },
    newPage: () => {
      const path = "/page-" + Math.random().toString(36).slice(2, 6);
      // Use section instead of container
      const section = createNode("section");
      setNodeProps(section.id, { ...section.data.props, path });
      const hero = createNode("hero");
      onConnect({ source: section.id, target: hero.id, sourceHandle: null, targetHandle: null });

      const firstMenu = nodes.find(n => (n as any).data.comp === 'navNode' && (n as any).data.props.kind === 'menu');
      if (firstMenu) {
        onConnect({ source: (firstMenu as any).id, target: section.id, sourceHandle: null, targetHandle: null });
      }
      setActiveRoute(path);
    },
  }), [createNode, setNodeProps, onConnect, nodes, setActiveRoute]);

  const pin = (id: string) => setPinnedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  const unpin = (id: string) => setPinnedIds((ids) => ids.filter((x) => x !== id));
  const isPinned = (id: string) => pinnedIds.includes(id);

  // History hook for undo/redo
  const { pushSnapshot, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = useBuilderHistory();

  // Track state changes for history — use reference comparison (O(1)) instead of
  // JSON.stringify (O(N)) and debounce so rapid drag events collapse to one snapshot.
  const prevStateRef = useRef<{ nodes: Node<any>[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const prev = prevStateRef.current;
    // Reference identity check: React Flow / useNodesState only creates a new
    // array reference when content actually changed (drag end, data update, etc.)
    if (nodes === prev.nodes && edges === prev.edges) return;

    // Debounce: collapse rapid in-flight changes (e.g. live drag) into one undo step
    if (historyTimerRef.current !== undefined) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      pushSnapshot({ nodes: prev.nodes, edges: prev.edges });
      prevStateRef.current = { nodes, edges };
    }, 300);

    return () => { if (historyTimerRef.current !== undefined) clearTimeout(historyTimerRef.current); };
  }, [nodes, edges, pushSnapshot]);

  // Undo: restore previous state
  const undo = useCallback(() => {
    const snapshot = undoHistory();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      prevStateRef.current = { nodes: snapshot.nodes, edges: snapshot.edges };
    }
  }, [undoHistory, setNodes, setEdges]);

  // Redo: restore next state
  const redo = useCallback(() => {
    const snapshot = redoHistory();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      prevStateRef.current = { nodes: snapshot.nodes, edges: snapshot.edges };
    }
  }, [redoHistory, setNodes, setEdges]);

  // Clipboard hook
  const {
    copy: clipboardCopy,
    cut: clipboardCut,
    paste: clipboardPaste,
    canPaste,
  } = useBuilderClipboard(nodes, edges);

  // Get currently selected node IDs
  const getSelectedNodeIds = useCallback(() => {
    const selected = nodes.filter(n => n.selected).map(n => n.id);
    if (selected.length === 0 && selectedNodeId) {
      return [selectedNodeId];
    }
    return selected;
  }, [nodes, selectedNodeId]);

  // Clipboard operations
  const copy = useCallback(() => {
    clipboardCopy(getSelectedNodeIds());
  }, [clipboardCopy, getSelectedNodeIds]);

  const cut = useCallback(() => {
    const { nodes: nodesToRemove, edges: edgesToRemove } = clipboardCut(getSelectedNodeIds());
    if (nodesToRemove.length > 0) {
      const nodeIds = new Set(nodesToRemove.map(n => n.id));
      setNodes(ns => ns.filter(n => !nodeIds.has(n.id)));
      setEdges(es => es.filter(e => !nodeIds.has(e.source) && !nodeIds.has(e.target)));
      setSelectedNodeId(null);
    }
  }, [clipboardCut, getSelectedNodeIds, setNodes, setEdges, setSelectedNodeId]);

  const paste = useCallback(() => {
    const result = clipboardPaste();
    if (result) {
      setNodes(ns => [...ns.map(n => ({ ...n, selected: false })), ...result.nodes]);
      setEdges(es => [...es, ...result.edges]);
      // Select the first pasted node
      if (result.nodes.length > 0) {
        setSelectedNodeId(result.nodes[0].id);
      }
    }
  }, [clipboardPaste, setNodes, setEdges, setSelectedNodeId]);

  // Keyboard shortcuts
  useBuilderKeyboardShortcuts(undo, redo, true);
  useBuilderClipboardShortcuts(copy, cut, paste, true);

  // Ctrl+A / Cmd+A — select all visible nodes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'a') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      e.preventDefault();
      setNodes(ns => ns.map(n => ({ ...n, selected: true })));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setNodes]);

  // ── Group / Ungroup (SketchUp-style components) ────────────────────────────
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null);

  const groupSelectedNodes = useCallback(() => {
    const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
    if (selectedIds.length < 2) {
      // also allow single selected node via selectedNodeId
      const single = selectedNodeId && !selectedIds.includes(selectedNodeId) ? [selectedNodeId] : selectedIds;
      if (single.length < 2) return;
    }
    const ids = nodes.filter(n => n.selected).map(n => n.id);
    if (ids.length === 0 && selectedNodeId) ids.push(selectedNodeId);
    if (ids.length === 0) return;

    // Compute bounding-box center for group node position
    const selected = nodes.filter(n => ids.includes(n.id));
    const minX = Math.min(...selected.map(n => n.position.x));
    const minY = Math.min(...selected.map(n => n.position.y));

    const groupId = uid();
    const groupNode: Node<any> = {
      id: groupId,
      type: 'groupNode',
      position: { x: minX - 20, y: minY - 40 },
      data: { comp: 'group', props: { label: 'Group', savedAsBlock: false } },
    };

    // Wire: groupNode → each selected node
    const newEdges = ids.map((childId, idx) => ({
      id: uid(),
      source: groupId,
      target: childId,
      data: { order: idx },
      animated: false,
    }));

    setNodes(ns => [...ns, groupNode]);
    setEdges(es => [...es, ...newEdges]);
    setSelectedNodeId(groupId);
  }, [nodes, selectedNodeId, setNodes, setEdges, setSelectedNodeId]);

  const ungroupNode = useCallback((groupId: string) => {
    // Remove group node + its outgoing edges (children become independent)
    setEdges(es => es.filter(e => e.source !== groupId));
    setNodes(ns => ns.filter(n => n.id !== groupId));
    if (selectedNodeId === groupId) setSelectedNodeId(null);
    if (focusedGroupId === groupId) setFocusedGroupId(null);
  }, [setEdges, setNodes, selectedNodeId, setSelectedNodeId, focusedGroupId]);

  const enterGroup = useCallback((groupId: string) => {
    setFocusedGroupId(groupId);
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const exitGroup = useCallback(() => {
    setFocusedGroupId(null);
  }, []);

  const value = {
    canvasMode,
    setCanvasMode,
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    addNode,
    updateNodeData,
    setNodeProps,
    childrenOrdered,
    reorderChild,
    removeChildEdge,
    removeSelectedNode,
    clearAll,
    loadFromStorage,
    saveToStorage,
    createNode,
    commands,
    activeWs,
    setActiveWs,
    activeRoute,
    setActiveRoute,
    menuOverride,
    setMenuOverride,
    pin,
    unpin,
    isPinned,
    pinnedIds,
    // History
    undo,
    redo,
    canUndo,
    canRedo,
    // Clipboard
    copy,
    cut,
    paste,
    canPaste,
    // Group / focus mode
    groupSelectedNodes,
    ungroupNode,
    focusedGroupId,
    enterGroup,
    exitGroup,
    // Canvas focus from external sources (preview → canvas pan)
    focusNode,
    registerFocusCallback,
    // Block decomposition + smart delete
    explodeBlock,
    deleteNodeWithReconnect,
  };

  return (
    <SharedCanvasContext.Provider value={value}>
      {children}
    </SharedCanvasContext.Provider>
  );
};

export const useSharedCanvas = () => {
  const context = useContext(SharedCanvasContext);
  if (!context) {
    throw new Error('useSharedCanvas must be used within a SharedCanvasProvider');
  }
  return context;
};

export const useOptionalSharedCanvas = () => {
  return useContext(SharedCanvasContext);
};

export { fromSchema };
