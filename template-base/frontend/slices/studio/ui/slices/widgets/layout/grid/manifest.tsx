import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { GridWidget } from './GridWidget';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const gridManifest: WidgetConfig = {
    label: "Grid",
    category: "Layout",
    description: "CSS Grid layout container with configurable columns and gap.",
    icon: resolveWidgetIcon(undefined, 'Layout', 'grid'),
    defaults: {
        columns: '3',
        gap: 'md',
        placeItems: 'stretch',
        className: '',
    },
    render: (props, children) => <GridWidget {...props}>{children}</GridWidget>,
    inspector: {
        fields: [
            { key: 'columns',    label: 'Columns',     type: 'select', options: ['1', '2', '3', '4', '5', '6', '12'] },
            { key: 'gap',        label: 'Gap',         type: 'select', options: ['none', 'sm', 'md', 'lg', 'xl'] },
            { key: 'placeItems', label: 'Place Items', type: 'select', options: ['start', 'center', 'end', 'stretch'] },
            { key: 'className',  label: 'CSS Classes', type: 'text',   placeholder: 'w-full ...' },
        ],
    },
};
