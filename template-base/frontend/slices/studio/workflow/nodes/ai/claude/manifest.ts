/**
 * Anthropic Claude Node
 * 
 * Use Anthropic Claude models.
 */

import { Brain } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    model: {
        type: 'select',
        default: 'claude-3-sonnet',
        label: 'Model',
        options: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3.5-sonnet', 'claude-3.5-haiku'],
    },
    systemPrompt: {
        type: 'textarea',
        default: 'You are a helpful assistant.',
        label: 'System Prompt',
        placeholder: 'You are a helpful assistant.',
    },
    userPrompt: {
        type: 'textarea',
        default: '',
        label: 'User Prompt',
        placeholder: '{{ $node.prev.data.message }}',
    },
    maxTokens: {
        type: 'number',
        default: 1000,
        label: 'Max Tokens',
        advanced: true,
    },
};

export const claudeManifest: NodeManifest = {
    key: 'ai.claude',
    label: 'Anthropic Claude',
    category: 'AI',
    description: 'Use Anthropic Claude models for text generation',
    icon: Brain,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Claude Configuration'),
};
