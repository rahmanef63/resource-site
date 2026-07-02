/**
 * Calendar Agent
 * 
 * A sub-agent specialized in calendar/event management.
 * Provides CRUD tools for calendar events in a workspace.
 */

import type { SubAgent, SubAgentTool, SubAgentContext, ToolResult } from "@/frontend/shared/ai/agent";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { anyApi } from "convex/server";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api: any = anyApi;
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// Tool Handlers
// ============================================================================

const createEventHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "calendar",
            tool: "create",
            args: {
                workspaceId: ctx.workspaceId,
                title: params.title,
                startsAt: params.startTime,
                endsAt: params.endTime,
                description: params.description,
                location: params.location,
                allDay: params.allDay,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { eventId: result.data },
            message: `Created event "${params.title}" successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create event",
        };
    }
};

const listEventsHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "calendar",
            tool: "list",
            args: {
                workspaceId: ctx.workspaceId,
                rangeStart: params.startDate,
                rangeEnd: params.endDate,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const events = result.data || [];
        const limitedEvents = params.limit ? events.slice(0, params.limit) : events.slice(0, 20);

        return {
            success: true,
            data: limitedEvents.map((event: any) => ({
                id: event._id,
                title: event.title,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                location: event.location,
                allDay: event.allDay,
            })),
            message: `Found ${limitedEvents.length} event(s)`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to list events",
        };
    }
};

const getEventHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "calendar",
            tool: "get",
            args: {
                id: params.eventId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const event = result.data;
        if (!event) {
            return { success: false, error: "Event not found" };
        }

        return {
            success: true,
            data: {
                id: event._id,
                title: event.title,
                description: event.description,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                location: event.location,
                allDay: event.allDay,
            },
            message: `Retrieved event "${event.title}"`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get event",
        };
    }
};

const updateEventHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const patch: any = {};
        if (params.title !== undefined) patch.title = params.title;
        if (params.description !== undefined) patch.description = params.description;
        if (params.startTime !== undefined) patch.startsAt = params.startTime;
        if (params.endTime !== undefined) patch.endsAt = params.endTime;
        if (params.location !== undefined) patch.location = params.location;
        if (params.allDay !== undefined) patch.allDay = params.allDay;

        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "calendar",
            tool: "update",
            args: {
                id: params.eventId,
                patch,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { eventId: params.eventId },
            message: `Updated event successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update event",
        };
    }
};

const deleteEventHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "calendar",
            tool: "delete",
            args: {
                id: params.eventId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { eventId: params.eventId },
            message: `Deleted event successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete event",
        };
    }
};

// ============================================================================
// Tool Definitions
// ============================================================================

const calendarTools: SubAgentTool[] = [
    {
        name: "createEvent",
        description: "Create a new calendar event with a title and start time. Optionally set end time, location, and description.",
        parameters: {
            title: {
                type: "string",
                description: "Title of the event",
                required: true,
            },
            startTime: {
                type: "number",
                description: "Start time as Unix timestamp in milliseconds",
                required: true,
            },
            endTime: {
                type: "number",
                description: "End time as Unix timestamp in milliseconds",
                required: false,
            },
            description: {
                type: "string",
                description: "Event description",
                required: false,
            },
            location: {
                type: "string",
                description: "Event location",
                required: false,
            },
            allDay: {
                type: "boolean",
                description: "Whether this is an all-day event",
                required: false,
            },
        },
        handler: createEventHandler,
    },
    {
        name: "listEvents",
        description: "List calendar events, optionally filtered by date range",
        parameters: {
            startDate: {
                type: "number",
                description: "Start of date range as Unix timestamp in milliseconds",
                required: false,
            },
            endDate: {
                type: "number",
                description: "End of date range as Unix timestamp in milliseconds",
                required: false,
            },
            limit: {
                type: "number",
                description: "Maximum number of events to return (default: 20)",
                required: false,
            },
        },
        handler: listEventsHandler,
    },
    {
        name: "getEvent",
        description: "Get a specific calendar event by ID",
        parameters: {
            eventId: {
                type: "string",
                description: "The ID of the event to retrieve",
                required: true,
            },
        },
        handler: getEventHandler,
    },
    {
        name: "updateEvent",
        description: "Update an existing calendar event",
        parameters: {
            eventId: {
                type: "string",
                description: "The ID of the event to update",
                required: true,
            },
            title: {
                type: "string",
                description: "New title for the event",
                required: false,
            },
            description: {
                type: "string",
                description: "New description for the event",
                required: false,
            },
            startTime: {
                type: "number",
                description: "New start time as Unix timestamp in milliseconds",
                required: false,
            },
            endTime: {
                type: "number",
                description: "New end time as Unix timestamp in milliseconds",
                required: false,
            },
            location: {
                type: "string",
                description: "New location for the event",
                required: false,
            },
            allDay: {
                type: "boolean",
                description: "Whether this is an all-day event",
                required: false,
            },
        },
        handler: updateEventHandler,
    },
    {
        name: "deleteEvent",
        description: "Delete a calendar event permanently",
        parameters: {
            eventId: {
                type: "string",
                description: "The ID of the event to delete",
                required: true,
            },
        },
        handler: deleteEventHandler,
    },
];

// ============================================================================
// Keywords for Query Routing
// ============================================================================

const CALENDAR_KEYWORDS = [
    "calendar",
    "event",
    "events",
    "schedule",
    "meeting",
    "appointment",
    "create event",
    "new event",
    "add event",
    "schedule meeting",
    "book",
    "list events",
    "show calendar",
    "my schedule",
    "upcoming",
    "today",
    "tomorrow",
    "this week",
    "next week",
    "reschedule",
    "cancel event",
    "delete event",
];

// Indonesian keywords
const CALENDAR_KEYWORDS_ID = [
    "kalender",
    "acara",
    "jadwal",
    "rapat",
    "pertemuan",
    "buat acara",
    "tambah acara",
    "hapus acara",
];

const ALL_KEYWORDS = [...CALENDAR_KEYWORDS, ...CALENDAR_KEYWORDS_ID];

// ============================================================================
// Agent Definition
// ============================================================================

export const calendarAgent: SubAgent = {
    id: "calendar-agent",
    name: "Calendar Agent",
    description: "manages calendar events - schedule, view, update, and delete events",
    featureId: "calendar",
    icon: "Calendar",
    tools: calendarTools,

    canHandle: (query: string, _ctx: SubAgentContext): number => {
        const lowerQuery = query.toLowerCase();

        // Check for exact matches first (higher confidence)
        for (const keyword of ALL_KEYWORDS) {
            if (lowerQuery.includes(keyword)) {
                // Action keywords get higher confidence
                if (
                    keyword.includes("create") ||
                    keyword.includes("buat") ||
                    keyword.includes("schedule") ||
                    keyword.includes("book") ||
                    keyword.includes("delete") ||
                    keyword.includes("hapus")
                ) {
                    return 0.9;
                }
                return 0.75;
            }
        }

        // Time-related queries might be calendar related
        const timeKeywords = ["today", "tomorrow", "week", "month", "when"];
        for (const keyword of timeKeywords) {
            if (lowerQuery.includes(keyword)) {
                return 0.4;
            }
        }

        return 0;
    },

    getContext: async (ctx: SubAgentContext): Promise<string> => {
        if (!ctx.workspaceId || !ctx.convex) {
            return "No workspace context available.";
        }

        try {
            // Get events for the next 7 days
            const now = Date.now();
            const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

            const events = await (ctx.convex as any).query(api.features.calendar.queries.list, {
                workspaceId: ctx.workspaceId,
                rangeStart: now,
                rangeEnd: weekFromNow,
            });

            const limitedEvents = events.slice(0, 10);

            if (limitedEvents.length === 0) {
                return "No upcoming events in the next 7 days.";
            }

            const eventList = limitedEvents
                .map((event: any) => {
                    const date = new Date(event.startsAt).toLocaleDateString();
                    const time = new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return `- "${event.title}" on ${date} at ${time}${event.location ? ` at ${event.location}` : ''}`;
                })
                .join("\n");

            return `Upcoming events:\n${eventList}`;
        } catch (error) {
            console.error("[CalendarAgent] Failed to get context:", error);
            return "Unable to load calendar context.";
        }
    },

    systemPrompt: `You are a calendar and scheduling assistant. You help users manage their events and schedule.

When a user wants to schedule an event:
1. Title (required)
2. Start time (required) - convert natural language like "tomorrow at 3pm" to timestamps
3. End time (optional)
4. Location (optional)
5. Description (optional)

When listing events, format them clearly with date, time, and location.
Help users find free time slots and avoid scheduling conflicts.`,
};

export default calendarAgent;
