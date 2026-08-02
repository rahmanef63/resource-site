import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { SeparatorWidget } from './SeparatorWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const separatorManifest: WidgetConfig = {
    label: "Separator",
    category: "UI",
    description: "Visual divider line for separating content sections.",
    icon: resolveWidgetIcon(undefined, 'UI', 'separator'),
    defaults: {
        orientation: 'horizontal',
        decorative: true,
        margin: 'md',
        className: '',
    },
    render: (props) => <SeparatorWidget {...(props as any)} />,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'orientation',
                    label: 'Orientation',
                    type: 'select',
                    options: ['horizontal', 'vertical'],
                }),
                createCustomField({
                    key: 'decorative',
                    label: 'Decorative',
                    type: 'switch',
                }),
                createCustomField({
                    key: 'margin',
                    label: 'Margin',
                    type: 'select',
                    options: ['none', 'sm', 'md', 'lg'],
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};

