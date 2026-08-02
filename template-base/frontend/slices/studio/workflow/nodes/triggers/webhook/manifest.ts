/**
 * Webhook Trigger Node
 * 
 * Receive HTTP requests to trigger workflow.
 */

import { Webhook } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { authSection } from '../../../inspectors';

const props: PropsConfig = {
    path: {
        type: 'text',
        default: '/webhook/my-workflow',
        label: 'Webhook Path',
        placeholder: '/webhook/my-workflow',
    },
    method: {
        type: 'select',
        default: 'POST',
        label: 'HTTP Method',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    responseMode: {
        type: 'select',
        default: 'onReceived',
        label: 'Response Mode',
        description: '"onReceived" responds immediately, "lastNode" waits for workflow completion',
        options: ['onReceived', 'lastNode'],
    },
    authType: {
        type: 'select',
        default: 'none',
        label: 'Authentication',
        options: ['none', 'basic', 'bearer', 'apiKey'],
        advanced: true,
    },
};

export const webhookTriggerManifest: NodeManifest = {
    key: 'trigger.webhook',
    label: 'Webhook Trigger',
    category: 'Trigger',
    description: 'Receive HTTP requests to trigger workflow',
    icon: Webhook,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: {
        sections: [
            { title: 'Webhook Configuration', fields: [] },
            ...getInspectorFromProps(props, 'Webhook Configuration').sections || [],
            authSection,
        ],
    },
};
