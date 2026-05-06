/**
 * Code / Function Node
 * 
 * Execute custom JavaScript code.
 */

import { Code } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    mode: {
        type: 'select',
        default: 'runOnceForAllItems',
        label: 'Run Mode',
        options: ['runOnceForAllItems', 'runOnceForEachItem'],
        description: '"runOnceForAllItems" processes all data together, "runOnceForEachItem" runs for each item',
    },
    language: {
        type: 'select',
        default: 'javascript',
        label: 'Language',
        options: ['javascript'],
    },
    code: {
        type: 'code',
        default: '// Access input data with $input\n// Return data to pass to next node\nreturn $input.all();',
        label: 'Code',
        placeholder: '// Your JavaScript code here\nreturn items;',
        description: 'Available: $input, $node, $env, $json',
    },
};

export const codeManifest: NodeManifest = {
    key: 'data.code',
    label: 'Code / Function',
    category: 'Data',
    description: 'Execute custom JavaScript code',
    icon: Code,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Code Configuration'),
};
