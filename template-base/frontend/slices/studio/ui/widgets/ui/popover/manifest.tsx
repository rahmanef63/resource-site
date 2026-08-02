import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export const popoverManifest: WidgetConfig = {
  label: 'Popover',
  category: 'Components',
  description: 'Floating content panel anchored to a trigger.',
  icon: MessageSquare,
  defaults: {
    triggerText: 'Open',
    content: 'Popover content goes here.',
    side: 'bottom',
    align: 'start',
    className: '',
  },
  render: (props) => {
    const p = props as any;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={p.className}>{p.triggerText}</Button>
        </PopoverTrigger>
        <PopoverContent side={p.side} align={p.align} className="text-sm">
          {p.content}
        </PopoverContent>
      </Popover>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'triggerText', label: 'Trigger Text', type: 'text' }),
      createCustomField({ key: 'content', label: 'Content', type: 'textarea' }),
      createCustomField({ key: 'side', label: 'Side', type: 'select', options: ['top', 'right', 'bottom', 'left'] }),
      createCustomField({ key: 'align', label: 'Align', type: 'select', options: ['start', 'center', 'end'] }),
    ],
  },
};
