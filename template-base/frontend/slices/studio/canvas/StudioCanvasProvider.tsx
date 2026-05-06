/**
 * StudioCanvasProvider
 *
 * Studio-specific canvas provider — thin wrapper around SharedCanvasProvider.
 * Injects studio's widget config and initial schema so the shared provider
 * has no direct dependency on the studio feature.
 *
 * Also registers the studioCanvasBridge so that AI agents and external code
 * can perform CRUD operations on the canvas without needing React context.
 *
 * Usage (in studio pages/layouts only):
 *   <StudioCanvasProvider>
 *     <SharedCanvas ... />
 *   </StudioCanvasProvider>
 *
 * @see frontend/shared/builder/canvas/core/SharedCanvasProvider.tsx
 */

"use client";

import React, { useEffect } from 'react';
import { SharedCanvasProvider, useOptionalSharedCanvas, fromSchema } from '@/frontend/shared/builder/canvas/core/SharedCanvasProvider';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';
import { INITIAL_CMS_SCHEMA } from '@/frontend/slices/studio/mockdata';
import { studioCanvasBridge } from './studioCanvasBridge';

interface StudioCanvasProviderProps {
  children: React.ReactNode;
  initialMode?: 'cms' | 'automation' | 'database' | 'studio';
}

/** Inner component - has access to SharedCanvas context */
function CanvasBridgeRegistrar() {
  const canvas = useOptionalSharedCanvas();

  useEffect(() => {
    if (!canvas) return;

    studioCanvasBridge.register({
      addNode: async (spec) => {
        const id = `ai-node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        canvas.addNode({
          id,
          type: 'shadcnNode',
          position: spec.position ?? { x: 200 + Math.random() * 400, y: 200 + Math.random() * 300 },
          data: {
            comp: spec.type,
            props: spec.props ?? {},
          },
        });
        return id;
      },

      updateNode: async (id, props) => {
        canvas.updateNodeData(id, { props: { ...props } });
        return true;
      },

      deleteNode: async (id) => {
        canvas.deleteNodeWithReconnect(id, false);
        return true;
      },

      getNodes: async () => {
        return canvas.nodes.map((n: any) => ({
          id: n.id,
          type: n.data?.comp ?? n.type,
          props: n.data?.props ?? {},
        }));
      },

      importSchema: async (schema) => {
        const { nodes, edges } = fromSchema(schema as any, getWidgetConfig);
        canvas.clearAll();
        // Small delay to let clearAll settle before loading new nodes
        await new Promise(r => setTimeout(r, 50));
        canvas.setNodes(nodes as any);
        canvas.setEdges(edges as any);
        return true;
      },

      clearCanvas: async () => {
        canvas.clearAll();
        return true;
      },
    });

    return () => studioCanvasBridge.unregister();
  }, [canvas]);

  return null;
}

/**
 * Wraps SharedCanvasProvider with studio-specific configuration:
 * - widgetConfigGetter: studio widget registry lookup
 * - initialSchema: default canvas schema with sample content
 * - bridge: registers studioCanvasBridge for AI agent CRUD access
 */
export const StudioCanvasProvider: React.FC<StudioCanvasProviderProps> = ({
  children,
  initialMode = 'studio',
}) => {
  return (
    <SharedCanvasProvider
      initialMode={initialMode}
      widgetConfigGetter={getWidgetConfig}
      initialSchema={INITIAL_CMS_SCHEMA}
      storageKey="studio-canvas-state-v1"
    >
      <CanvasBridgeRegistrar />
      {children}
    </SharedCanvasProvider>
  );
};
