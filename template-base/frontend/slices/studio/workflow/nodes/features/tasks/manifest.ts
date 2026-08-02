/**
 * Tasks Feature Nodes
 * 
 * Automation nodes for Task operations:
 * - Get/Create/Update Tasks
 */

import { CheckSquare, ListPlus, CheckCircle } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const tasksGetTaskManifest: NodeManifest = {
    key: 'feature.tasks.getTask',
    label: 'Tasks: Get Task',
    category: 'Integration',
    description: 'Retrieve task data',
    icon: CheckSquare,

    defaults: {
        operation: 'getById',
        taskId: '',
        status: '',
        assignee: '',
    },

    inspector: {
        fields: [
            {
                key: 'operation',
                label: 'Operation',
                type: 'select',
                options: ['getById', 'getByProject', 'getByAssignee', 'getByStatus', 'list'],
            },
            {
                key: 'taskId',
                label: 'Task ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.taskId }}',
            },
            {
                key: 'status',
                label: 'Filter by Status',
                type: 'select',
                options: ['', 'todo', 'in-progress', 'review', 'done'],
            },
            {
                key: 'assignee',
                label: 'Filter by Assignee',
                type: 'text',
                placeholder: 'User ID',
            },
        ],
    },
};

export const tasksCreateTaskManifest: NodeManifest = {
    key: 'feature.tasks.createTask',
    label: 'Tasks: Create Task',
    category: 'Integration',
    description: 'Create a new task',
    icon: ListPlus,

    defaults: {
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
    },

    inspector: {
        fields: [
            {
                key: 'title',
                label: 'Task Title',
                type: 'text',
                placeholder: 'New task',
                required: true,
            },
            {
                key: 'description',
                label: 'Description',
                type: 'textarea',
                placeholder: 'Task details...',
            },
            {
                key: 'priority',
                label: 'Priority',
                type: 'select',
                options: ['low', 'medium', 'high', 'urgent'],
            },
            {
                key: 'assignee',
                label: 'Assignee',
                type: 'text',
                placeholder: 'User ID',
            },
            {
                key: 'dueDate',
                label: 'Due Date',
                type: 'text',
                placeholder: 'YYYY-MM-DD',
            },
        ],
    },
};

export const tasksUpdateTaskManifest: NodeManifest = {
    key: 'feature.tasks.updateTask',
    label: 'Tasks: Update Task',
    category: 'Integration',
    description: 'Update an existing task',
    icon: CheckCircle,

    defaults: {
        taskId: '',
        status: '',
        updates: '{}',
    },

    inspector: {
        fields: [
            {
                key: 'taskId',
                label: 'Task ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.taskId }}',
                required: true,
            },
            {
                key: 'status',
                label: 'New Status',
                type: 'select',
                options: ['', 'todo', 'in-progress', 'review', 'done'],
            },
            {
                key: 'updates',
                label: 'Other Updates (JSON)',
                type: 'textarea',
                placeholder: '{"priority": "high"}',
            },
        ],
    },
};
