import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

/**
 * Analytics Feature Agent
 * Provides AI tools for data analysis and reporting
 */
export const agent: FeatureAgent = {
    tools: {
        analyzeData: {
            description: "Analyze data from a specific source (e.g., 'sales', 'tasks') and return insights.",
            type: "query",
            handler: api.features.analytics.queries.analyze, // Placeholder, assumes query exists
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                source: z.string().describe("Data source to analyze"),
                metric: z.string().optional().describe("Specific metric to calculate"),
            })
        },
        generateReport: {
            description: "Generate a summary report for a given time range.",
            type: "mutation", // Mutation because it might save the report
            handler: api.features.analytics.mutations.generateReport, // Placeholder
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                title: z.string().describe("Report title"),
                rangeStart: z.number().describe("Start date timestamp"),
                rangeEnd: z.number().describe("End date timestamp"),
            })
        }
    }
};
