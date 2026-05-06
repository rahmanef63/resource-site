import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader,
  DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { PanelBottom } from 'lucide-react';

export const drawerManifest: WidgetConfig = {
  label: 'Drawer',
  category: 'Components',
  description: 'Bottom drawer panel (mobile-friendly).',
  icon: PanelBottom,
  defaults: {
    triggerText: 'Open Drawer',
    title: 'Drawer Title',
    description: 'Drawer description.',
    direction: 'bottom',
    className: '',
  },
  render: (props) => {
    const p = props as any;
    return (
      <Drawer direction={p.direction}>
        <DrawerTrigger asChild>
          <Button variant="outline" className={p.className}>{p.triggerText}</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{p.title}</DrawerTitle>
            <DrawerDescription>{p.description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4" />
        </DrawerContent>
      </Drawer>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'triggerText', label: 'Trigger Text', type: 'text' }),
      createCustomField({ key: 'title', label: 'Title', type: 'text' }),
      createCustomField({ key: 'description', label: 'Description', type: 'textarea' }),
      createCustomField({ key: 'direction', label: 'Direction', type: 'select', options: ['bottom', 'top', 'left', 'right'] }),
    ],
  },
};
