/**
 * Calendar Update Event Node
 * 
 * Updates an existing calendar event using convex/features/calendar/mutations.ts update()
 * 
 * Convex Args:
 * - id: v.id("calendar") [required]
 * - patch: v.object({
 *     title: v.optional(v.string()),
 *     startsAt: v.optional(v.number()),
 *     endsAt: v.optional(v.union(v.number(), v.null())),
 *     description: v.optional(v.union(v.string(), v.null())),
 *     location: v.optional(v.union(v.string(), v.null())),
 *     color: v.optional(v.union(v.string(), v.null())),
 *     type: v.optional(v.union(v.string(), v.null())),
 *     allDay: v.optional(v.boolean()),
 *   })
 */

import { CalendarCheck } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const calendarUpdateManifest: NodeManifest = {
    key: 'feature.calendar.update',
    label: 'Calendar: Update Event',
    category: 'Integration',
    description: 'Update an existing calendar event',
    icon: CalendarCheck,

    defaults: {
        eventId: '',
        title: '',
        startsAt: '',
        endsAt: '',
        description: '',
        location: '',
        color: '',
        type: '',
        allDay: false,
    },

    inspector: {
        sections: [
            {
                title: 'Target Event',
                fields: [
                    {
                        key: 'eventId',
                        label: 'Event ID',
                        type: 'text',
                        placeholder: '{{ $node.prev.data.eventId }}',
                        required: true,
                        description: 'ID of the calendar event to update',
                    },
                ],
            },
            {
                title: 'Update Fields',
                fields: [
                    {
                        key: 'title',
                        label: 'New Title',
                        type: 'text',
                        placeholder: 'Leave empty to keep current',
                    },
                    {
                        key: 'description',
                        label: 'New Description',
                        type: 'textarea',
                        placeholder: 'Leave empty to keep current',
                    },
                ],
            },
            {
                title: 'Date & Time Updates',
                fields: [
                    {
                        key: 'startsAt',
                        label: 'New Start Date/Time',
                        type: 'text',
                        placeholder: 'Unix timestamp (optional)',
                    },
                    {
                        key: 'endsAt',
                        label: 'New End Date/Time',
                        type: 'text',
                        placeholder: 'Unix timestamp (optional)',
                    },
                    {
                        key: 'allDay',
                        label: 'All Day Event',
                        type: 'switch',
                    },
                ],
            },
            {
                title: 'Other Updates',
                fields: [
                    {
                        key: 'location',
                        label: 'New Location',
                        type: 'text',
                        placeholder: 'Leave empty to keep current',
                    },
                    {
                        key: 'type',
                        label: 'New Event Type',
                        type: 'select',
                        options: ['', 'event', 'meeting', 'reminder', 'task', 'holiday'],
                    },
                    {
                        key: 'color',
                        label: 'New Color',
                        type: 'select',
                        options: ['', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
                    },
                ],
            },
        ],
    },
};
