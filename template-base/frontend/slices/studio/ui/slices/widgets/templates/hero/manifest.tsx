import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { HeroWidget } from './HeroWidget';
import React from 'react';

export const heroManifest: WidgetConfig = {
  label: "Hero (L→R)",
  category: "Templates",
  description: "A classic hero section with text and an image.",
  icon: "RectangleHorizontal",
  defaults: {
    title: "Build faster with your Super Workspace",
    subtitle: "Composable widgets, live JSON schema, and shadcn-style UI.",
    ctaText: "Open Dashboard",
    ctaHref: "/dashboard",
    imageUrl: "https://picsum.photos/seed/hero/800/600",
    reverse: false,
    className: "rounded-3xl bg-gradient-to-br from-muted to-background border border-border",
  },
  render: (props) => <HeroWidget {...props} />,
  inspector: {
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder: 'Build faster with your Super Workspace'
      },
      {
        key: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        placeholder: 'Composable widgets, live JSON schema, and shadcn-style UI.'
      },
      {
        key: 'ctaText',
        label: 'CTA Text',
        type: 'text',
        placeholder: 'Open Dashboard'
      },
      {
        key: 'ctaHref',
        label: 'CTA Href',
        type: 'text',
        placeholder: '/dashboard'
      },
      {
        key: 'imageUrl',
        label: 'Image URL',
        type: 'text',
        placeholder: 'https://picsum.photos/seed/hero/800/600'
      },
      {
        key: 'reverse',
        label: 'Reverse (R→L)',
        type: 'switch'
      },
      {
        key: 'className',
        label: 'CSS Classes',
        type: 'text'
      }
    ]
  }
};
