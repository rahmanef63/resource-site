import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/frontend/shared/foundation';
import type { CanvasNode, NodeConfig } from '../core/types';
import type { LucideIcon } from 'lucide-react';
import { Boxes, Database as DatabaseIcon, FileCode, GitBranch } from 'lucide-react';

interface BaseNodeProps {
  id: string;
  data: CanvasNode['data'];
  selected?: boolean;
  config?: NodeConfig;
}

function inferIcon(config?: NodeConfig): LucideIcon {
  if (config?.icon) return config.icon;
  const label = (config?.label || '').toLowerCase();
  const category = (config?.category || '').toLowerCase();
  if (label.includes('database') || category === 'data') return DatabaseIcon;
  if (label.includes('query')) return FileCode;
  if (label.includes('transform')) return GitBranch;
  return Boxes;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ id, data, selected, config }) => {
  const Icon = inferIcon(config);
  return (
    <div
      className={cn(
        'min-w-[200px] rounded-2xl border bg-card shadow-sm transition-all',
        selected ? 'border-primary shadow-md' : 'border-border',
        'hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 border-b rounded-t-2xl',
          'bg-muted border-border'
        )}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} />
          <span className="text-xs font-medium">{config?.label || data.type}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{id.slice(1, 5)}</span>
      </div>

      <div className="p-3">
        {config?.render ? (
          config.render(data.props)
        ) : (
          <div className="text-[11px] text-muted-foreground">
            <div className="truncate">Type: {data.type}</div>
            {Object.keys(data.props).length > 0 && (
              <div className="truncate mt-1">Props: {Object.keys(data.props).length}</div>
            )}
          </div>
        )}
      </div>

      {config?.inputs?.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Top}
          id={input.id}
          style={{ left: `${20 + index * 30}px`, borderRadius: 0 }}
          className={cn('w-3 h-3 border-2 border-background', 'bg-muted-foreground')}
        />
      ))}

      {config?.outputs?.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Bottom}
          id={output.id}
          style={{ left: `${20 + index * 30}px` }}
          className={cn('w-3 h-3 border-2 border-background', 'bg-muted-foreground')}
        />
      ))}

      {!config?.inputs && <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />}
      {!config?.outputs && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
};
