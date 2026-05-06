/**
 * Email Integration Node
 * 
 * Send emails via SMTP.
 */

import { Mail } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    to: {
        type: 'text',
        default: '',
        label: 'To',
        placeholder: 'recipient@example.com',
    },
    cc: {
        type: 'text',
        default: '',
        label: 'CC',
        placeholder: 'cc@example.com (optional)',
        advanced: true,
    },
    bcc: {
        type: 'text',
        default: '',
        label: 'BCC',
        placeholder: 'bcc@example.com (optional)',
        advanced: true,
    },
    subject: {
        type: 'text',
        default: '',
        label: 'Subject',
        placeholder: 'Email Subject',
    },
    bodyType: {
        type: 'select',
        default: 'text',
        label: 'Body Type',
        options: ['text', 'html'],
    },
    body: {
        type: 'textarea',
        default: '',
        label: 'Body',
        placeholder: 'Email content...',
    },
};

export const emailManifest: NodeManifest = {
    key: 'integration.email',
    label: 'Send Email',
    category: 'Integration',
    description: 'Send emails via SMTP',
    icon: Mail,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Email Configuration'),
};
