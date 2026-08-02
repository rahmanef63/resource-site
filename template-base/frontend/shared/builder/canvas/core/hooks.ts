import { useState, useCallback } from 'react';
import type {
  CanvasNode,
  CanvasEdge,
  CanvasState,
  FlowDirection,
  CanvasConfig,
  NodeData,
  NodeConfig,
} from './types';

export const useCanvasState = (initialNodes: CanvasNode[] = [], initialEdges: CanvasEdge[] = []) => {
  const [state, setState] = useState<CanvasState>({
    nodes: initialNodes,
    edges: initialEdges,
    selectedNodeId: null,
    viewport: { x: 0, y: 0, zoom: 1 }
  });

  const updateNodes = useCallback((updater: (nodes: CanvasNode[]) => CanvasNode[]) => {
    setState(prev => ({ ...prev, nodes: updater(prev.nodes) }));
  }, []);

  const updateEdges = useCallback((updater: (edges: CanvasEdge[]) => CanvasEdge[]) => {
    setState(prev => ({ ...prev, edges: updater(prev.edges) }));
  }, []);

  const setSelectedNodeId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedNodeId: id }));
  }, []);

  const addNode = useCallback((node: CanvasNode) => {
    updateNodes(nodes => [...nodes, node]);
  }, [updateNodes]);

  const removeNode = useCallback((id: string) => {
    updateNodes(nodes => nodes.filter(n => n.id !== id));
    updateEdges(edges => edges.filter(e => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  }, [updateNodes, updateEdges, setSelectedNodeId]);

  const updateNodeData = useCallback((id: string, data: Partial<NodeData>) => {
    updateNodes(nodes => 
      nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, [updateNodes]);

  const addEdge = useCallback((edge: CanvasEdge) => {
    updateEdges(edges => [...edges, edge]);
  }, [updateEdges]);

  const removeEdge = useCallback((id: string) => {
    updateEdges(edges => edges.filter(e => e.id !== id));
  }, [updateEdges]);

  return {
    state,
    updateNodes,
    updateEdges,
    setSelectedNodeId,
    addNode,
    removeNode,
    updateNodeData,
    addEdge,
    removeEdge
  };
};

export const useCanvasConfig = (initialConfig?: Partial<CanvasConfig>) => {
  const [config, setConfig] = useState<CanvasConfig>({
    direction: 'TB',
    snapToGrid: false,
    gridSize: 20,
    showGrid: true,
    showMinimap: true,
    showControls: true,
    ...initialConfig
  });

  const updateConfig = useCallback((updates: Partial<CanvasConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const setDirection = useCallback((direction: FlowDirection) => {
    updateConfig({ direction });
  }, [updateConfig]);

  const toggleGrid = useCallback(() => {
    updateConfig({ showGrid: !config.showGrid });
  }, [config.showGrid, updateConfig]);

  const toggleMinimap = useCallback(() => {
    updateConfig({ showMinimap: !config.showMinimap });
  }, [config.showMinimap, updateConfig]);

  const getLayoutOptions = useCallback(() => {
    return {
      direction: config.direction,
      snapToGrid: config.snapToGrid,
      snapGrid: [config.gridSize, config.gridSize] as [number, number]
    };
  }, [config]);

  return {
    config,
    updateConfig,
    setDirection,
    toggleGrid,
    toggleMinimap,
    getLayoutOptions
  };
};

export const useNodeRegistry = () => {
  const [registry, setRegistry] = useState<Record<string, NodeConfig>>({});

  const registerNode = useCallback((type: string, config: NodeConfig) => {
    setRegistry(prev => ({ ...prev, [type]: config }));
  }, []);

  const getNodeConfig = useCallback((type: string) => {
    return registry[type];
  }, [registry]);

  const getNodesByCategory = useCallback((category: string) => {
    return Object.entries(registry)
      .filter(([, config]) => config.category === category)
      .map(([type, config]) => ({ type, config }));
  }, [registry]);

  const getAllNodes = useCallback(() => {
    return Object.entries(registry)
      .map(([type, config]) => ({ type, config }));
  }, [registry]);

  return {
    registry,
    registerNode,
    getNodeConfig,
    getNodesByCategory,
    getAllNodes
  };
};
