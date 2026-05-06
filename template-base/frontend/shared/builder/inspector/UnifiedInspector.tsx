import React from 'react';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { useSharedCanvas } from '../canvas/core/SharedCanvasProvider';
import { DynamicInspector } from './DynamicInspector';

interface UnifiedInspectorProps {
  feature?: 'cms' | 'automation' | 'database';
  customRenderers?: Record<string, React.ComponentType<any>>;
  selectedNode?: any;
  /** Optional widget-specific fields getter injected by the host feature. */
  getWidgetFields?: (comp: string) => import('./DynamicInspector').InspectorField[] | undefined;
}

export const UnifiedInspector: React.FC<UnifiedInspectorProps> = ({
  feature = 'cms',
  customRenderers = {},
  selectedNode: propSelectedNode,
  getWidgetFields,
}) => {
  const { selectedNode: contextSelectedNode, setNodeProps } = useSharedCanvas();
  const { getComponent, getWidget } = useCrossFeatureRegistry();

  // Use prop selectedNode if provided, otherwise use context
  const selectedNode = propSelectedNode || contextSelectedNode;

  if (!selectedNode) {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-xs text-muted-foreground text-center">Select a node on the canvas to inspect its properties.</p>
        <div className="space-y-1.5">
          {[
            { key: 'Click', desc: 'Select a node' },
            { key: 'Double-click', desc: 'Enter group / pin preview' },
            { key: 'G', desc: 'Group selected nodes' },
            { key: isMac ? '⌘Z / ⌘⇧Z' : 'Ctrl+Z / Ctrl+Shift+Z', desc: 'Undo / Redo' },
            { key: isMac ? '⌘F' : 'Ctrl+F', desc: 'Search component library' },
          ].map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <kbd className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 font-mono shrink-0">{key}</kbd>
              <span className="text-[11px] text-muted-foreground text-right">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.data.comp || selectedNode.data.type;
  const config = getComponent(nodeType) || getWidget(nodeType);
  const props = selectedNode.data.props || {};

  const updateProp = (key: string, value: any) => {
    setNodeProps(selectedNode.id, { ...props, [key]: value });
  };

  // Check for custom renderer
  const CustomRenderer = customRenderers[nodeType];
  if (CustomRenderer) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <CustomRenderer
          selectedNode={selectedNode}
          props={props}
          updateProp={updateProp}
          config={config}
        />
      </div>
    );
  }

  // Use the new DynamicInspector for better control handling
  return <DynamicInspector selectedNode={selectedNode} getWidgetFields={getWidgetFields} />;
};

function getFeatureIcon(feature: string): string {
  const icons: Record<string, string> = {
    'cms': '📝',
    'automation': '⚡',
    'database': '🗄️'
  };
  return icons[feature] || '📦';
}
