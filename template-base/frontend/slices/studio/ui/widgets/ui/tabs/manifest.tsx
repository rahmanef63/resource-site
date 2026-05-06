import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { TabsWidget } from './TabsWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const tabsManifest: WidgetConfig = {
    label: "Tabs",
    category: "UI",
    description: "Tabbed content sections using shadcn/ui Tabs.",
    icon: resolveWidgetIcon(undefined, 'UI', 'tabs'),
    defaults: {
        tabs: 'Tab 1,Tab 2,Tab 3',
        defaultTab: '',
        orientation: 'horizontal',
        className: '',
    },
    render: (props, children) => <TabsWidget {...(props as any)}>{children}</TabsWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'tabs',
                    label: 'Tab Names (comma-separated)',
                    type: 'text',
                    placeholder: 'Tab 1,Tab 2,Tab 3',
                }),
                createCustomField({
                    key: 'defaultTab',
                    label: 'Default Tab',
                    type: 'text',
                    placeholder: 'Tab 1',
                }),
                createCustomField({
                    key: 'orientation',
                    label: 'Orientation',
                    type: 'select',
                    options: ['horizontal', 'vertical'],
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};

