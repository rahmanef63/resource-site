/**
 * Calendar Delete Event Node
 * 
 * Deletes a calendar event using convex/features/calendar/mutations.ts remove()
 * 
 * Convex Args:
 * - id: v.id("calendar") [required]
 */

import { CalendarX } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const calendarDeleteManifest: NodeManifest = {
    key: 'feature.calendar.delete',
    label: 'Calendar: Delete Event',
    category: 'Integration',
    description: 'Delete a calendar event',
    icon: CalendarX,

    defaults: {
        eventId: '',
        confirmDelete: false,
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
                        description: 'ID of the calendar event to delete',
                    },
                ],
            },
            {
                title: 'Safety',
                fields: [
                    {
                        key: 'confirmDelete',
                        label: 'Confirm Delete',
                        type: 'switch',
                        description: 'Must be enabled to allow deletion',
                    },
                ],
            },
        ],
    },
};
