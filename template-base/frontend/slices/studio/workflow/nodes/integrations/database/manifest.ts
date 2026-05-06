/**
 * Database Integration Node
 * 
 * Query databases (SQL/NoSQL).
 */

import { Database } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    operation: {
        type: 'select',
        default: 'select',
        label: 'Operation',
        options: ['select', 'insert', 'update', 'delete', 'rawQuery'],
    },
    table: {
        type: 'text',
        default: '',
        label: 'Table/Collection',
        placeholder: 'users',
    },
    query: {
        type: 'textarea',
        default: '',
        label: 'Query / Filter',
        placeholder: 'SELECT * FROM users WHERE id = ?',
        description: 'SQL query or NoSQL filter',
    },
    parameters: {
        type: 'textarea',
        default: '[]',
        label: 'Parameters (JSON)',
        placeholder: '["value1", "value2"]',
        advanced: true,
    },
};

export const databaseManifest: NodeManifest = {
    key: 'integration.database',
    label: 'Database',
    category: 'Integration',
    description: 'Query databases (SQL/NoSQL)',
    icon: Database,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Database Query'),
};
