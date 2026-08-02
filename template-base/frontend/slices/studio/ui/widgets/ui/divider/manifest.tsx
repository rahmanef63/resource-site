import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { DividerWidget } from './DividerWidget';
import React from 'react';
import { Minus } from 'lucide-react';

/**
 * Divider Widget Manifest
 * 
 * SSOT: All widget configuration centralized here
 * Dynamic: All properties configurable via inspector
 */

// SSOT: Inspector field definitions
const dividerInspectorConfig: InspectorField[] = [
    {
        key: 'orientation',
        label: 'Orientation',
        type: 'select',
        options: ['horizontal', 'vertical'],
    },
    {
        key: 'spacing',
        label: 'Spacing',
        type: 'select',
        options: ['none', 'sm', 'md', 'lg'],
    },
    {
        key: 'decorative',
        label: 'Decorative Only',
        type: 'switch',
    },
];

// SSOT: Default values
const DEFAULTS = {
    orientation: 'horizontal',
    spacing: 'md',
    decorative: true,
} as const;

export const dividerManifest: WidgetConfig = {
    label: 'Divider',
    category: 'UI',
    description: 'A horizontal or vertical separator line to divide content sections.',
    icon: Minus,
    tags: ['ui', 'layout', 'separator', 'divider'],
    defaults: { ...DEFAULTS },
    render: (props) => <DividerWidget {...(props as any)} />,
    inspector: {
        fields: dividerInspectorConfig,
    },
};

