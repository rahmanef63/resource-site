import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent,
  ContextMenuItem, ContextMenuSeparator, ContextMenuLabel,
} from '@/components/ui/context-menu';
import { MousePointerClick } from 'lucide-react';

export const contextMenuManifest: WidgetConfig = {
  label: 'Context Menu',
  category: 'Components',
  description: 'Right-click context menu for an area.',
  icon: MousePointerClick,
  defaults: {
    triggerText: 'Right-click here',
    label: 'Actions',
    items: ['View', 'Edit', 'Delete'],
    className: '',
  },
  render: (props) => {
    const p = props as any;
    const items: string[] = p.items ?? ['View', 'Edit', 'Delete'];
    return (
      <ContextMenu>
        <ContextMenuTrigger className={`flex h-[150px] w-full items-center justify-center rounded-md border border-dashed text-sm ${p.className ?? ''}`}>
          {p.triggerText}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {p.label && <ContextMenuLabel>{p.label}</ContextMenuLabel>}
          {p.label && <ContextMenuSeparator />}
          {items.map((item: string, i: number) => (
            <ContextMenuItem key={i}>{item}</ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'triggerText', label: 'Trigger Area Text', type: 'text' }),
      createCustomField({ key: 'label', label: 'Menu Label', type: 'text' }),
    ],
  },
};
