/**
 * HTTP Request Node
 * 
 * Make HTTP requests to any API.
 */

import { Globe2 } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    method: {
        type: 'select',
        default: 'GET',
        label: 'Method',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    },
    url: {
        type: 'text',
        default: '',
        label: 'URL',
        placeholder: 'https://api.example.com/endpoint',
    },
    headers: {
        type: 'textarea',
        default: '{"Content-Type": "application/json"}',
        label: 'Headers (JSON)',
        placeholder: '{"Content-Type": "application/json"}',
    },
    body: {
        type: 'textarea',
        default: '',
        label: 'Request Body',
        placeholder: '{"key": "value"}',
    },
    authType: {
        type: 'select',
        default: 'none',
        label: 'Authentication',
        options: ['none', 'basic', 'bearer', 'apiKey'],
        advanced: true,
    },
    timeout: {
        type: 'number',
        default: 30000,
        label: 'Timeout (ms)',
        advanced: true,
    },
    followRedirects: {
        type: 'switch',
        default: true,
        label: 'Follow Redirects',
        advanced: true,
    },
    responseType: {
        type: 'select',
        default: 'json',
        label: 'Response Type',
        options: ['json', 'text', 'binary'],
        advanced: true,
    },
};

export const httpRequestManifest: NodeManifest = {
    key: 'http.request',
    label: 'HTTP Request',
    category: 'HTTP',
    description: 'Make HTTP requests to any API',
    icon: Globe2,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'HTTP Request'),
};
