import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';

export const labelManifest: WidgetConfig = {
  label: 'Label',
  category: 'Components',
  description: 'Accessible form label.',
  icon: Tag,
  defaults: { text: 'Label', htmlFor: '', className: '' },
  render: (props) => (
    <Label htmlFor={(props as any).htmlFor} className={(props as any).className}>
      {(props as any).text}
    </Label>
  ),
  inspector: {
    fields: [
      createCustomField({ key: 'text', label: 'Text', type: 'text' }),
      createCustomField({ key: 'htmlFor', label: 'For (id)', type: 'text' }),
    ],
  },
};
