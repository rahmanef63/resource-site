/**
 * Switch Node
 * 
 * Route to different branches based on value.
 */

import { ArrowRightLeft } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    mode: {
        type: 'select',
        default: 'value',
        label: 'Mode',
        options: ['value', 'expression', 'regex'],
    },
    dataToSwitch: {
        type: 'textarea',
        default: '',
        label: 'Data to Evaluate',
        placeholder: '{{ $node.prev.data.type }}',
    },
    case1Value: {
        type: 'text',
        default: '',
        label: 'Case 1: Value',
        placeholder: 'typeA',
    },
    case2Value: {
        type: 'text',
        default: '',
        label: 'Case 2: Value',
        placeholder: 'typeB',
    },
    case3Value: {
        type: 'text',
        default: '',
        label: 'Case 3: Value',
        placeholder: 'typeC',
        advanced: true,
    },
    fallbackOutput: {
        type: 'select',
        default: 'default',
        label: 'Fallback',
        options: ['default', 'none', 'error'],
        advanced: true,
    },
};

export const switchManifest: NodeManifest = {
    key: 'flow.switch',
    label: 'Switch',
    category: 'Logic',
    description: 'Route to different branches based on value',
    icon: ArrowRightLeft,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Switch Configuration'),
};
