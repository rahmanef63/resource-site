/**
 * Studio Bottom Panel
 *
 * Collapsible bottom panel — Runs & Log only.
 * Preview and JSON have been moved to center workspace tabs.
 */

import React from 'react';
import { Terminal, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExecutionPanel } from '@/frontend/shared/builder/flows';

export interface StudioBottomPanelProps {
  open: boolean;
  onToggle: () => void;
  // Logs props
  result: any;
  logs: any[];
  steps: any[];
  onClearLogs: () => void;
  // Mode
  mode: 'ui' | 'workflow' | 'unified';
}

export const StudioBottomPanel: React.FC<StudioBottomPanelProps> = ({
  open,
  onToggle,
  result,
  logs,
  steps,
  onClearLogs,
}) => {
  return (
    <div className={cn('shrink-0 flex flex-col overflow-hidden border-t border-border bg-background', open && 'h-56')}>
      {/* Header strip — full row is clickable */}
      <div
        role="button"
        onClick={onToggle}
        title={open ? 'Collapse panel' : 'Expand panel'}
        className="flex items-center shrink-0 bg-muted/30 h-9 cursor-pointer hover:bg-muted/50 transition-colors select-none"
      >
        <div className="flex items-center gap-1.5 flex-1 px-3">
          <Terminal size={12} className="text-muted-foreground" />
          <span className={cn(
            'text-xs whitespace-nowrap',
            open ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            RUNS &amp; LOG
          </span>
          {logs.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground leading-tight">
              {logs.length}
            </span>
          )}
        </div>
        <ChevronUp
          size={14}
          className={cn('mr-3 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
        />
      </div>

      {/* Panel content — only visible when open */}
      {open && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ExecutionPanel
            result={result}
            logs={logs}
            steps={steps}
            onClearLogs={onClearLogs}
          />
        </div>
      )}
    </div>
  );
};
