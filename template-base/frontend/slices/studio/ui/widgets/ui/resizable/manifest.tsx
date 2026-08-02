import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PanelsLeftRight } from 'lucide-react';

export const resizableManifest: WidgetConfig = {
  label: 'Resizable',
  category: 'Components',
  description: 'Resizable split panels with drag handle.',
  icon: PanelsLeftRight,
  defaults: {
    direction: 'horizontal',
    leftLabel: 'Panel 1',
    rightLabel: 'Panel 2',
    defaultLeftSize: 50,
    className: '',
  },
  render: (props) => {
    const p = props as any;
    return (
      <ResizablePanelGroup
        direction={p.direction ?? 'horizontal'}
        className={`min-h-[200px] max-w-full rounded-lg border ${p.className ?? ''}`}
      >
        <ResizablePanel defaultSize={p.defaultLeftSize ?? 50}>
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            {p.leftLabel}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={100 - (p.defaultLeftSize ?? 50)}>
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            {p.rightLabel}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'direction', label: 'Direction', type: 'select', options: ['horizontal', 'vertical'] }),
      createCustomField({ key: 'leftLabel', label: 'Panel 1 Label', type: 'text' }),
      createCustomField({ key: 'rightLabel', label: 'Panel 2 Label', type: 'text' }),
      createCustomField({ key: 'defaultLeftSize', label: 'Left Size (%)', type: 'number' }),
    ],
  },
};
