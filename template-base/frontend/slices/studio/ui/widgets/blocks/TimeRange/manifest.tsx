import type { WidgetConfig } from '../../../types/index';
import { TimeRangeBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Clock } from 'lucide-react';

export const timeRangeManifest: WidgetConfig = {
    label: "Time Range",
    category: "Blocks",
    description: "Time range selector dropdown.",
    icon: Clock,
    defaults: {
        value: "30d",
        options: ["today", "7d", "30d", "90d"],
        showLabel: true,
    },
    render: (props: any) => <TimeRangeBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'value',
                label: 'Default Range',
                type: 'select',
                options: ['today', '7d', '30d', '90d', 'year', 'all'],
            }),
            createCustomField({ key: 'showLabel', label: 'Show Label', type: 'switch' }),
        ]
    }
};
