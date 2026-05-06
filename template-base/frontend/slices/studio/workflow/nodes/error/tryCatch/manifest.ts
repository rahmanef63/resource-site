/**
 * Try/Catch Node
 * 
 * Handle errors in workflow execution.
 */

import { ShieldAlert } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    continueOnFail: {
        type: 'switch',
        default: false,
        label: 'Continue On Fail',
        description: 'Continue workflow even if this node fails',
    },
    errorOutput: {
        type: 'select',
        default: 'errorBranch',
        label: 'Error Output',
        options: ['errorBranch', 'errorWorkflow', 'stop'],
        description: 'What to do when an error occurs',
    },
};

export const tryCatchManifest: NodeManifest = {
    key: 'error.tryCatch',
    label: 'Try / Catch',
    category: 'Error',
    description: 'Handle errors in workflow execution',
    icon: ShieldAlert,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Error Handling'),
};
