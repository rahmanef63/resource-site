import type { WidgetConfig } from '../../../types/index';
import { StatsBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { BarChart3 } from 'lucide-react';

export const statsManifest: WidgetConfig = {
    label: "Stats Grid",
    category: "Blocks",
    description: "Grid of statistic cards.",
    icon: BarChart3,
    defaults: {
        stats: [],
        columns: 4
    },
    render: (props: any) => <StatsBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'columns',
                label: 'Columns',
                type: 'number'
            }),
            createCustomField({
                key: 'stats',
                label: 'Stats Items (JSON)',
                type: 'json',
                placeholder: '[{"title":"Users","value":"1,234","description":"Total users"},{"title":"Revenue","value":"$5.6k","description":"This month"}]',
            }),
        ]
    }
};
