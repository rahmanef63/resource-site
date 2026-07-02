import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

/**
 * Tasks Feature Agent
 * Provides AI tools for task management operations
 */
export const agent: FeatureAgent = {
    tools: {
        create: {
            description: "Create a new task with title, description, and optional due date/priority.",
            type: "mutation",
            handler: api.features.tasks.mutations.create,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                title: z.string().describe("Title of the task"),
                description: z.string().optional().describe("Detailed description of the task"),
                status: z.enum(["todo", "in_progress", "completed"]).optional().describe("Task status"),
                priority: z.enum(["low", "medium", "high"]).optional().describe("Task priority"),
                dueDate: z.number().optional().describe("Due date as Unix timestamp in milliseconds"),
            })
        },
        list: {
            description: "List all tasks in the workspace, sorted by due date.",
            type: "query",
            handler: api.features.tasks.queries.list,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
            })
        },
        get: {
            description: "Get a specific task by ID.",
            type: "query",
            handler: api.features.tasks.queries.get,
            args: z.object({
                id: z.string().describe("ID of the task"),
            })
        },
        update: {
            description: "Update an existing task's title, description, status, priority, or due date.",
            type: "mutation",
            handler: api.features.tasks.mutations.update,
            args: z.object({
                id: z.string().describe("ID of the task to update"),
                patch: z.object({
                    title: z.string().optional(),
                    description: z.string().nullable().optional(),
                    status: z.enum(["todo", "in_progress", "completed"]).optional(),
                    priority: z.enum(["low", "medium", "high"]).optional(),
                    dueDate: z.number().nullable().optional(),
                }).describe("Fields to update"),
            })
        },
        delete: {
            description: "Delete a task permanently.",
            type: "mutation",
            handler: api.features.tasks.mutations.remove,
            args: z.object({
                id: z.string().describe("ID of the task to delete"),
            })
        }
    }
};
