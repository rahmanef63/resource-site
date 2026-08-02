import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelRight } from 'lucide-react';

export const sheetManifest: WidgetConfig = {
  label: 'Sheet',
  category: 'Components',
  description: 'Slide-over side panel (drawer variant).',
  icon: PanelRight,
  defaults: {
    triggerText: 'Open Sheet',
    title: 'Sheet Title',
    description: 'Sheet description.',
    side: 'right',
    className: '',
  },
  render: (props) => {
    const p = props as any;
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className={p.className}>{p.triggerText}</Button>
        </SheetTrigger>
        <SheetContent side={p.side}>
          <SheetHeader>
            <SheetTitle>{p.title}</SheetTitle>
            <SheetDescription>{p.description}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'triggerText', label: 'Trigger Text', type: 'text' }),
      createCustomField({ key: 'title', label: 'Title', type: 'text' }),
      createCustomField({ key: 'description', label: 'Description', type: 'textarea' }),
      createCustomField({ key: 'side', label: 'Side', type: 'select', options: ['top', 'right', 'bottom', 'left'] }),
    ],
  },
};
