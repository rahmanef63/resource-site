import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

/**
 * Calendar Feature Agent
 * Provides AI tools for calendar/event management operations
 */
export const agent: FeatureAgent = {
    tools: {
        create: {
            description: "Create a new calendar event with title, start time, and optional end time/location.",
            type: "mutation",
            handler: api.features.calendar.mutations.create,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                title: z.string().describe("Title of the event"),
                startsAt: z.number().describe("Start time as Unix timestamp in milliseconds"),
                endsAt: z.number().optional().describe("End time as Unix timestamp in milliseconds"),
                description: z.string().optional().describe("Event description"),
                location: z.string().optional().describe("Event location"),
                color: z.string().optional().describe("Color code for the event"),
                type: z.string().optional().describe("Event type (meeting, reminder, etc.)"),
                allDay: z.boolean().optional().describe("Whether this is an all-day event"),
            })
        },
        list: {
            description: "List calendar events within an optional date range.",
            type: "query",
            handler: api.features.calendar.queries.list,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                rangeStart: z.number().optional().describe("Start of date range (Unix timestamp in ms)"),
                rangeEnd: z.number().optional().describe("End of date range (Unix timestamp in ms)"),
            })
        },
        get: {
            description: "Get a specific calendar event by ID.",
            type: "query",
            handler: api.features.calendar.queries.get,
            args: z.object({
                id: z.string().describe("ID of the calendar event"),
            })
        },
        update: {
            description: "Update an existing calendar event's title, times, description, or location.",
            type: "mutation",
            handler: api.features.calendar.mutations.update,
            args: z.object({
                id: z.string().describe("ID of the event to update"),
                patch: z.object({
                    title: z.string().optional(),
                    startsAt: z.number().optional(),
                    endsAt: z.number().nullable().optional(),
                    description: z.string().nullable().optional(),
                    location: z.string().nullable().optional(),
                    color: z.string().nullable().optional(),
                    type: z.string().nullable().optional(),
                    allDay: z.boolean().optional(),
                }).describe("Fields to update"),
            })
        },
        delete: {
            description: "Delete a calendar event permanently.",
            type: "mutation",
            handler: api.features.calendar.mutations.remove,
            args: z.object({
                id: z.string().describe("ID of the event to delete"),
            })
        }
    }
};
