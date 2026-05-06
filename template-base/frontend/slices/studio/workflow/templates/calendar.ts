/**
 * Calendar Templates
 * 
 * Workflow templates for Calendar feature automation
 */

import type { WorkflowTemplate } from './types';
import { nodes, createEdgeChain } from './helpers';

export const calendarTemplates: WorkflowTemplate[] = [
    {
        id: 'calendar-webhook-event',
        name: 'Calendar Event from Webhook',
        description: 'Create calendar events when triggered by external webhook',
        category: 'calendar',
        tags: ['calendar', 'webhook', 'event', 'integration'],
        nodes: [
            nodes.webhook('trigger', '/api/automation/calendar-event', 'POST', 0),
            nodes.calendarCreate('create-event', {
                title: '{{ $node.trigger.body.title }}',
                startsAt: '{{ $node.trigger.body.startsAt }}',
                endsAt: '{{ $node.trigger.body.endsAt }}',
                description: '{{ $node.trigger.body.description }}',
                type: 'event',
            }, 1),
            nodes.httpRespond('respond', 201, '{"success": true, "eventId": "{{ $node.create-event.data._id }}"}', 2),
        ],
        edges: createEdgeChain(['trigger', 'create-event', 'respond']),
    },

    {
        id: 'calendar-daily-reminder',
        name: 'Daily Calendar Reminder',
        description: "Get today's events and send summary notification",
        category: 'calendar',
        tags: ['calendar', 'schedule', 'notification', 'daily'],
        nodes: [
            nodes.schedule('trigger', '0 8 * * *', 'Every day at 8 AM', 0),
            nodes.calendarGet('get-events', 'getByDateRange', {
                startDate: '{{ $now }}',
                endDate: '{{ $now + 86400000 }}',
            }, 1),
            nodes.openai('summarize', "Summarize today's calendar events:\n{{ $node.get-events.data | json }}", 'gpt-4o-mini', 2),
            nodes.slack('notify', '#daily-updates', "📅 Today's Schedule:\n{{ $node.summarize.data.response }}", 3),
        ],
        edges: createEdgeChain(['trigger', 'get-events', 'summarize', 'notify']),
    },

    {
        id: 'calendar-meeting-notification',
        name: 'Meeting Notification',
        description: 'Send email notifications for new calendar meetings',
        category: 'calendar',
        tags: ['calendar', 'meeting', 'email', 'notification'],
        nodes: [
            nodes.eventTrigger('trigger', 'calendar.event.created', 0),
            nodes.calendarGet('get-event', 'getById', { eventId: '{{ $node.trigger.data.eventId }}' }, 1),
            nodes.ifCondition('check-type', '{{ $node.get-event.data.type === "meeting" }}', 2),
            nodes.email('notify',
                '{{ $node.get-event.data.attendees }}',
                'New Meeting: {{ $node.get-event.data.title }}',
                'You have been invited to a meeting.\n\nTitle: {{ $node.get-event.data.title }}\nTime: {{ $node.get-event.data.startsAt | date }}\nLocation: {{ $node.get-event.data.location }}',
                3
            ),
        ],
        edges: createEdgeChain(['trigger', 'get-event', 'check-type', 'notify']),
    },

    {
        id: 'calendar-sync-external',
        name: 'Sync External Calendar',
        description: 'Sync events from external calendar API (Google, Outlook)',
        category: 'calendar',
        tags: ['calendar', 'sync', 'integration', 'google', 'outlook'],
        nodes: [
            nodes.schedule('trigger', '0 */6 * * *', 'Every 6 hours', 0),
            nodes.httpRequest('fetch', 'GET', 'https://api.example.com/calendar/events', '{"Authorization": "Bearer {{ $env.CALENDAR_API_KEY }}"}', 1),
            nodes.loop('loop', '{{ $node.fetch.data.events }}', 2),
            nodes.calendarCreate('create', {
                title: '{{ $item.title }}',
                startsAt: '{{ $item.start }}',
                endsAt: '{{ $item.end }}',
                description: '{{ $item.description }}',
            }, 3),
        ],
        edges: createEdgeChain(['trigger', 'fetch', 'loop', 'create']),
    },
];
