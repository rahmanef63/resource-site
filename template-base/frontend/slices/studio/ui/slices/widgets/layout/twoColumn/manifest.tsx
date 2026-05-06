import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { TwoColumnWidget } from './TwoColumnWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const twoColumnManifest: WidgetConfig = {
    label: "Two Column",
    category: "Layout",
    description: "Two-panel split layout with configurable ratios.",
    icon: resolveWidgetIcon(undefined, 'Layout', 'twoColumn'),
    defaults: {
        splitRatio: '50-50',
        orientation: 'horizontal',
        gap: 'md',
        leftLabel: 'Left',
        rightLabel: 'Right',
        className: '',
    },
    slots: [
        { id: 'left', label: 'Left' },
        { id: 'right', label: 'Right' },
    ],
    render: (props, children) => <TwoColumnWidget {...props}>{children}</TwoColumnWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'splitRatio',
                    label: 'Split Ratio',
                    type: 'select',
                    options: ['50-50', '33-67', '67-33', '25-75', '75-25'],
                }),
                createCustomField({
                    key: 'orientation',
                    label: 'Orientation',
                    type: 'select',
                    options: ['horizontal', 'vertical'],
                }),
                createCustomField({
                    key: 'gap',
                    label: 'Gap',
                    type: 'select',
                    options: ['none', 'sm', 'md', 'lg'],
                }),
                createCustomField({
                    key: 'leftLabel',
                    label: 'Left Panel Label',
                    type: 'text',
                    placeholder: 'Left',
                }),
                createCustomField({
                    key: 'rightLabel',
                    label: 'Right Panel Label',
                    type: 'text',
                    placeholder: 'Right',
                }),
            ],
            createInspectorFieldGroups.layout()
        ),
    },
};
