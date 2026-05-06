/**
 * Communications Feature Nodes
 * 
 * Automation nodes for Communication operations:
 * - Send Message, Get Conversations, Create Channel
 */

import { MessageCircle, Send, Hash, Users } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const commsGetConversationManifest: NodeManifest = {
    key: 'feature.comms.getConversation',
    label: 'Comms: Get Conversation',
    category: 'Integration',
    description: 'Retrieve conversation/chat data',
    icon: MessageCircle,

    defaults: {
        operation: 'getById',
        conversationId: '',
        userId: '',
    },

    inspector: {
        fields: [
            {
                key: 'operation',
                label: 'Operation',
                type: 'select',
                options: ['getById', 'getByUser', 'getRecent', 'list'],
            },
            {
                key: 'conversationId',
                label: 'Conversation ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.convId }}',
            },
            {
                key: 'userId',
                label: 'User ID',
                type: 'text',
                placeholder: 'Filter by user',
            },
        ],
    },
};

export const commsSendMessageManifest: NodeManifest = {
    key: 'feature.comms.sendMessage',
    label: 'Comms: Send Message',
    category: 'Integration',
    description: 'Send a message to a conversation',
    icon: Send,

    defaults: {
        conversationId: '',
        message: '',
        attachments: '[]',
    },

    inspector: {
        fields: [
            {
                key: 'conversationId',
                label: 'Conversation ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.convId }}',
                required: true,
            },
            {
                key: 'message',
                label: 'Message',
                type: 'textarea',
                placeholder: 'Hello from automation!',
                required: true,
            },
            {
                key: 'attachments',
                label: 'Attachments (JSON)',
                type: 'textarea',
                placeholder: '[]',
            },
        ],
    },
};

export const commsCreateChannelManifest: NodeManifest = {
    key: 'feature.comms.createChannel',
    label: 'Comms: Create Channel',
    category: 'Integration',
    description: 'Create a new communication channel',
    icon: Hash,

    defaults: {
        name: '',
        description: '',
        isPrivate: false,
        members: '[]',
    },

    inspector: {
        fields: [
            {
                key: 'name',
                label: 'Channel Name',
                type: 'text',
                placeholder: 'project-updates',
                required: true,
            },
            {
                key: 'description',
                label: 'Description',
                type: 'text',
                placeholder: 'Channel description',
            },
            {
                key: 'isPrivate',
                label: 'Private Channel',
                type: 'switch',
            },
            {
                key: 'members',
                label: 'Initial Members (JSON)',
                type: 'textarea',
                placeholder: '["userId1", "userId2"]',
            },
        ],
    },
};
