import { useMemo } from 'react';
import type { Schema, CMSNode, CMSEdge } from '../types';
import { uid } from '@/lib/utils';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';

export const fromSchema = (schema: Schema): { nodes: CMSNode[], edges: CMSEdge[] } => {
  if (!schema || !schema.nodes || typeof schema.nodes !== 'object') {
    return { nodes: [], edges: [] };
  }
  
  const nodes: CMSNode[] = Object.entries(schema.nodes).map(([id, v], i) => {
    if (!v || typeof v !== 'object' || !v.type) {
      console.warn(`Skipping node with unknown type: ${v.type}`);
      return null;
    }
    
    const config = getWidgetConfig(v.type);
    if (!config) {
      console.warn(`Skipping node with unregistered type: ${v.type}`);
      return null;
    }
    
    return {
      id,
      type: "shadcnNode",
      position: { 
        x: 120 + (i % 6) * 240, 
        y: 120 + Math.floor(i / 6) * 160 
      },
      data: {
        comp: v.type,
        props: (() => {
          const merged = { ...config?.defaults, ...(v.props || {}) };
          // Normalise: if a prop's default is a string but the saved value is an
          // array (AI-generated schemas), join it back to comma-separated string
          // so widgets that rely on string.split(',') don't crash.
          for (const [key, val] of Object.entries(merged)) {
            if (Array.isArray(val) && typeof config?.defaults?.[key] === 'string') {
              merged[key] = (val as unknown[]).map(String).join(', ');
            }
          }
          return merged;
        })(),
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

export const useSchemaParser = (schema: Schema) => {
  return useMemo(() => fromSchema(schema), [schema]);
};
