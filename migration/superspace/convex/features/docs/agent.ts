import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

// @ts-ignore — deep type recursion in Convex API refs (TS5.0 local, not in Docker)
const docs = api.features.docs.documents;

export const agent: FeatureAgent = {
    tools: {
        create: {
            description: "Create a new document. Title is required.",
            type: "mutation",
            handler: docs.createDocument,
            args: z.object({
                title: z.string().describe("Title of the document"),
                content: z.string().optional().describe("Markdown content of the document"),
                isPublic: z.boolean().default(false),
                workspaceId: z.string().describe("ID of the workspace"),
            })
        },
        search: {
            description: "Search for documents by title or content.",
            type: "query",
            handler: docs.searchDocuments,
            args: z.object({
                query: z.string().describe("Search query text"),
                workspaceId: z.string().describe("ID of the workspace"),
            })
        },
        list: {
            description: "List all documents in the workspace.",
            type: "query",
            handler: docs.getWorkspaceDocuments,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
            })
        },
        get: {
            description: "Get a specific document by ID.",
            type: "query",
            handler: docs.getDocument,
            args: z.object({
                id: z.string().describe("ID of the document"),
            })
        },
        update: {
            description: "Update an existing document.",
            type: "mutation",
            handler: docs.updateDocument,
            args: z.object({
                id: z.string().describe("ID of the document"),
                title: z.string().optional(),
                content: z.string().optional(),
                isPublic: z.boolean().optional(),
            })
        },
        delete: {
            description: "Delete a document.",
            type: "mutation",
            handler: docs.deleteDocument,
            args: z.object({
                id: z.string().describe("ID of the document"),
            })
        }
    }
};
