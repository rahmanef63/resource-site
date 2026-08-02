import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Toggle } from '@/components/ui/toggle';
import { ToggleLeft } from 'lucide-react';

export const toggleManifest: WidgetConfig = {
  label: 'Toggle',
  category: 'Components',
  description: 'Two-state toggle button.',
  icon: ToggleLeft,
  defaults: { text: 'Toggle', variant: 'default', size: 'default', className: '' },
  render: (props) => (
    <Toggle
      variant={(props as any).variant}
      size={(props as any).size}
      className={(props as any).className}
    >
      {(props as any).text}
    </Toggle>
  ),
  inspector: {
    fields: [
      createCustomField({ key: 'text', label: 'Label', type: 'text' }),
      createCustomField({ key: 'variant', label: 'Variant', type: 'select', options: ['default', 'outline'] }),
      createCustomField({ key: 'size', label: 'Size', type: 'select', options: ['default', 'sm', 'lg'] }),
    ],
  },
};
