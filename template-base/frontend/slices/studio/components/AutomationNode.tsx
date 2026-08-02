import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/frontend/shared/foundation';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import {
  Globe2,
  Webhook,
  Puzzle,
  Binary,
  Table2,
  Zap,
  Play,
  Clock,
  AlertTriangle,
  Bot,
  Mail,
  Database,
  GitBranch,
  ArrowRightLeft,
  Key,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AutomationNodeProps {
  id: string;
  data: {
    type: string;
    props: Record<string, any>;
    feature?: string;
    category?: string;
    label?: string;
  };
  selected?: boolean;
}

// Category to icon mapping
const categoryIcons: Record<string, LucideIcon> = {
  'Trigger': Play,
  'HTTP': Globe2,
  'Webhook': Webhook,
  'Integration': Puzzle,
  'Logic': GitBranch,
  'Data': Table2,
  'AI': Bot,
  'LLM': Bot,
  'Error': AlertTriangle,
  'Schedule': Clock,
  'Email': Mail,
  'Database': Database,
  'Transform': ArrowRightLeft,
  'Credentials': Key,
};

// Category to color mapping using shadcn CSS vars
const categoryColors: Record<string, string> = {
  'Trigger': 'border-l-green-500 bg-green-500/5',
  'HTTP': 'border-l-blue-500 bg-blue-500/5',
  'Webhook': 'border-l-purple-500 bg-purple-500/5',
  'Integration': 'border-l-orange-500 bg-orange-500/5',
  'Logic': 'border-l-yellow-500 bg-yellow-500/5',
  'Data': 'border-l-cyan-500 bg-cyan-500/5',
  'AI': 'border-l-pink-500 bg-pink-500/5',
  'LLM': 'border-l-pink-500 bg-pink-500/5',
  'Error': 'border-l-red-500 bg-red-500/5',
};

const getIconByCategory = (category: string): LucideIcon => {
  return categoryIcons[category] || Zap;
};

const getColorByCategory = (category: string): string => {
  return categoryColors[category] || 'border-l-muted-foreground';
};

export const AutomationNode: React.FC<AutomationNodeProps> = ({ id, data, selected }) => {
  const { getComponent } = useCrossFeatureRegistry();
  const config = getComponent(data.type);
  const category = data.category || config?.category || 'Logic';
  const Icon = getIconByCategory(category);
  const colorClass = getColorByCategory(category);
  const label = data.label || config?.label || data.type;
  const description = config?.description || '';

  return (
    <div
      className={cn(
        // Base styling with shadcn CSS variables
        'min-w-[200px] max-w-[280px] rounded-lg border-2 shadow-md transition-all',
        'bg-card text-card-foreground',
        'border-l-4',
        colorClass,
        // Selection state
        selected
          ? 'border-primary ring-2 ring-primary/20 shadow-lg'
          : 'border-border hover:border-muted-foreground/50'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <div className={cn(
          'p-1.5 rounded-md',
          category === 'Trigger' && 'bg-green-500/10 text-green-600',
          category === 'HTTP' && 'bg-blue-500/10 text-blue-600',
          category === 'Webhook' && 'bg-purple-500/10 text-purple-600',
          category === 'Integration' && 'bg-orange-500/10 text-orange-600',
          category === 'Logic' && 'bg-yellow-500/10 text-yellow-600',
          category === 'Data' && 'bg-cyan-500/10 text-cyan-600',
          category === 'AI' && 'bg-pink-500/10 text-pink-600',
          category === 'LLM' && 'bg-pink-500/10 text-pink-600',
          !categoryColors[category] && 'bg-muted text-muted-foreground',
        )}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{label}</div>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{id.slice(-4)}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1">
        {/* Description or type info */}
        <div className="text-xs text-muted-foreground truncate">
          {description || `${category} node`}
        </div>

        {/* Show URL if HTTP node */}
        {data.props?.url && (
          <div className="text-xs text-primary truncate font-mono">
            {data.props.url}
          </div>
        )}

        {/* Show expression if data node */}
        {data.props?.expression && (
          <div className="text-xs text-muted-foreground truncate font-mono bg-muted/50 px-1 py-0.5 rounded">
            {data.props.expression}
          </div>
        )}
      </div>

      {/* Handles using shadcn colors */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !border-background !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !border-background !w-3 !h-3"
      />
    </div>
  );
};
