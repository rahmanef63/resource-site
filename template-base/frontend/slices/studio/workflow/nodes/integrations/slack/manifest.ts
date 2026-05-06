/**
 * Slack Integration Node
 * 
 * Send messages to Slack channels.
 */

import { MessageSquare } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    operation: {
        type: 'select',
        default: 'sendMessage',
        label: 'Operation',
        options: ['sendMessage', 'uploadFile', 'getChannel', 'listChannels', 'updateMessage'],
    },
    channel: {
        type: 'text',
        default: '',
        label: 'Channel',
        placeholder: '#general or channel ID',
    },
    text: {
        type: 'textarea',
        default: '',
        label: 'Message Text',
        placeholder: 'Hello from automation!',
    },
    attachments: {
        type: 'textarea',
        default: '[]',
        label: 'Attachments (JSON)',
        placeholder: '[]',
        advanced: true,
    },
};

export const slackManifest: NodeManifest = {
    key: 'integration.slack',
    label: 'Slack',
    category: 'Integration',
    description: 'Send messages to Slack channels',
    icon: MessageSquare,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Slack Configuration'),
};
