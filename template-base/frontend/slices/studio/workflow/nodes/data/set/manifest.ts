/**
 * Set Variable Node
 * 
 * Set or create a variable in workflow context.
 */

import { Variable } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    variableName: {
        type: 'text',
        default: 'myVariable',
        label: 'Variable Name',
        placeholder: 'myVariable',
    },
    valueType: {
        type: 'select',
        default: 'string',
        label: 'Value Type',
        options: ['string', 'number', 'boolean', 'object', 'array'],
    },
    value: {
        type: 'textarea',
        default: '',
        label: 'Value',
        placeholder: '{{ $node.prev.data.result }}',
    },
    keepOnlySet: {
        type: 'switch',
        default: false,
        label: 'Keep Only This Value',
        description: 'Remove other data and keep only this variable',
        advanced: true,
    },
};

export const setVariableManifest: NodeManifest = {
    key: 'data.set',
    label: 'Set Variable',
    category: 'Data',
    description: 'Set or create a variable in workflow context',
    icon: Variable,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Variable Configuration'),
};
