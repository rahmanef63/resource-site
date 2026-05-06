import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { HeadingWidget } from './HeadingWidget';
import React from 'react';
import { Heading } from 'lucide-react';

/**
 * Heading Widget Manifest
 * 
 * SSOT: Centralized configuration
 * Dynamic: Level, size, alignment, weight all configurable
 */

// SSOT: Inspector fields
const headingInspectorConfig: InspectorField[] = [
    {
        key: 'content',
        label: 'Content',
        type: 'text',
        placeholder: 'Heading text',
    },
    {
        key: 'level',
        label: 'Semantic Level',
        type: 'select',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    {
        key: 'size',
        label: 'Visual Size',
        type: 'select',
        options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    {
        key: 'align',
        label: 'Alignment',
        type: 'select',
        options: ['left', 'center', 'right'],
    },
    {
        key: 'weight',
        label: 'Weight',
        type: 'select',
        options: ['normal', 'medium', 'semibold', 'bold'],
    },
];

// SSOT: Default values
const DEFAULTS = {
    level: 'h2',
    content: 'Heading',
    align: 'left',
    size: undefined, // Uses level default
    weight: 'bold',
} as const;

export const headingManifest: WidgetConfig = {
    label: 'Heading',
    category: 'UI',
    description: 'A semantic heading element with configurable level, size, and styling.',
    icon: Heading,
    tags: ['ui', 'text', 'heading', 'title', 'typography'],
    defaults: { ...DEFAULTS },
    render: (props) => <HeadingWidget {...(props as any)} />,
    inspector: {
        fields: headingInspectorConfig,
    },
};

