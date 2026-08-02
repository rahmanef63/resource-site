import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { TextWidget } from './TextWidget';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const textManifest: WidgetConfig = {
  label: "Text",
  category: "Content",
  description: "A versatile text block with many styling options.",
  icon: resolveWidgetIcon(undefined, 'Content', 'text'),
  defaults: {
    tag: "p",
    content: "Text content",
    className: "",
  },
  render: (p, children) => <TextWidget {...p}>{children}</TextWidget>,
  inspector: {
    fields: [
      { key: 'tag',       label: 'HTML Tag',  type: 'select',   options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'strong', 'em', 'small'] },
      { key: 'content',   label: 'Content',   type: 'textarea', placeholder: 'Text content' },
      { key: 'truncate',  label: 'Truncate',  type: 'switch' },
      { key: 'whitespace', label: 'Whitespace', type: 'select', options: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap'] },
      { key: 'className', label: 'CSS Classes', type: 'text',   placeholder: 'text-4xl font-bold text-white ...' },
    ]
  }
};
