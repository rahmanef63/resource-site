import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { SelectWidget } from './SelectWidget';
import React from 'react';
import { ChevronDown } from 'lucide-react';

const selectInspectorConfig: InspectorField[] = [
    {
        key: 'label',
        label: 'Label',
        type: 'text',
        placeholder: 'Field label',
    },
    {
        key: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        placeholder: 'Choose an option',
    },
    {
        key: 'options',
        label: 'Options (comma-separated)',
        type: 'textarea',
        placeholder: 'Option 1, Option 2, Option 3',
    },
    {
        key: 'value',
        label: 'Default Value',
        type: 'text',
        placeholder: 'Default selected value',
    },
    {
        key: 'required',
        label: 'Required',
        type: 'switch',
    },
    {
        key: 'disabled',
        label: 'Disabled',
        type: 'switch',
    },
];

export const selectManifest: WidgetConfig = {
    label: 'Select',
    category: 'Form',
    description: 'A dropdown select field for choosing from a list of options.',
    icon: ChevronDown,
    tags: ['ui', 'form', 'input', 'dropdown', 'select'],
    defaults: {
        label: 'Select',
        placeholder: 'Choose an option',
        options: 'Option 1, Option 2, Option 3',
        value: '',
        required: false,
        disabled: false,
    },
    render: (props) => <SelectWidget {...(props as any)} />,
    inspector: {
        fields: selectInspectorConfig,
    },
};

