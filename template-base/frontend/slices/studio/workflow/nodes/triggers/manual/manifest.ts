/**
 * Manual Trigger Node
 * 
 * Start workflow manually with custom input data.
 */

import { Play } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    name: {
        type: 'text',
        default: 'Manual Run',
        label: 'Trigger Name',
        placeholder: 'My Trigger',
    },
    inputData: {
        type: 'textarea',
        default: '{}',
        label: 'Input Data (JSON)',
        placeholder: '{"key": "value"}',
        description: 'Initial data passed to the workflow',
    },
};

export const manualTriggerManifest: NodeManifest = {
    key: 'trigger.manual',
    label: 'Manual Trigger',
    category: 'Trigger',
    description: 'Start workflow manually with custom input data',
    icon: Play,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Manual Trigger'),
};
