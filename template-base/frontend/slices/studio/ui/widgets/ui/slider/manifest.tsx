import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';

export const sliderManifest: WidgetConfig = {
  label: 'Slider',
  category: 'Components',
  description: 'Range input slider.',
  icon: SlidersHorizontal,
  defaults: { defaultValue: 50, min: 0, max: 100, step: 1, className: '' },
  render: (props) => (
    <Slider
      defaultValue={[(props as any).defaultValue ?? 50]}
      min={(props as any).min ?? 0}
      max={(props as any).max ?? 100}
      step={(props as any).step ?? 1}
      className={(props as any).className}
    />
  ),
  inspector: {
    fields: [
      createCustomField({ key: 'defaultValue', label: 'Default Value', type: 'number' }),
      createCustomField({ key: 'min', label: 'Min', type: 'number' }),
      createCustomField({ key: 'max', label: 'Max', type: 'number' }),
      createCustomField({ key: 'step', label: 'Step', type: 'number' }),
    ],
  },
};
