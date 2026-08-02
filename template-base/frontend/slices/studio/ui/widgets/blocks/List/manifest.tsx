import type { WidgetConfig } from '../../../types/index';
import { ListBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { List } from 'lucide-react';

export const listManifest: WidgetConfig = {
    label: "List Block",
    category: "Blocks",
    description: "Generic scrollable list.",
    icon: List,
    defaults: {
        title: "Recent Items",
        maxItems: 5,
        items: [],
        showBadges: true,
        emptyMessage: "No items"
    },
    render: (props: any) => <ListBlock {...(props as any)} />,
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
                key: 'showBadges',
                label: 'Show Badges',
                type: 'switch'
            }),
            createCustomField({
                key: 'emptyMessage',
                label: 'Empty Message',
                type: 'text'
            }),
            createCustomField({
                key: 'items',
                label: 'Items (JSON)',
                type: 'json',
                placeholder: '[{"id":"1","title":"Item 1","subtitle":"Subtitle","badge":"new"},{"id":"2","title":"Item 2"}]',
            }),
        ]
    }
};
