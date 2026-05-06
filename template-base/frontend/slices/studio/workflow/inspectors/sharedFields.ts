/**
 * Shared Inspector Fields
 * 
 * Reusable inspector field configurations for common patterns
 * across multiple nodes. Import these into node manifests.
 * 
 * Note: Uses shared foundation InspectorField type with types:
 * text, number, select, switch, textarea, custom, nodeSelector
 */

import type { InspectorField } from '@/frontend/shared/foundation';
import type { InspectorSection } from '../nodes/types';

// ============================================================================
// HTTP Method Fields
// ============================================================================

export const httpMethodField: InspectorField = {
    key: 'method',
    label: 'Method',
    type: 'select',
    options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
};

export const httpUrlField: InspectorField = {
    key: 'url',
    label: 'URL',
    type: 'text',
    placeholder: 'https://api.example.com/endpoint',
};

export const httpHeadersField: InspectorField = {
    key: 'headers',
    label: 'Headers (JSON)',
    type: 'textarea',
    placeholder: '{"Content-Type": "application/json"}',
};

export const httpBodyField: InspectorField = {
    key: 'body',
    label: 'Request Body',
    type: 'textarea',
    placeholder: 'JSON body for POST/PUT/PATCH',
};

export const httpTimeoutField: InspectorField = {
    key: 'timeout',
    label: 'Timeout (ms)',
    type: 'number',
    placeholder: '30000',
};

export const httpMethodSection: InspectorSection = {
    title: 'Request',
    fields: [httpMethodField, httpUrlField, httpHeadersField, httpBodyField],
};

export const httpAdvancedSection: InspectorSection = {
    title: 'Advanced',
    fields: [
        httpTimeoutField,
        {
            key: 'followRedirects',
            label: 'Follow Redirects',
            type: 'switch',
        },
        {
            key: 'responseType',
            label: 'Response Type',
            type: 'select',
            options: ['json', 'text', 'binary'],
        },
    ],
    collapsed: true,
};

// ============================================================================
// Authentication Fields
// ============================================================================

export const authTypeField: InspectorField = {
    key: 'authType',
    label: 'Authentication',
    type: 'select',
    options: ['none', 'basicAuth', 'bearerToken', 'apiKey', 'oauth2'],
};

export const authCredentialField: InspectorField = {
    key: 'credentialId',
    label: 'Credential',
    type: 'text', // Using text for now, can be custom later
    placeholder: 'Credential name or ID',
};

export const authSection: InspectorSection = {
    title: 'Authentication',
    fields: [authTypeField, authCredentialField],
    collapsed: true,
};

// ============================================================================
// Expression / Data Fields
// ============================================================================

export const expressionField: InspectorField = {
    key: 'expression',
    label: 'Expression',
    type: 'textarea', // Using textarea for expressions
    placeholder: '{{ $node["Previous"].data.field }}',
};

export const variableNameField: InspectorField = {
    key: 'variableName',
    label: 'Variable Name',
    type: 'text',
    placeholder: 'myVariable',
};

export const valueField: InspectorField = {
    key: 'value',
    label: 'Value',
    type: 'textarea',
    placeholder: 'Value or expression',
};

export const valueTypeField: InspectorField = {
    key: 'valueType',
    label: 'Value Type',
    type: 'select',
    options: ['string', 'number', 'boolean', 'json', 'expression'],
};

// ============================================================================
// Flow Control Fields
// ============================================================================

export const conditionOperatorField: InspectorField = {
    key: 'operator',
    label: 'Operator',
    type: 'select',
    options: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty', 'regex'],
};

export const conditionLeftField: InspectorField = {
    key: 'leftValue',
    label: 'Value 1',
    type: 'textarea',
    placeholder: '{{ $node.prev.data.status }}',
};

export const conditionRightField: InspectorField = {
    key: 'rightValue',
    label: 'Value 2',
    type: 'text',
    placeholder: 'Compare value',
};

export const conditionSection: InspectorSection = {
    title: 'Condition',
    fields: [conditionLeftField, conditionOperatorField, conditionRightField],
};

// ============================================================================
// AI / LLM Fields
// ============================================================================

export const aiSystemPromptField: InspectorField = {
    key: 'systemPrompt',
    label: 'System Prompt',
    type: 'textarea',
    placeholder: 'You are a helpful assistant.',
};

export const aiUserPromptField: InspectorField = {
    key: 'userPrompt',
    label: 'User Prompt',
    type: 'textarea',
    placeholder: '{{ $node.prev.data.text }}',
};

export const aiTemperatureField: InspectorField = {
    key: 'temperature',
    label: 'Temperature',
    type: 'number',
    placeholder: '0.7',
};

export const aiMaxTokensField: InspectorField = {
    key: 'maxTokens',
    label: 'Max Tokens',
    type: 'number',
    placeholder: '1000',
};
