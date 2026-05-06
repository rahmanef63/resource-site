import { useMemo } from 'react';
import type { CMSNode, CMSEdge, Schema, SchemaNode } from '../types';
import { compactProps } from '@/frontend/slices/studio/ui/lib/cms-utils';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';

const SCHEMA_VERSION = "0.4";

export const toSchema = (nodes: CMSNode[], edges: CMSEdge[]): Schema => {
  const childrenMap: Record<string, string[]> = {};
  
  edges
    .sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0))
    .forEach((e) => {
      if (!childrenMap[e.source]) childrenMap[e.source] = [];
      childrenMap[e.source].push(e.target);
    });

  const topLevel = nodes
    .filter((n) => !edges.find((e) => e.target === n.id))
    .map((n) => n.id);

  const schemaNodes: Record<string, SchemaNode> = {};
  
  nodes.forEach((n) => {
    const comp = n.data.comp;
    const config = getWidgetConfig(comp);
    const defaults = config?.defaults || {};
    
    schemaNodes[n.id] = {
      type: comp,
      props: compactProps(defaults, n.data.props),
      children: childrenMap[n.id] || [],
    };
  });

  return { 
    version: SCHEMA_VERSION, 
    root: topLevel, 
    nodes: schemaNodes 
  };
};

export const useSchema = (nodes: CMSNode[], edges: CMSEdge[]): Schema => {
  return useMemo(() => toSchema(nodes, edges), [nodes, edges]);
};
