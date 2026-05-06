/**
 * Calendar Get Event Node
 * 
 * Retrieves calendar events using convex/features/calendar/queries.ts
 * 
 * Operations:
 * - getById: Get single event by ID
 * - getByDateRange: Get events within date range
 * - list: List all events in workspace
 */

import { Calendar } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const calendarGetManifest: NodeManifest = {
    key: 'feature.calendar.get',
    label: 'Calendar: Get Events',
    category: 'Integration',
    description: 'Retrieve calendar events',
    icon: Calendar,

    defaults: {
        operation: 'list',
        eventId: '',
        startDate: '',
        endDate: '',
        type: '',
        limit: 50,
    },

    inspector: {
        sections: [
            {
                title: 'Operation',
                fields: [
                    {
                        key: 'operation',
                        label: 'Operation',
                        type: 'select',
                        options: ['getById', 'getByDateRange', 'list'],
                        required: true,
                    },
                ],
            },
            {
                title: 'Get By ID',
                fields: [
                    {
                        key: 'eventId',
                        label: 'Event ID',
                        type: 'text',
                        placeholder: '{{ $node.trigger.data.eventId }}',
                        description: 'Required when operation is "getById"',
                    },
                ],
            },
            {
                title: 'Date Range Filter',
                fields: [
                    {
                        key: 'startDate',
                        label: 'Start Date',
                        type: 'text',
                        placeholder: 'Unix timestamp or {{ $now }}',
                        description: 'Filter events starting from this date',
                    },
                    {
                        key: 'endDate',
                        label: 'End Date',
                        type: 'text',
                        placeholder: 'Unix timestamp',
                        description: 'Filter events up to this date',
                    },
                ],
            },
            {
                title: 'Additional Filters',
                fields: [
                    {
                        key: 'type',
                        label: 'Event Type',
                        type: 'select',
                        options: ['', 'event', 'meeting', 'reminder', 'task', 'holiday'],
                    },
                    {
                        key: 'limit',
                        label: 'Max Results',
                        type: 'number',
                        placeholder: '50',
                    },
                ],
            },
        ],
    },
};
