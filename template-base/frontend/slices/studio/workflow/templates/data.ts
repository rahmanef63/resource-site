/**
 * Data Templates
 * 
 * Workflow templates for data processing and storage
 */

import type { WorkflowTemplate } from './types';
import { nodes, createEdgeChain } from './helpers';

export const dataTemplates: WorkflowTemplate[] = [
    {
        id: 'webhook-to-database',
        name: 'Webhook to Database',
        description: 'Store incoming webhook data in database',
        category: 'data',
        tags: ['webhook', 'database', 'data', 'storage'],
        nodes: [
            nodes.webhook('trigger', '/api/automation/data-ingest', 'POST', 0),
            nodes.code('validate', `const data = $node.trigger.body;
if (!data.id) throw new Error("Missing ID");
return { valid: true, data };`, 1),
            nodes.database('insert', 'insert', { table: 'records', values: '{{ $node.validate.data }}' }, 2),
            nodes.httpRespond('respond', 200, '{"success": true}', 3),
        ],
        edges: createEdgeChain(['trigger', 'validate', 'insert', 'respond']),
    },

    {
        id: 'scheduled-data-cleanup',
        name: 'Scheduled Data Cleanup',
        description: 'Automatically clean up old data on schedule',
        category: 'data',
        tags: ['schedule', 'cleanup', 'database', 'maintenance'],
        nodes: [
            nodes.schedule('trigger', '0 2 * * 0', 'Every Sunday at 2 AM', 0),
            nodes.database('query', 'query', { query: 'SELECT id FROM records WHERE createdAt < {{ $now - 2592000000 }}' }, 1),
            nodes.loop('loop', '{{ $node.query.data }}', 2),
            nodes.database('delete', 'delete', { id: '{{ $item.id }}' }, 3),
        ],
        edges: createEdgeChain(['trigger', 'query', 'loop', 'delete']),
    },

    {
        id: 'data-transform-pipeline',
        name: 'Data Transform Pipeline',
        description: 'Process and transform data with validation',
        category: 'data',
        tags: ['webhook', 'transform', 'validate', 'data'],
        nodes: [
            nodes.webhook('trigger', '/api/automation/transform', 'POST', 0),
            nodes.code('transform', `const items = $node.trigger.body.items;
return items.map(item => ({
  ...item,
  processed: true,
  timestamp: Date.now()
}));`, 1),
            nodes.setVariable('result', 'processedData', '{{ $node.transform.data }}', 2),
            nodes.httpRespond('respond', 200, '{{ $vars.processedData | json }}', 3),
        ],
        edges: createEdgeChain(['trigger', 'transform', 'result', 'respond']),
    },
];
