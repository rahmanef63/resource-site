/**
 * OpenAI / GPT Node
 * 
 * Use OpenAI GPT models.
 */

import { Bot } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    operation: {
        type: 'select',
        default: 'chat',
        label: 'Operation',
        options: ['chat', 'complete', 'embedding', 'image'],
    },
    model: {
        type: 'select',
        default: 'gpt-4',
        label: 'Model',
        options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'],
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
    temperature: {
        type: 'slider',
        default: 0.7,
        label: 'Temperature',
        min: 0,
        max: 2,
        step: 0.1,
        advanced: true,
    },
    maxTokens: {
        type: 'number',
        default: 1000,
        label: 'Max Tokens',
        advanced: true,
    },
};

export const openaiManifest: NodeManifest = {
    key: 'ai.openai',
    label: 'OpenAI / GPT',
    category: 'AI',
    description: 'Use OpenAI GPT models for text generation',
    icon: Bot,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'OpenAI Configuration'),
};
