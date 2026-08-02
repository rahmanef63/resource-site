import type { WidgetConfig } from '../../../types/index';
import { ActivityBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Activity } from 'lucide-react';

export const activityManifest: WidgetConfig = {
    label: "Activity Feed",
    category: "Blocks",
    description: "Displays recent activity items.",
    icon: Activity,
    defaults: {
        title: "Recent Activity",
        maxItems: 10,
        activities: [],
        emptyMessage: "No recent activity"
    },
    render: (props: any) => <ActivityBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'maxItems',
                label: 'Max Items',
                type: 'number'
            }),
            createCustomField({
                key: 'description',
                label: 'Description',
                type: 'text'
            }),
            createCustomField({
                key: 'emptyMessage',
                label: 'Empty Message',
                type: 'text'
            }),
            createCustomField({
                key: 'activities',
                label: 'Activities (JSON)',
                type: 'json',
                placeholder: '[{"id":"1","user":"Alice","action":"created document","timestamp":"2 min ago"},{"id":"2","user":"Bob","action":"commented","timestamp":"5 min ago"}]',
            }),
        ]
    }
};
