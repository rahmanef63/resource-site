import type { CanvasNode, CanvasEdge, Position } from './types';

export const snapToGrid = (position: Position, gridSize: number): Position => ({
  x: Math.round(position.x / gridSize) * gridSize,
  y: Math.round(position.y / gridSize) * gridSize
});

export const getNodeBounds = (node: CanvasNode) => ({
  x: node.position.x,
  y: node.position.y,
  width: 200, // Default width
  height: 100  // Default height
});

export const isNodeIntersecting = (nodeA: CanvasNode, nodeB: CanvasNode) => {
  const boundsA = getNodeBounds(nodeA);
  const boundsB = getNodeBounds(nodeB);
  
  return !(
    boundsA.x + boundsA.width < boundsB.x ||
    boundsB.x + boundsB.width < boundsA.x ||
    boundsA.y + boundsA.height < boundsB.y ||
    boundsB.y + boundsB.height < boundsA.y
  );
};

export const getConnectedNodes = (nodeId: string, edges: CanvasEdge[]) => {
  const incoming = edges.filter(edge => edge.target === nodeId);
  const outgoing = edges.filter(edge => edge.source === nodeId);
  
  return {
    incoming: incoming.map(edge => edge.source),
    outgoing: outgoing.map(edge => edge.target)
  };
};

export const getNodeChildren = (nodeId: string, edges: CanvasEdge[]) => {
  return edges
    .filter(edge => edge.source === nodeId)
    .sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0))
    .map(edge => edge.target);
};

export const getNodeParents = (nodeId: string, edges: CanvasEdge[]) => {
  return edges
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source);
};

export const validateConnection = (
  sourceId: string,
  targetId: string,
  edges: CanvasEdge[]
): boolean => {
  // Prevent self-connection
  if (sourceId === targetId) return false;
  
  // Prevent duplicate connections
  const existingConnection = edges.find(
    edge => edge.source === sourceId && edge.target === targetId
  );
  if (existingConnection) return false;
  
  // Prevent cycles (basic check)
  const wouldCreateCycle = (source: string, target: string, visited = new Set<string>()): boolean => {
    if (visited.has(source)) return true;
    visited.add(source);
    
    const children = getNodeChildren(source, edges);
    return children.some(child => child === target || wouldCreateCycle(child, target, visited));
  };
  
  return !wouldCreateCycle(targetId, sourceId);
};

export const layoutNodes = (
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  direction: 'TB' | 'LR' | 'RL' | 'BT' = 'TB'
): CanvasNode[] => {
  // Simple auto-layout algorithm
  const nodeSpacing = { x: 250, y: 150 };
  const rootNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );
  
  const positioned = new Set<string>();
  const result = [...nodes];
  
  const positionNode = (nodeId: string, x: number, y: number, level = 0) => {
    if (positioned.has(nodeId)) return;
    
    const nodeIndex = result.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;
    
    result[nodeIndex] = {
      ...result[nodeIndex],
      position: { x, y }
    };
    positioned.add(nodeId);
    
    const children = getNodeChildren(nodeId, edges);
    children.forEach((childId, index) => {
      const childX = direction === 'LR' ? x + nodeSpacing.x : x + (index - children.length / 2) * nodeSpacing.x;
      const childY = direction === 'TB' ? y + nodeSpacing.y : y;
      positionNode(childId, childX, childY, level + 1);
    });
  };
  
  rootNodes.forEach((node, index) => {
    const startX = index * nodeSpacing.x * 2;
    const startY = 50;
    positionNode(node.id, startX, startY);
  });
  
  return result;
};
