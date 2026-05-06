/**
 * HTTP Respond Node
 * 
 * Send response back to webhook caller.
 */

import { Send } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    statusCode: {
        type: 'number',
        default: 200,
        label: 'Status Code',
        placeholder: '200',
    },
    respondWith: {
        type: 'select',
        default: 'json',
        label: 'Response Type',
        options: ['json', 'text', 'binary', 'lastNodeData'],
        description: '"lastNodeData" uses output from previous node',
    },
    headers: {
        type: 'textarea',
        default: '{}',
        label: 'Response Headers (JSON)',
        placeholder: '{}',
    },
    body: {
        type: 'textarea',
        default: '{"success": true}',
        label: 'Response Body',
        placeholder: '{"success": true, "data": ...}',
    },
};

export const httpRespondManifest: NodeManifest = {
    key: 'http.respond',
    label: 'Respond to Webhook',
    category: 'HTTP',
    description: 'Send response back to webhook caller',
    icon: Send,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Response Configuration'),
};
