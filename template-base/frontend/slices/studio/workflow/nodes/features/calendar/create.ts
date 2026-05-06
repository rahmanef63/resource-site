/**
 * Calendar Create Event Node
 * 
 * Creates a new calendar event using convex/features/calendar/mutations.ts create()
 * 
 * Convex Args:
 * - workspaceId: v.id("workspaces") [auto from context]
 * - title: v.string() [required]
 * - startsAt: v.number() [required - timestamp]
 * - endsAt: v.optional(v.number())
 * - description: v.optional(v.string())
 * - location: v.optional(v.string())
 * - color: v.optional(v.string())
 * - type: v.optional(v.string())
 * - allDay: v.optional(v.boolean())
 */

import { CalendarPlus } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const calendarCreateManifest: NodeManifest = {
    key: 'feature.calendar.create',
    label: 'Calendar: Create Event',
    category: 'Integration',
    description: 'Create a new calendar event',
    icon: CalendarPlus,

    defaults: {
        title: '',
        startsAt: '',
        endsAt: '',
        description: '',
        location: '',
        color: '#3B82F6',
        type: 'event',
        allDay: false,
    },

    inspector: {
        sections: [
            {
                title: 'Event Details',
                fields: [
                    {
                        key: 'title',
                        label: 'Title',
                        type: 'text',
                        placeholder: 'Event title',
                        required: true,
                    },
                    {
                        key: 'description',
                        label: 'Description',
                        type: 'textarea',
                        placeholder: 'Event description...',
                    },
                ],
            },
            {
                title: 'Date & Time',
                fields: [
                    {
                        key: 'startsAt',
                        label: 'Start Date/Time',
                        type: 'text',
                        placeholder: '{{ $now }} or timestamp',
                        required: true,
                        description: 'Unix timestamp in milliseconds',
                    },
                    {
                        key: 'endsAt',
                        label: 'End Date/Time',
                        type: 'text',
                        placeholder: '{{ $node.prev.data.endTime }}',
                        description: 'Optional. Unix timestamp in milliseconds',
                    },
                    {
                        key: 'allDay',
                        label: 'All Day Event',
                        type: 'switch',
                    },
                ],
            },
            {
                title: 'Details',
                fields: [
                    {
                        key: 'location',
                        label: 'Location',
                        type: 'text',
                        placeholder: 'Meeting room, address, or link',
                    },
                    {
                        key: 'type',
                        label: 'Event Type',
                        type: 'select',
                        options: ['event', 'meeting', 'reminder', 'task', 'holiday'],
                    },
                    {
                        key: 'color',
                        label: 'Color',
                        type: 'select',
                        options: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
                    },
                ],
            },
        ],
    },
};
