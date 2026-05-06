import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { InputWidget } from './InputWidget';
import React from 'react';
import { TextCursorInput } from 'lucide-react';

const inputInspectorConfig: InspectorField[] = [
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
        placeholder: 'Enter placeholder text',
    },
    {
        key: 'type',
        label: 'Input Type',
        type: 'select',
        options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    {
        key: 'value',
        label: 'Default Value',
        type: 'text',
        placeholder: 'Default value',
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

export const inputManifest: WidgetConfig = {
    label: 'Input',
    category: 'Form',
    description: 'A text input field for forms with support for multiple input types.',
    icon: TextCursorInput,
    tags: ['ui', 'form', 'input', 'text'],
    defaults: {
        label: 'Label',
        placeholder: 'Enter text...',
        type: 'text',
        value: '',
        required: false,
        disabled: false,
    },
    render: (props) => <InputWidget {...(props as any)} />,
    inspector: {
        fields: inputInspectorConfig,
    },
};

