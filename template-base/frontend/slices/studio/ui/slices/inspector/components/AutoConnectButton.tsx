import React from 'react';
import { Button } from '@/components/ui';
import type { CMSNode, CMSEdge } from '@/frontend/slices/studio/ui/types';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';
import { uid } from '@/lib/utils';

interface AutoConnectButtonProps {
  selectedNode: CMSNode;
  connectKey: string;
  setNodes: React.Dispatch<React.SetStateAction<CMSNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<CMSEdge[]>>;
  edges: CMSEdge[];
}

export const AutoConnectButton: React.FC<AutoConnectButtonProps> = ({
  selectedNode,
  connectKey,
  setNodes,
  setEdges,
  edges
}) => {
  const config = getWidgetConfig(selectedNode.data.comp);
  const autoConnect = config?.autoConnect?.[connectKey];

  if (!autoConnect) return null;

  const handleAutoConnect = () => {
    const newNodeId = uid();
    const newNode: CMSNode = {
      id: newNodeId,
      type: "shadcnNode",
      position: {
        x: selectedNode.position.x + 250,
        y: selectedNode.position.y + 50
      },
      data: {
        comp: autoConnect.type,
        props: {
          ...getWidgetConfig(autoConnect.type)?.defaults,
          ...autoConnect.props
        }
      }
    };

    // Calculate order for new edge
    const maxOrder = Math.max(
      -1,
      ...edges.filter(e => e.source === selectedNode.id).map(e => e.data?.order ?? 0)
    );

    const newEdge: CMSEdge = {
      id: uid(),
      source: selectedNode.id,
      target: newNodeId,
      data: { order: maxOrder + 1 }
    };

    setNodes(prev => [...prev, newNode]);
    setEdges(prev => [...prev, newEdge]);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleAutoConnect}
      className="ml-2"
    >
      + Add {autoConnect.type}
    </Button>
  );
};
