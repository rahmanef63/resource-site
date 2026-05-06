/**
 * Forms Feature Nodes
 * 
 * Automation nodes for Form operations:
 * - Get submissions, Create form, Process response
 */

import { FormInput, ClipboardList, FileCheck } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const formsGetSubmissionManifest: NodeManifest = {
    key: 'feature.forms.getSubmission',
    label: 'Forms: Get Submission',
    category: 'Integration',
    description: 'Retrieve form submissions',
    icon: ClipboardList,

    defaults: {
        operation: 'getById',
        formId: '',
        submissionId: '',
    },

    inspector: {
        fields: [
            {
                key: 'operation',
                label: 'Operation',
                type: 'select',
                options: ['getById', 'getByForm', 'getRecent', 'list'],
            },
            {
                key: 'formId',
                label: 'Form ID',
                type: 'text',
                placeholder: 'Filter by form',
            },
            {
                key: 'submissionId',
                label: 'Submission ID',
                type: 'text',
                placeholder: '{{ $node.trigger.data.submissionId }}',
            },
        ],
    },
};

export const formsCreateFormManifest: NodeManifest = {
    key: 'feature.forms.createForm',
    label: 'Forms: Create Form',
    category: 'Integration',
    description: 'Create a new form dynamically',
    icon: FormInput,

    defaults: {
        title: '',
        description: '',
        fields: '[]',
    },

    inspector: {
        fields: [
            {
                key: 'title',
                label: 'Form Title',
                type: 'text',
                placeholder: 'Contact Form',
                required: true,
            },
            {
                key: 'description',
                label: 'Description',
                type: 'text',
                placeholder: 'Form description',
            },
            {
                key: 'fields',
                label: 'Fields (JSON)',
                type: 'textarea',
                placeholder: '[{"name": "email", "type": "email", "required": true}]',
            },
        ],
    },
};

export const formsProcessResponseManifest: NodeManifest = {
    key: 'feature.forms.processResponse',
    label: 'Forms: Process Response',
    category: 'Integration',
    description: 'Process and validate form response',
    icon: FileCheck,

    defaults: {
        submissionId: '',
        action: 'validate',
        rules: '{}',
    },

    inspector: {
        fields: [
            {
                key: 'submissionId',
                label: 'Submission ID',
                type: 'text',
                placeholder: '{{ $node.trigger.data.id }}',
                required: true,
            },
            {
                key: 'action',
                label: 'Action',
                type: 'select',
                options: ['validate', 'transform', 'enrich', 'score'],
            },
            {
                key: 'rules',
                label: 'Processing Rules (JSON)',
                type: 'textarea',
                placeholder: '{"validateEmail": true}',
            },
        ],
    },
};
