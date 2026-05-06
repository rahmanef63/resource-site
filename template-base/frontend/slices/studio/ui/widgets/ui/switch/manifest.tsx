import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { SwitchWidget } from './SwitchWidget';
import React from 'react';
import { ToggleLeft } from 'lucide-react';

const switchInspectorConfig: InspectorField[] = [
    {
        key: 'label',
        label: 'Label',
        type: 'text',
        placeholder: 'Switch label',
    },
    {
        key: 'description',
        label: 'Description',
        type: 'text',
        placeholder: 'Optional description',
    },
    {
        key: 'checked',
        label: 'Default Checked',
        type: 'switch',
    },
    {
        key: 'disabled',
        label: 'Disabled',
        type: 'switch',
    },
];

export const switchManifest: WidgetConfig = {
    label: 'Switch',
    category: 'Form',
    description: 'A toggle switch for boolean on/off states.',
    icon: ToggleLeft,
    tags: ['ui', 'form', 'input', 'toggle', 'switch'],
    defaults: {
        label: 'Toggle',
        description: '',
        checked: false,
        disabled: false,
    },
    render: (props) => <SwitchWidget {...(props as any)} />,
    inspector: {
        fields: switchInspectorConfig,
    },
};

