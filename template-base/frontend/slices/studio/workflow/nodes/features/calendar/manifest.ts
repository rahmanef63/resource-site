/**
 * Calendar Feature Nodes
 * 
 * Automation nodes for Calendar operations:
 * - Get/Create/Update Events
 */

import { Calendar, CalendarPlus, CalendarCheck } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const calendarGetEventManifest: NodeManifest = {
    key: 'feature.calendar.getEvent',
    label: 'Calendar: Get Event',
    category: 'Integration',
    description: 'Retrieve calendar events',
    icon: Calendar,

    defaults: {
        operation: 'getById',
        eventId: '',
        dateRange: 'today',
    },

    inspector: {
        fields: [
            {
                key: 'operation',
                label: 'Operation',
                type: 'select',
                options: ['getById', 'getByDate', 'getByDateRange', 'list'],
            },
            {
                key: 'eventId',
                label: 'Event ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.eventId }}',
            },
            {
                key: 'dateRange',
                label: 'Date Range',
                type: 'select',
                options: ['today', 'thisWeek', 'thisMonth', 'custom'],
            },
        ],
    },
};

export const calendarCreateEventManifest: NodeManifest = {
    key: 'feature.calendar.createEvent',
    label: 'Calendar: Create Event',
    category: 'Integration',
    description: 'Create a new calendar event',
    icon: CalendarPlus,

    defaults: {
        title: '',
        startDate: '',
        endDate: '',
        allDay: false,
        description: '',
    },

    inspector: {
        fields: [
            {
                key: 'title',
                label: 'Event Title',
                type: 'text',
                placeholder: 'Meeting with client',
                required: true,
            },
            {
                key: 'startDate',
                label: 'Start Date/Time',
                type: 'text',
                placeholder: '{{ $node.prev.data.date }}',
            },
            {
                key: 'endDate',
                label: 'End Date/Time',
                type: 'text',
                placeholder: '{{ $node.prev.data.endDate }}',
            },
            {
                key: 'allDay',
                label: 'All Day Event',
                type: 'switch',
            },
            {
                key: 'description',
                label: 'Description',
                type: 'textarea',
                placeholder: 'Event details...',
            },
        ],
    },
};

export const calendarUpdateEventManifest: NodeManifest = {
    key: 'feature.calendar.updateEvent',
    label: 'Calendar: Update Event',
    category: 'Integration',
    description: 'Update an existing calendar event',
    icon: CalendarCheck,

    defaults: {
        eventId: '',
        updates: '{}',
    },

    inspector: {
        fields: [
            {
                key: 'eventId',
                label: 'Event ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.eventId }}',
                required: true,
            },
            {
                key: 'updates',
                label: 'Updates (JSON)',
                type: 'textarea',
                placeholder: '{"title": "New Title", "status": "completed"}',
            },
        ],
    },
};
