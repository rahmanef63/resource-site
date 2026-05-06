import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { ColumnWidget } from './ColumnWidget';
import React from 'react';

export const columnManifest: WidgetConfig = {
  label: "Column",
  category: "Layout",
  description: "A column within a grid layout.",
  icon: "Columns",
  defaults: { 
    className: "col-span-12 md:col-span-6" 
  },
  render: (props, children) => <ColumnWidget {...props}>{children}</ColumnWidget>,
  inspector: {
    fields: [
      {
        key: 'className',
        label: 'CSS Classes',
        type: 'text',
        placeholder: 'col-span-12 md:col-span-6'
      }
    ]
  }
};
