import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

/**
 * CRM Feature Agent
 * Provides AI tools for customer relationship management
 */
export const agent: FeatureAgent = {
    tools: {
        create: {
            description: "Create a new customer/lead with contact details.",
            type: "mutation",
            handler: api.features.crm.mutations.createCustomer,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                name: z.string().describe("Customer name"),
                email: z.string().describe("Customer email"),
                phone: z.string().optional().describe("Phone number"),
                company: z.string().optional().describe("Company name"),
                status: z.enum(["lead", "prospect", "customer", "inactive"]).optional().describe("Customer status"),
                tags: z.array(z.string()).optional().describe("Tags"),
            })
        },
        list: {
            description: "List all customers/leads in the workspace, optionally filtered by status.",
            type: "query",
            handler: api.features.crm.queries.getWorkspaceCustomers,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
                status: z.enum(["lead", "prospect", "customer", "inactive"]).optional().describe("Filter by status"),
            })
        }
    }
};
