/**
 * CRM Feature Nodes
 * 
 * Automation nodes for CRM operations:
 * - Get/Create/Update Customers
 * - Get/Create/Update Deals
 */

import { Users, UserPlus, Briefcase, DollarSign } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const crmGetCustomerManifest: NodeManifest = {
    key: 'feature.crm.getCustomer',
    label: 'CRM: Get Customer',
    category: 'Integration',
    description: 'Retrieve customer data from CRM',
    icon: Users,

    defaults: {
        operation: 'getById',
        customerId: '',
        filters: '{}',
    },

    inspector: {
        fields: [
            {
                key: 'operation',
                label: 'Operation',
                type: 'select',
                options: ['getById', 'getByEmail', 'search', 'list'],
            },
            {
                key: 'customerId',
                label: 'Customer ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.customerId }}',
            },
            {
                key: 'filters',
                label: 'Filters (JSON)',
                type: 'textarea',
                placeholder: '{"status": "active"}',
            },
        ],
    },
};

export const crmCreateCustomerManifest: NodeManifest = {
    key: 'feature.crm.createCustomer',
    label: 'CRM: Create Customer',
    category: 'Integration',
    description: 'Create a new customer in CRM',
    icon: UserPlus,

    defaults: {
        name: '',
        email: '',
        phone: '',
        company: '',
        tags: '',
    },

    inspector: {
        fields: [
            {
                key: 'name',
                label: 'Name',
                type: 'text',
                placeholder: 'Customer name',
                required: true,
            },
            {
                key: 'email',
                label: 'Email',
                type: 'text',
                placeholder: 'customer@example.com',
            },
            {
                key: 'phone',
                label: 'Phone',
                type: 'text',
                placeholder: '+62...',
            },
            {
                key: 'company',
                label: 'Company',
                type: 'text',
                placeholder: 'Company name',
            },
            {
                key: 'tags',
                label: 'Tags (comma-separated)',
                type: 'text',
                placeholder: 'lead, premium',
            },
        ],
    },
};

export const crmGetDealManifest: NodeManifest = {
    key: 'feature.crm.getDeal',
    label: 'CRM: Get Deal',
    category: 'Integration',
    description: 'Retrieve deal data from CRM',
    icon: Briefcase,

    defaults: {
        operation: 'getById',
        dealId: '',
        stage: '',
    },

    inspector: {
        fields: [
            {
                key: 'operation',
                label: 'Operation',
                type: 'select',
                options: ['getById', 'getByCustomer', 'getByStage', 'list'],
            },
            {
                key: 'dealId',
                label: 'Deal ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.dealId }}',
            },
            {
                key: 'stage',
                label: 'Pipeline Stage',
                type: 'select',
                options: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
            },
        ],
    },
};

export const crmCreateDealManifest: NodeManifest = {
    key: 'feature.crm.createDeal',
    label: 'CRM: Create Deal',
    category: 'Integration',
    description: 'Create a new deal in CRM',
    icon: DollarSign,

    defaults: {
        title: '',
        value: 0,
        customerId: '',
        stage: 'lead',
    },

    inspector: {
        fields: [
            {
                key: 'title',
                label: 'Deal Title',
                type: 'text',
                placeholder: 'New Project',
                required: true,
            },
            {
                key: 'value',
                label: 'Value',
                type: 'number',
                placeholder: '10000',
            },
            {
                key: 'customerId',
                label: 'Customer ID',
                type: 'text',
                placeholder: '{{ $node.crmCustomer.data.id }}',
            },
            {
                key: 'stage',
                label: 'Initial Stage',
                type: 'select',
                options: ['lead', 'qualified', 'proposal', 'negotiation'],
            },
        ],
    },
};
