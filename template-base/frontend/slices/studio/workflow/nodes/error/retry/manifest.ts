/**
 * Retry Node
 * 
 * Retry failed node execution.
 */

import { RefreshCcw } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    maxRetries: {
        type: 'number',
        default: 3,
        label: 'Max Retries',
        placeholder: '3',
        description: 'Maximum number of retry attempts',
    },
    waitBetweenRetries: {
        type: 'number',
        default: 1000,
        label: 'Wait Between (ms)',
        placeholder: '1000',
        description: 'Time to wait between retries',
    },
    retryOn: {
        type: 'select',
        default: 'allErrors',
        label: 'Retry On',
        options: ['allErrors', 'specificErrors', 'timeout'],
        advanced: true,
    },
};

export const retryManifest: NodeManifest = {
    key: 'error.retry',
    label: 'Retry on Error',
    category: 'Error',
    description: 'Retry failed node execution',
    icon: RefreshCcw,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Retry Configuration'),
};
