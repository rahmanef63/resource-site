import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

/**
 * Projects Feature Agent
 * Provides AI tools for project management operations
 */
export const agent: FeatureAgent = {
    tools: {
        create: {
            description: "Create a new project with name, description, and optional priority/dates.",
            type: "mutation",
            handler: api.features.projects.mutations.createProject,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                name: z.string().describe("Name of the project"),
                description: z.string().optional().describe("Project description"),
                priority: z.enum(["low", "medium", "high"]).optional().describe("Project priority"),
                startDate: z.number().optional().describe("Start date timestamp"),
                endDate: z.number().optional().describe("End date timestamp"),
            })
        },
        list: {
            description: "List all projects in the workspace, optionally filtered by status.",
            type: "query",
            handler: api.features.projects.queries.getWorkspaceProjects,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                status: z.enum(["planning", "active", "on_hold", "completed", "archived"]).optional().describe("Filter by project status"),
            })
        }
    }
};
