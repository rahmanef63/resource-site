import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { CollapsibleWidget } from './CollapsibleWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const collapsibleManifest: WidgetConfig = {
    label: "Collapsible",
    category: "UI",
    description: "Expandable/collapsible section with toggle button.",
    icon: resolveWidgetIcon(undefined, 'UI', 'collapsible'),
    defaults: {
        triggerText: 'Toggle content',
        defaultOpen: false,
        className: '',
    },
    render: (props, children) => <CollapsibleWidget {...(props as any)}>{children}</CollapsibleWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'triggerText',
                    label: 'Trigger Text',
                    type: 'text',
                    placeholder: 'Toggle content',
                }),
                createCustomField({
                    key: 'defaultOpen',
                    label: 'Default Open',
                    type: 'switch',
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};

