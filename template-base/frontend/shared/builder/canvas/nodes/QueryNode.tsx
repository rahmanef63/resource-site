import React from 'react';
import { FileText } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { CanvasNode, NodeConfig } from '../core/types';

interface QueryNodeProps {
  id: string;
  data: CanvasNode['data'];
  selected?: boolean;
}

export const QueryNode: React.FC<QueryNodeProps> = (props) => {
  const config: NodeConfig = {
    label: 'SQL Query',
    category: 'Data',
    icon: FileText,
    color: 'green',
    defaults: {
      query: 'SELECT * FROM table',
      parameters: []
    },
    inputs: [
      { id: 'params', label: 'Parameters', type: 'object' }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'array' }
    ],
    render: (props) => (
      <div className="text-xs space-y-1">
        <div className="font-mono text-[10px] bg-muted p-1 rounded">
          {props.query?.slice(0, 30)}...
        </div>
        {props.parameters?.length > 0 && (
          <div className="text-muted-foreground">
            {props.parameters.length} params
          </div>
        )}
      </div>
    )
  };

  return <BaseNode {...props} config={config} />;
};
