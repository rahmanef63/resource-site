export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  type: string;
  props: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CanvasNode {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
  selected?: boolean;
  dragging?: boolean;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    order?: number;
    label?: string;
  };
  animated?: boolean;
  type?: string;
}

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface PortConfig {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  multiple?: boolean;
}

import type { LucideIcon } from 'lucide-react';

export interface InspectorField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'switch' | 'textarea' | 'custom';
  options?: string[];
  placeholder?: string;
  component?: React.ComponentType<any>;
}

export interface NodeConfig {
  label: string;
  category: string;
  icon?: LucideIcon;
  color?: string;
  defaults: Record<string, any>;
  inputs?: PortConfig[];
  outputs?: PortConfig[];
  render?: (props: Record<string, any>) => React.ReactNode;
  inspector?: {
    fields: InspectorField[];
  };
}

export type FlowDirection = 'TB' | 'LR' | 'RL' | 'BT';

export interface CanvasConfig {
  direction: FlowDirection;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  showMinimap: boolean;
  showControls: boolean;
}
