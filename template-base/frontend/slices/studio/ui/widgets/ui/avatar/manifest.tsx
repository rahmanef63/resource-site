import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { AvatarWidget } from './AvatarWidget';
import React from 'react';
import { User } from 'lucide-react';

const avatarInspectorConfig: InspectorField[] = [
  {
    key: 'src',
    label: 'Image URL',
    type: 'text',
    placeholder: 'https://example.com/avatar.jpg',
  },
  {
    key: 'alt',
    label: 'Alt Text',
    type: 'text',
    placeholder: 'Avatar description',
  },
  {
    key: 'fallback',
    label: 'Fallback Text',
    type: 'text',
    placeholder: 'CN',
  },
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    options: ['sm', 'md', 'lg'],
  },
];

export const avatarManifest: WidgetConfig = {
  label: 'Avatar',
  category: 'UI',
  description: 'An image element with a fallback for representing a user.',
  icon: User,
  tags: ['ui', 'user', 'profile'],
  defaults: {
    src: '',
    alt: 'Avatar',
    fallback: 'CN',
    size: 'md',
  },
  render: (props) => <AvatarWidget {...(props as any)} />,
  inspector: {
    fields: avatarInspectorConfig,
  },
};

