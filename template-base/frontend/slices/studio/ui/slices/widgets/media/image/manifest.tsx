import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { ImageWidget } from './ImageWidget';
import React from 'react';

export const imageManifest: WidgetConfig = {
  label: "Image",
  category: "Media",
  description: "Displays an image from a URL.",
  icon: "Image",
  defaults: { 
    src: "https://picsum.photos/640/420", 
    alt: "placeholder", 
    width: "640", 
    height: "420", 
    rounded: true, 
    className: "w-full h-auto",
    objectFit: "cover"
  },
  render: (props) => <ImageWidget {...props} />,
  inspector: {
    fields: [
      {
        key: 'src',
        label: 'Image URL',
        type: 'text',
        placeholder: 'https://picsum.photos/640/420'
      },
      {
        key: 'alt',
        label: 'Alt Text',
        type: 'text',
        placeholder: 'Image description'
      },
      {
        key: 'width',
        label: 'Width',
        type: 'text',
        placeholder: '640'
      },
      {
        key: 'height',
        label: 'Height',
        type: 'text',
        placeholder: '420'
      },
      {
        key: 'objectFit',
        label: 'Object Fit',
        type: 'select',
        options: ['cover', 'contain', 'fill', 'none', 'scale-down']
      },
      {
        key: 'rounded',
        label: 'Rounded',
        type: 'switch'
      },
      {
        key: 'className',
        label: 'CSS Classes',
        type: 'text',
        placeholder: 'w-full h-auto'
      }
    ]
  }
};
