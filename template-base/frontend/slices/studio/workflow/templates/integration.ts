/**
 * Integration Templates
 * 
 * Workflow templates for third-party integrations
 */

import type { WorkflowTemplate } from './types';
import { nodes, createEdgeChain } from './helpers';

export const integrationTemplates: WorkflowTemplate[] = [
    {
        id: 'slack-notification-pipeline',
        name: 'Slack Notification Pipeline',
        description: 'Send formatted Slack notifications with AI enhancement',
        category: 'integration',
        tags: ['slack', 'notification', 'ai', 'webhook'],
        nodes: [
            nodes.webhook('trigger', '/api/automation/notify', 'POST', 0),
            nodes.openai('enhance', 'Rewrite this message for Slack, make it concise and professional:\n{{ $node.trigger.body.message }}', 'gpt-4o-mini', 1),
            nodes.slack('send', '{{ $node.trigger.body.channel }}', '{{ $node.enhance.data.response }}', 2),
        ],
        edges: createEdgeChain(['trigger', 'enhance', 'send']),
    },

    {
        id: 'email-digest',
        name: 'Email Digest',
        description: 'Send periodic email digest with aggregated data',
        category: 'integration',
        tags: ['email', 'schedule', 'digest', 'report'],
        nodes: [
            nodes.schedule('trigger', '0 9 * * 1', 'Every Monday at 9 AM', 0),
            nodes.database('query', 'query', { query: 'SELECT * FROM activities WHERE createdAt > {{ $now - 604800000 }}' }, 1),
            nodes.openai('summarize', "Create a weekly summary email from this data:\n{{ $node.query.data | json }}", 'gpt-4o-mini', 2),
            nodes.email('send', '{{ $env.DIGEST_RECIPIENTS }}', 'Weekly Digest - {{ $now | date }}', '{{ $node.summarize.data.response }}', 3),
        ],
        edges: createEdgeChain(['trigger', 'query', 'summarize', 'send']),
    },

    {
        id: 'api-to-slack',
        name: 'API Status to Slack',
        description: 'Monitor API health and notify on Slack',
        category: 'integration',
        tags: ['api', 'monitoring', 'slack', 'health'],
        nodes: [
            nodes.schedule('trigger', '*/5 * * * *', 'Every 5 minutes', 0),
            nodes.httpRequest('check', 'GET', '{{ $env.API_HEALTH_URL }}', '{}', 1),
            nodes.ifCondition('isDown', '{{ $node.check.status !== 200 }}', 2),
            nodes.slack('alert', '#alerts', '🚨 API Health Check Failed!\nStatus: {{ $node.check.status }}\nURL: {{ $env.API_HEALTH_URL }}', 3),
        ],
        edges: createEdgeChain(['trigger', 'check', 'isDown', 'alert']),
    },
];
