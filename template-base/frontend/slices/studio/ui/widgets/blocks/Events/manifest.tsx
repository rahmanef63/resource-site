import type { WidgetConfig } from '../../../types/index';
import { EventsBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Calendar } from 'lucide-react';

export const eventsManifest: WidgetConfig = {
    label: "Events List",
    category: "Blocks",
    description: "Display upcoming events.",
    icon: Calendar,
    defaults: {
        title: "Upcoming",
        maxEvents: 5,
        events: [],
        showOverdue: true
    },
    render: (props: any) => <EventsBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'maxEvents',
                label: 'Max Events',
                type: 'number'
            }),
            createCustomField({
                key: 'description',
                label: 'Description',
                type: 'text'
            }),
            createCustomField({
                key: 'showOverdue',
                label: 'Show Overdue',
                type: 'switch'
            }),
            createCustomField({
                key: 'events',
                label: 'Events (JSON)',
                type: 'json',
                placeholder: '[{"id":"1","title":"Team Meeting","date":"2026-03-20","time":"10:00","location":"Room A"},{"id":"2","title":"Sprint Review","date":"2026-03-22"}]',
            }),
        ]
    }
};
