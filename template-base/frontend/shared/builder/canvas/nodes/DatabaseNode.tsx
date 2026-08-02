import React from 'react';
import { Database as DatabaseIcon } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { CanvasNode, NodeConfig } from '../core/types';

interface DatabaseNodeProps {
  id: string;
  data: CanvasNode['data'];
  selected?: boolean;
}

export const DatabaseNode: React.FC<DatabaseNodeProps> = (props) => {
  const config: NodeConfig = {
    label: 'Database',
    category: 'Data',
    icon: DatabaseIcon,
    color: 'blue',
    defaults: {
      tableName: 'users',
      operation: 'select',
      fields: ['*']
    },
    inputs: [
      { id: 'query', label: 'Query', type: 'string' }
    ],
    outputs: [
      { id: 'data', label: 'Data', type: 'array' },
      { id: 'error', label: 'Error', type: 'string' }
    ],
    render: (props) => (
      <div className="text-xs space-y-1">
        <div className="font-medium">{props.tableName}</div>
        <div className="text-muted-foreground">{props.operation}</div>
        <div className="text-muted-foreground/70 text-[10px]">
          {Array.isArray(props.fields) ? props.fields.join(', ') : props.fields}
        </div>
      </div>
    )
  };

  return <BaseNode {...props} config={config} />;
};
