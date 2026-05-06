/**
 * EventsInspector — bind DOM events to actions for a selected node.
 * Events are stored in node.data.events: Record<string, EventBinding>
 */

import React from 'react';
import { useSharedCanvas } from '@/frontend/shared/builder';

interface EventBinding {
  type: 'navigate' | 'mutation' | 'custom' | 'emit';
  value: string; // route, mutation name, JS snippet, or event name
}

type EventKey = 'onClick' | 'onSubmit' | 'onChange' | 'onHover';

const EVENT_KEYS: EventKey[] = ['onClick', 'onSubmit', 'onChange', 'onHover'];

const ACTION_TYPE_OPTIONS = [
  { value: 'none',     label: 'None' },
  { value: 'navigate', label: 'Navigate' },
  { value: 'mutation', label: 'Run Mutation' },
  { value: 'custom',   label: 'Custom JS' },
  { value: 'emit',     label: 'Emit Event' },
] as const;

interface EventsInspectorProps {
  selectedNode: any | null;
}

export function EventsInspector({ selectedNode }: EventsInspectorProps) {
  const { setNodeProps } = useSharedCanvas();

  if (!selectedNode) {
    return (
      <div className="p-3 text-xs text-muted-foreground">
        Select a node to bind events
      </div>
    );
  }

  const events: Record<string, EventBinding> = selectedNode.data?.events ?? {};

  const updateEvent = (key: EventKey, patch: Partial<EventBinding> | null) => {
    const current = events[key] as EventBinding | undefined;
    let next: Record<string, EventBinding>;
    if (patch === null) {
      const { [key]: _removed, ...rest } = events;
      next = rest;
    } else {
      next = {
        ...events,
        [key]: { type: current?.type ?? 'navigate', value: current?.value ?? '', ...patch } as EventBinding,
      };
    }
    setNodeProps(selectedNode.id, { ...selectedNode.data?.props, events: next });
  };

  return (
    <div className="p-3 space-y-4">
      {EVENT_KEYS.map((key) => {
        const binding = events[key] as EventBinding | undefined;
        const actionType = binding?.type ?? 'none';

        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground w-20 shrink-0">{key}</span>
              <select
                value={binding ? actionType : 'none'}
                onChange={(e) => {
                  const val = e.target.value as EventBinding['type'] | 'none';
                  if (val === 'none') {
                    updateEvent(key, null);
                  } else {
                    updateEvent(key, { type: val, value: binding?.value ?? '' });
                  }
                }}
                className="flex-1 h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {ACTION_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {binding && actionType !== 'none' && (
              <input
                type="text"
                value={binding.value}
                onChange={(e) => updateEvent(key, { value: e.target.value })}
                placeholder={
                  actionType === 'navigate' ? '/route/path' :
                  actionType === 'mutation' ? 'mutationName' :
                  actionType === 'emit' ? 'eventName' :
                  'JS snippet…'
                }
                className="w-full h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring ml-22"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
