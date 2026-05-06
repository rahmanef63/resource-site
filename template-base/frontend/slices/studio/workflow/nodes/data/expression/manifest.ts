/**
 * Expression Node
 * 
 * Evaluate expressions and template strings.
 */

import { Braces } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    expression: {
        type: 'textarea',
        default: '{{ $node["Previous"].data.field }}',
        label: 'Expression',
        placeholder: '{{ $node["HTTP Request"].data.response.id }}',
        description: 'Use {{ }} for expressions. Access node data with $node["NodeName"]',
    },
    outputName: {
        type: 'text',
        default: 'result',
        label: 'Output Variable',
        placeholder: 'result',
        description: 'Name for the output variable',
    },
};

export const expressionManifest: NodeManifest = {
    key: 'data.expression',
    label: 'Expression',
    category: 'Data',
    description: 'Evaluate expressions and template strings',
    icon: Braces,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Expression Configuration'),
};
