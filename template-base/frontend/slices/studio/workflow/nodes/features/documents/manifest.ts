/**
 * Documents Feature Nodes
 * 
 * Automation nodes for Document operations:
 * - Get/Create/Update Documents
 */

import { FileText, FilePlus, FileEdit } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const docsGetDocumentManifest: NodeManifest = {
    key: 'feature.docs.getDocument',
    label: 'Docs: Get Document',
    category: 'Integration',
    description: 'Retrieve document data',
    icon: FileText,

    defaults: {
        operation: 'getById',
        documentId: '',
        folderId: '',
    },

    inspector: {
        fields: [
            {
                key: 'operation',
                label: 'Operation',
                type: 'select',
                options: ['getById', 'getByFolder', 'search', 'list'],
            },
            {
                key: 'documentId',
                label: 'Document ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.docId }}',
            },
            {
                key: 'folderId',
                label: 'Folder ID',
                type: 'text',
                placeholder: 'Optional folder filter',
            },
        ],
    },
};

export const docsCreateDocumentManifest: NodeManifest = {
    key: 'feature.docs.createDocument',
    label: 'Docs: Create Document',
    category: 'Integration',
    description: 'Create a new document',
    icon: FilePlus,

    defaults: {
        title: '',
        content: '',
        folderId: '',
        template: '',
    },

    inspector: {
        fields: [
            {
                key: 'title',
                label: 'Document Title',
                type: 'text',
                placeholder: 'New Document',
                required: true,
            },
            {
                key: 'content',
                label: 'Initial Content',
                type: 'textarea',
                placeholder: 'Document content...',
            },
            {
                key: 'folderId',
                label: 'Folder ID',
                type: 'text',
                placeholder: 'Parent folder (optional)',
            },
            {
                key: 'template',
                label: 'Template',
                type: 'select',
                options: ['blank', 'meeting-notes', 'project-brief', 'report'],
            },
        ],
    },
};

export const docsUpdateDocumentManifest: NodeManifest = {
    key: 'feature.docs.updateDocument',
    label: 'Docs: Update Document',
    category: 'Integration',
    description: 'Update an existing document',
    icon: FileEdit,

    defaults: {
        documentId: '',
        operation: 'append',
        content: '',
    },

    inspector: {
        fields: [
            {
                key: 'documentId',
                label: 'Document ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.docId }}',
                required: true,
            },
            {
                key: 'operation',
                label: 'Update Mode',
                type: 'select',
                options: ['replace', 'append', 'prepend'],
            },
            {
                key: 'content',
                label: 'Content',
                type: 'textarea',
                placeholder: 'New content...',
            },
        ],
    },
};
