import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { RowWidget } from './RowWidget';
import React from 'react';

export const rowManifest: WidgetConfig = {
  label: "Row",
  category: "Layout",
  description: "A row within a grid layout.",
  icon: "Rows",
  defaults: { 
    className: "grid grid-cols-12 gap-6" 
  },
  render: (props, children) => <RowWidget {...props}>{children}</RowWidget>,
  inspector: {
    fields: [
      {
        key: 'className',
        label: 'CSS Classes',
        type: 'text',
        placeholder: 'grid grid-cols-12 gap-6'
      }
    ]
  }
};
