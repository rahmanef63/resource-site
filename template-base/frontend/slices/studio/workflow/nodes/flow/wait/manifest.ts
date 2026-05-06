/**
 * Wait / Delay Node
 * 
 * Pause workflow execution.
 */

import { Timer } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    amount: {
        type: 'number',
        default: 1,
        label: 'Wait Time',
        placeholder: '5',
    },
    unit: {
        type: 'select',
        default: 'seconds',
        label: 'Unit',
        options: ['milliseconds', 'seconds', 'minutes', 'hours'],
    },
    resumeType: {
        type: 'select',
        default: 'afterDelay',
        label: 'Resume On',
        options: ['afterDelay', 'webhook', 'specificTime'],
        advanced: true,
    },
};

export const waitManifest: NodeManifest = {
    key: 'flow.wait',
    label: 'Wait / Delay',
    category: 'Logic',
    description: 'Pause workflow execution',
    icon: Timer,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Wait Configuration'),
};
