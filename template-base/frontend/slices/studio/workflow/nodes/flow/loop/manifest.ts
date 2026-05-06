/**
 * Loop Node
 * 
 * Process each item in an array.
 */

import { Repeat } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    batchSize: {
        type: 'number',
        default: 1,
        label: 'Batch Size',
        placeholder: '1',
        description: 'Number of items to process at once',
    },
    execution: {
        type: 'select',
        default: 'sequential',
        label: 'Execution',
        options: ['sequential', 'parallel'],
        description: 'Sequential waits for each item, parallel runs all together',
    },
    maxIterations: {
        type: 'number',
        default: 100,
        label: 'Max Iterations',
        placeholder: '100',
        description: 'Safety limit for iterations (optional)',
        advanced: true,
    },
};

export const loopManifest: NodeManifest = {
    key: 'flow.loop',
    label: 'Loop Over Items',
    category: 'Logic',
    description: 'Process each item in an array',
    icon: Repeat,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Loop Configuration'),
};
