import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { FlexWidget } from './FlexWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const flexManifest: WidgetConfig = {
    label: "Flex",
    category: "Layout",
    description: "Flexbox layout container with configurable direction, alignment, and gap.",
    icon: resolveWidgetIcon(undefined, 'Layout', 'flex'),
    defaults: {
        direction: 'row',
        justify: 'start',
        align: 'stretch',
        wrap: 'nowrap',
        gap: 'md',
        className: '',
    },
    render: (props, children) => <FlexWidget {...props}>{children}</FlexWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'direction',
                    label: 'Direction',
                    type: 'select',
                    options: ['row', 'column', 'row-reverse', 'column-reverse'],
                }),
                createCustomField({
                    key: 'justify',
                    label: 'Justify Content',
                    type: 'select',
                    options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
                }),
                createCustomField({
                    key: 'align',
                    label: 'Align Items',
                    type: 'select',
                    options: ['start', 'center', 'end', 'stretch', 'baseline'],
                }),
                createCustomField({
                    key: 'wrap',
                    label: 'Flex Wrap',
                    type: 'select',
                    options: ['nowrap', 'wrap', 'wrap-reverse'],
                }),
                createCustomField({
                    key: 'gap',
                    label: 'Gap',
                    type: 'select',
                    options: ['none', 'sm', 'md', 'lg', 'xl'],
                }),
            ],
            createInspectorFieldGroups.layout()
        ),
    },
};
