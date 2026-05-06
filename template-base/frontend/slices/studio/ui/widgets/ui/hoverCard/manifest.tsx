import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { HoverCardWidget } from './HoverCardWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const hoverCardManifest: WidgetConfig = {
    label: "Hover Card",
    category: "UI",
    description: "Rich hover preview card for additional context.",
    icon: resolveWidgetIcon(undefined, 'UI', 'hoverCard'),
    defaults: {
        triggerText: 'Hover me',
        title: 'Hover Card Title',
        description: 'This is the hover card content that appears when you hover over the trigger.',
        side: 'bottom',
        openDelay: 200,
        className: '',
    },
    render: (props, children) => <HoverCardWidget {...(props as any)}>{children}</HoverCardWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'triggerText',
                    label: 'Trigger Text',
                    type: 'text',
                    placeholder: 'Hover me',
                }),
                createCustomField({
                    key: 'title',
                    label: 'Card Title',
                    type: 'text',
                    placeholder: 'Hover Card Title',
                }),
                createCustomField({
                    key: 'description',
                    label: 'Card Description',
                    type: 'textarea',
                    placeholder: 'Description...',
                }),
                createCustomField({
                    key: 'side',
                    label: 'Position',
                    type: 'select',
                    options: ['top', 'right', 'bottom', 'left'],
                }),
                createCustomField({
                    key: 'openDelay',
                    label: 'Open Delay (ms)',
                    type: 'number',
                    placeholder: '200',
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};

