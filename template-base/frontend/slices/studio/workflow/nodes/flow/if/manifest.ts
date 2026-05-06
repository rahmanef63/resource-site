/**
 * IF / Condition Node
 * 
 * Branch workflow based on conditions.
 */

import { GitBranch } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    leftValue: {
        type: 'text',
        default: '',
        label: 'Left Value',
        placeholder: '{{ $node.prev.data.value }}',
    },
    operator: {
        type: 'select',
        default: 'equals',
        label: 'Operator',
        options: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'gt', 'gte', 'lt', 'lte', 'isEmpty', 'isNotEmpty'],
    },
    rightValue: {
        type: 'text',
        default: '',
        label: 'Right Value',
        placeholder: 'expected value',
    },
    combineWith: {
        type: 'select',
        default: 'AND',
        label: 'Combine Multiple Conditions',
        options: ['AND', 'OR'],
        advanced: true,
    },
};

export const ifConditionManifest: NodeManifest = {
    key: 'flow.if',
    label: 'IF / Condition',
    category: 'Logic',
    description: 'Branch workflow based on conditions',
    icon: GitBranch,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Condition'),
};
