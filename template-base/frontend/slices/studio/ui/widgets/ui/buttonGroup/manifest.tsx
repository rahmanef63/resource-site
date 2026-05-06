import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

export const buttonGroupManifest: WidgetConfig = {
  label: 'Button Group',
  category: 'Components',
  description: 'Grouped set of related buttons.',
  icon: Layers,
  defaults: {
    buttons: ['Button 1', 'Button 2', 'Button 3'],
    variant: 'outline',
    size: 'default',
    className: '',
  },
  render: (props) => {
    const buttons: string[] = (props as any).buttons ?? ['Button 1', 'Button 2', 'Button 3'];
    return (
      <ButtonGroup className={(props as any).className}>
        {buttons.map((label, i) => (
          <Button key={i} variant={(props as any).variant ?? 'outline'} size={(props as any).size}>
            {label}
          </Button>
        ))}
      </ButtonGroup>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'variant', label: 'Variant', type: 'select', options: ['default', 'outline', 'secondary', 'ghost'] }),
      createCustomField({ key: 'size', label: 'Size', type: 'select', options: ['default', 'sm', 'lg'] }),
    ],
  },
};
