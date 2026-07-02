/**
 * Tasks Agent
 * 
 * A sub-agent specialized in task management.
 * Provides CRUD tools for tasks in a workspace.
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

const createTaskHandler = async (
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
            feature: "tasks",
            tool: "create",
            args: {
                workspaceId: ctx.workspaceId,
                title: params.title,
                description: params.description,
                status: params.status,
                priority: params.priority,
                dueDate: params.dueDate,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { taskId: result.data },
            message: `Created task "${params.title}" successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create task",
        };
    }
};

const listTasksHandler = async (
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
            feature: "tasks",
            tool: "list",
            args: {
                workspaceId: ctx.workspaceId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const tasks = result.data || [];
        const limitedTasks = params.limit ? tasks.slice(0, params.limit) : tasks.slice(0, 20);

        return {
            success: true,
            data: limitedTasks.map((task: any) => ({
                id: task._id,
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
            })),
            message: `Found ${limitedTasks.length} task(s) in workspace`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to list tasks",
        };
    }
};

const getTaskHandler = async (
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
            feature: "tasks",
            tool: "get",
            args: {
                id: params.taskId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const task = result.data;
        if (!task) {
            return { success: false, error: "Task not found" };
        }

        return {
            success: true,
            data: {
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
            },
            message: `Retrieved task "${task.title}"`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get task",
        };
    }
};

const updateTaskHandler = async (
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
        if (params.status !== undefined) patch.status = params.status;
        if (params.priority !== undefined) patch.priority = params.priority;
        if (params.dueDate !== undefined) patch.dueDate = params.dueDate;

        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "tasks",
            tool: "update",
            args: {
                id: params.taskId,
                patch,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { taskId: params.taskId },
            message: `Updated task successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update task",
        };
    }
};

const completeTaskHandler = async (
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
            feature: "tasks",
            tool: "update",
            args: {
                id: params.taskId,
                patch: { status: "completed" },
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { taskId: params.taskId },
            message: `Marked task as complete`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to complete task",
        };
    }
};

const deleteTaskHandler = async (
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
            feature: "tasks",
            tool: "delete",
            args: {
                id: params.taskId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { taskId: params.taskId },
            message: `Deleted task successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete task",
        };
    }
};

// ============================================================================
// Tool Definitions
// ============================================================================

const taskTools: SubAgentTool[] = [
    {
        name: "createTask",
        description: "Create a new task with a title. You can also set description, priority, status, and due date.",
        parameters: {
            title: {
                type: "string",
                description: "Title of the task",
                required: true,
            },
            description: {
                type: "string",
                description: "Detailed description of the task",
                required: false,
            },
            priority: {
                type: "string",
                description: "Task priority: low, medium, or high",
                enum: ["low", "medium", "high"],
                required: false,
            },
            status: {
                type: "string",
                description: "Task status: todo, in_progress, or completed",
                enum: ["todo", "in_progress", "completed"],
                required: false,
            },
            dueDate: {
                type: "number",
                description: "Due date as Unix timestamp in milliseconds",
                required: false,
            },
        },
        handler: createTaskHandler,
    },
    {
        name: "listTasks",
        description: "List all tasks in the current workspace",
        parameters: {
            limit: {
                type: "number",
                description: "Maximum number of tasks to return (default: 20)",
                required: false,
            },
        },
        handler: listTasksHandler,
    },
    {
        name: "getTask",
        description: "Get a specific task by ID",
        parameters: {
            taskId: {
                type: "string",
                description: "The ID of the task to retrieve",
                required: true,
            },
        },
        handler: getTaskHandler,
    },
    {
        name: "updateTask",
        description: "Update an existing task's title, description, status, priority, or due date",
        parameters: {
            taskId: {
                type: "string",
                description: "The ID of the task to update",
                required: true,
            },
            title: {
                type: "string",
                description: "New title for the task",
                required: false,
            },
            description: {
                type: "string",
                description: "New description for the task",
                required: false,
            },
            status: {
                type: "string",
                description: "New status: todo, in_progress, or completed",
                enum: ["todo", "in_progress", "completed"],
                required: false,
            },
            priority: {
                type: "string",
                description: "New priority: low, medium, or high",
                enum: ["low", "medium", "high"],
                required: false,
            },
            dueDate: {
                type: "number",
                description: "New due date as Unix timestamp in milliseconds",
                required: false,
            },
        },
        handler: updateTaskHandler,
    },
    {
        name: "completeTask",
        description: "Mark a task as completed",
        parameters: {
            taskId: {
                type: "string",
                description: "The ID of the task to complete",
                required: true,
            },
        },
        handler: completeTaskHandler,
    },
    {
        name: "deleteTask",
        description: "Delete a task permanently",
        parameters: {
            taskId: {
                type: "string",
                description: "The ID of the task to delete",
                required: true,
            },
        },
        handler: deleteTaskHandler,
    },
];

// ============================================================================
// Keywords for Query Routing
// ============================================================================

const TASK_KEYWORDS = [
    "task",
    "tasks",
    "todo",
    "to-do",
    "to do",
    "create task",
    "new task",
    "add task",
    "list tasks",
    "show tasks",
    "my tasks",
    "pending tasks",
    "complete task",
    "finish task",
    "mark done",
    "delete task",
    "remove task",
    "update task",
    "edit task",
    "assign",
    "due date",
    "deadline",
    "priority",
];

// Indonesian keywords
const TASK_KEYWORDS_ID = [
    "tugas",
    "buat tugas",
    "tambah tugas",
    "daftar tugas",
    "selesai",
    "hapus tugas",
    "tenggat",
];

const ALL_KEYWORDS = [...TASK_KEYWORDS, ...TASK_KEYWORDS_ID];

// ============================================================================
// Agent Definition
// ============================================================================

export const tasksAgent: SubAgent = {
    id: "tasks-agent",
    name: "Tasks Agent",
    description: "manages tasks - create, list, complete, update, and delete tasks in your workspace",
    featureId: "tasks",
    icon: "CheckSquare",
    tools: taskTools,

    canHandle: (query: string, _ctx: SubAgentContext): number => {
        const lowerQuery = query.toLowerCase();

        // Check for exact matches first (higher confidence)
        for (const keyword of ALL_KEYWORDS) {
            if (lowerQuery.includes(keyword)) {
                // Action keywords get higher confidence
                if (
                    keyword.includes("create") ||
                    keyword.includes("buat") ||
                    keyword.includes("delete") ||
                    keyword.includes("hapus") ||
                    keyword.includes("complete") ||
                    keyword.includes("selesai")
                ) {
                    return 0.9;
                }
                return 0.75;
            }
        }

        // Fuzzy match
        const fuzzyKeywords = ["todo", "task", "assign", "deadline"];
        for (const keyword of fuzzyKeywords) {
            if (lowerQuery.includes(keyword)) {
                return 0.5;
            }
        }

        return 0;
    },

    getContext: async (ctx: SubAgentContext): Promise<string> => {
        if (!ctx.workspaceId || !ctx.convex) {
            return "No workspace context available.";
        }

        try {
            const tasks = await (ctx.convex as any).query(api.features.tasks.queries.list, {
                workspaceId: ctx.workspaceId,
            });

            const limitedTasks = tasks.slice(0, 10);

            if (limitedTasks.length === 0) {
                return "No tasks in this workspace yet.";
            }

            const taskList = limitedTasks
                .map((task: any) => `- "${task.title}" (${task.status}, ${task.priority} priority)`)
                .join("\n");

            return `Recent tasks:\n${taskList}`;
        } catch (error) {
            console.error("[TasksAgent] Failed to get context:", error);
            return "Unable to load task context.";
        }
    },

    systemPrompt: `You are a task management assistant. You help users create, list, complete, update, and delete tasks.

When a user wants to create a task, always ask for or infer:
1. Task title (required)
2. Description (optional but helpful)
3. Priority (low, medium, high - default to medium)
4. Due date if mentioned

When listing tasks, summarize them clearly with their status and priority.
When completing tasks, confirm the action was successful.`,
};

export default tasksAgent;
