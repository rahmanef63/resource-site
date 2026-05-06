import React, { useCallback, useRef, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';

import { useSharedCanvas, useDnD, getLayoutedElements } from '@/frontend/shared/builder';
import { CanvasToolbar } from './CanvasToolbar';

interface SharedCanvasProps {
  nodeTypes: Record<string, React.ComponentType<any>>;
  edgeTypes?: Record<string, React.ComponentType<any>>;
  onNodeSelect?: (nodeId: string | null) => void;
  /** Called when a node is double-clicked (e.g. enter group focus mode) */
  onNodeDoubleClick?: (nodeId: string, nodeType: string) => void;
  /** Called when a node is right-clicked. Receives event + node id + comp type. */
  onNodeContextMenu?: (e: React.MouseEvent, nodeId: string, comp: string) => void;
  showLayoutControls?: boolean;
  className?: string;
  onCanvasContextMenu?: (e: React.MouseEvent) => void;
  onExternalDrop?: (e: React.DragEvent) => boolean | void;
}

const SharedCanvasInner: React.FC<SharedCanvasProps> = ({
  nodeTypes,
  edgeTypes,
  onNodeSelect,
  onNodeDoubleClick,
  onNodeContextMenu,
  showLayoutControls = true,
  className = "",
  onCanvasContextMenu,
  onExternalDrop,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    onConnect,
    setSelectedNodeId,
    addNode,
    registerFocusCallback,
  } = useSharedCanvas();

  const reactFlow = useReactFlow();
  const { screenToFlowPosition } = reactFlow;
  const [type] = useDnD();
  const [isDragOver, setIsDragOver] = useState(false);

  const canvasClickRef = useRef(false);

  useEffect(() => {
    registerFocusCallback((nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      reactFlow.setCenter(
        node.position.x + 100,
        node.position.y + 40,
        { zoom: 1.1, duration: 400 },
      );
    });
  }, [registerFocusCallback, nodes, reactFlow]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    canvasClickRef.current = true;
    setSelectedNodeId(node.id);
    onNodeSelect?.(node.id);
    setTimeout(() => { canvasClickRef.current = false; }, 50);
  }, [setSelectedNodeId, onNodeSelect]);

  const onNodeDblClick = useCallback((event: React.MouseEvent, node: any) => {
    event.stopPropagation();
    if (onNodeDoubleClick) {
      onNodeDoubleClick(node.id, node.type ?? node.data?.comp ?? '');
    }
  }, [onNodeDoubleClick]);

  // Node right-click: select node + call context menu handler
  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNodeId(node.id);
    onNodeSelect?.(node.id);
    if (onNodeContextMenu) {
      onNodeContextMenu(event, node.id, node.data?.comp ?? '');
    }
  }, [setSelectedNodeId, onNodeSelect, onNodeContextMenu]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    onNodeSelect?.(null);
  }, [setSelectedNodeId, onNodeSelect]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear when leaving the canvas wrapper itself
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (onExternalDrop) {
      const handled = onExternalDrop(event);
      if (handled) return;
    }

    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNode({
      type: nodeTypes[type] ? type : Object.keys(nodeTypes)[0] || 'default',
      position,
      data: { comp: type, type, props: {} },
    });
  }, [screenToFlowPosition, type, addNode, nodeTypes, onExternalDrop]);

  const onLayout = useCallback((direction: 'TB' | 'LR' | 'RL' | 'BT') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const handlePaneContextMenu = (e: React.MouseEvent) => {
    if (onCanvasContextMenu) {
      e.preventDefault();
      onCanvasContextMenu(e);
    }
  };

  return (
    <div
      className={`h-full w-full ${className} transition-shadow duration-150 ${isDragOver ? 'ring-2 ring-primary/50 ring-inset' : ''}`}
      ref={reactFlowWrapper}
      onContextMenu={handlePaneContextMenu}
      onDragLeave={onDragLeave}
    >
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium backdrop-blur-sm">
            Drop to add component
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDblClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-muted/30"
      >
        <Background />
        <MiniMap className="!bg-background/80 !border-border" style={{ width: 200, height: 120 }} />
        <CanvasToolbar onLayout={onLayout} showLayoutControls={showLayoutControls} />
      </ReactFlow>
    </div>
  );
};

export const SharedCanvas: React.FC<SharedCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <SharedCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
