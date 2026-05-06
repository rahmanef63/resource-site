import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { SpacerWidget } from './SpacerWidget';
import React from 'react';
import { Space } from 'lucide-react';

/**
 * Spacer Widget Manifest
 * 
 * SSOT: All configuration centralized
 * Dynamic: Size, direction, and custom values configurable
 */

// SSOT: Inspector fields
const spacerInspectorConfig: InspectorField[] = [
    {
        key: 'direction',
        label: 'Direction',
        type: 'select',
        options: ['vertical', 'horizontal'],
    },
    {
        key: 'size',
        label: 'Size',
        type: 'select',
        options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    {
        key: 'customSize',
        label: 'Custom Size (px)',
        type: 'number',
        placeholder: 'Leave empty to use preset size',
    },
];

// SSOT: Default values
const DEFAULTS = {
    size: 'md',
    direction: 'vertical',
    customSize: undefined,
} as const;

export const spacerManifest: WidgetConfig = {
    label: 'Spacer',
    category: 'UI',
    description: 'An empty spacing element for controlling layout gaps.',
    icon: Space,
    tags: ['ui', 'layout', 'spacing', 'gap'],
    defaults: { ...DEFAULTS },
    render: (props) => <SpacerWidget {...(props as any)} />,
    inspector: {
        fields: spacerInspectorConfig,
    },
};

