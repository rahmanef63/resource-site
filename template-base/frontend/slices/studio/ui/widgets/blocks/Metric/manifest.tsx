import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { MetricCardBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Metric';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Sigma } from 'lucide-react';

export const metricCardManifest: WidgetConfig = {
    label: "Metric Card",
    category: "Blocks",
    description: "Single statistic card.",
    icon: Sigma,
    defaults: {
        title: "Revenue",
        value: "$12,345",
        description: "",
        trend: { value: 12.5, direction: "up" },
        className: ""
    },
    render: (props) => <MetricCardBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'value',
                label: 'Value',
                type: 'text'
            }),
            createCustomField({
                key: 'description',
                label: 'Description',
                type: 'text',
                placeholder: 'vs last month'
            }),
            createCustomField({
                key: 'trend',
                label: 'Trend',
                type: 'json',
                placeholder: '{"value": 12.5, "direction": "up"}'
            }),
        ]
    }
};
