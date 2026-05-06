import type { WidgetConfig } from '../../../types/index';
import { AgentBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Sparkles } from 'lucide-react';

export const agentManifest: WidgetConfig = {
    label: "AI Agent",
    category: "Blocks",
    description: "AI Assistant panel with suggestions and chat input.",
    icon: Sparkles,
    defaults: {
        agentName: "Assistant",
        description: "Ask me anything about your workspace",
        featureSlug: "",
        suggestions: ["What can you help me with?", "Show me what's new", "Help me get started"],
        toolCount: 0,
        loading: false,
    },
    render: (props: any) => <AgentBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({ key: 'agentName', label: 'Agent Name', type: 'text' }),
            createCustomField({ key: 'description', label: 'Description', type: 'text' }),
            createCustomField({ key: 'featureSlug', label: 'Feature Slug', type: 'text' }),
            createCustomField({ key: 'toolCount', label: 'Tool Count', type: 'number' }),
        ]
    }
};
