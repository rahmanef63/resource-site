import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import React from 'react';

export const navGroupManifest: WidgetConfig = {
  label: "Nav Group",
  category: "Navigation",
  description: "A logical container for navigation items.",
  icon: "FolderKanban",
  defaults: { 
    title: "Navigation",
    placement: "sidebar",
    className: "p-4"
  },
  render: () => null, // This component is logical, its props are used by the Renderer
  inspector: {
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder: 'Navigation'
      },
      {
        key: 'placement',
        label: 'Placement',
        type: 'select',
        options: ['header', 'sidebar', 'footer', 'floating']
      },
      {
        key: 'className',
        label: 'CSS Classes',
        type: 'text'
      }
    ]
  }
};
