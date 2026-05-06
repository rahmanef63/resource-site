import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { ButtonWidget } from './ButtonWidget';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const buttonManifest: WidgetConfig = {
  label: "Button",
  category: "Action",
  description: "Interactive button for user actions.",
  icon: resolveWidgetIcon(undefined, 'Action', 'button'),
  defaults: {
    text: "Button",
    variant: "default",
    size: "md",
    href: "",
    className: "",
    icon: "",
    iconPosition: "left",
    disabled: false,
    fullWidth: false,
    rounded: "md",
    shadow: "sm",
    animation: "none",
    gradient: false,
  },
  render: (p, children) => <ButtonWidget {...p}>{children}</ButtonWidget>,
  inspector: {
    fields: [
      { key: 'text',         label: 'Button Text',       type: 'text',   placeholder: 'Button' },
      { key: 'href',         label: 'Link URL',           type: 'text',   placeholder: 'https://example.com' },
      { key: 'variant',      label: 'Variant',            type: 'select', options: ['default', 'primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'] },
      { key: 'size',         label: 'Size',               type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { key: 'icon',         label: 'Icon (emoji/text)',  type: 'text',   placeholder: '🚀' },
      { key: 'iconPosition', label: 'Icon Position',      type: 'select', options: ['left', 'right', 'top', 'bottom'] },
      { key: 'fullWidth',    label: 'Full Width',         type: 'switch' },
      { key: 'disabled',     label: 'Disabled',           type: 'switch' },
      { key: 'gradient',     label: 'Gradient BG',        type: 'switch' },
      { key: 'animation',    label: 'Animation',          type: 'select', options: ['none', 'bounce', 'pulse', 'ping', 'spin'] },
      { key: 'className',    label: 'CSS Classes',        type: 'text',   placeholder: 'bg-blue-600 text-white ...' },
    ]
  }
};
