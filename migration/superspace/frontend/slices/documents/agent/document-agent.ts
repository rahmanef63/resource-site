/**
 * Document Agent
 * 
 * A sub-agent specialized in document management.
 * Provides CRUD tools for documents in a workspace.
 */

import type { SubAgent, SubAgentTool, SubAgentContext, ToolResult } from "@/frontend/shared/ai/agent";
// Use anyApi to avoid TS2589 deep instantiation when many features are registered.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { anyApi } from "convex/server";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api: any = anyApi;
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// Tool Handlers
// ============================================================================

const createDocumentHandler = async (
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
        // If content is empty or missing, generate rich template based on the title
        let contentToUse = params.content || "";

        if (!contentToUse.trim()) {
            // Generate rich content template based on title
            const title = params.title || "Untitled Document";
            contentToUse = `# ${title}

## Overview

Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## Key Points

- **Point 1**: Ut enim ad minim veniam, quis nostrud exercitation
- **Point 2**: Duis aute irure dolor in reprehenderit in voluptate
- **Point 3**: Excepteur sint occaecat cupidatat non proident
- *Italic text* for emphasis

### Numbered List

1. First item in the list
2. Second item with details
3. Third item to complete

## Tasks

- [ ] First task to complete
- [ ] Second task to review  
- [x] Completed task example

## Code Example

\`\`\`javascript
// Sample code block
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Important Note

> This is a **blockquote** example for important notes and callouts.
> It can span multiple lines.

## Table Example

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Info     | Details  |

---

*Document created by AI Document Agent*
`;
        }


        // Use Secure Gateway
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "documents",
            tool: "create",
            args: {
                title: params.title,
                content: contentToUse,
                isPublic: params.isPublic ?? false,
                workspaceId: ctx.workspaceId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { documentId: result.data },
            message: `Created document "${params.title}" successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create document",
        };
    }
};


const searchDocumentsHandler = async (
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
        // Use Secure Gateway
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "documents",
            tool: "search",
            args: {
                workspaceId: ctx.workspaceId,
                query: params.query,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const results = result.data;
        const limitedResults = params.limit ? results.slice(0, params.limit) : results;

        return {
            success: true,
            data: limitedResults.map((doc: any) => ({
                id: doc._id,
                title: doc.title,
                isPublic: doc.isPublic,
                lastModified: doc.lastModified,
                author: doc.author?.name,
            })),
            message: `Found ${limitedResults.length} document(s) matching "${params.query}"`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to search documents",
        };
    }
};

const listDocumentsHandler = async (
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
        // Use Secure Gateway
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "documents",
            tool: "list",
            args: {
                workspaceId: ctx.workspaceId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const results = result.data;
        const limitedResults = params.limit ? results.slice(0, params.limit) : results.slice(0, 20);

        return {
            success: true,
            data: limitedResults.map((doc: any) => ({
                id: doc._id,
                title: doc.title,
                isPublic: doc.isPublic,
                lastModified: doc.lastModified,
                author: doc.author?.name,
            })),
            message: `Found ${limitedResults.length} document(s) in workspace`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to list documents",
        };
    }
};

const getDocumentHandler = async (
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
        // Use Secure Gateway
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "documents",
            tool: "get",
            args: {
                id: params.documentId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const doc = result.data;
        if (!doc) {
            return { success: false, error: "Document not found" };
        }

        return {
            success: true,
            data: {
                id: doc._id,
                title: doc.title,
                content: doc.content,
                isPublic: doc.isPublic,
                lastModified: doc.lastModified,
            },
            message: `Retrieved document "${doc.title}"`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get document",
        };
    }
};

const updateDocumentHandler = async (
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
        // Use Secure Gateway
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "documents",
            tool: "update",
            args: {
                id: params.documentId,
                title: params.title,
                content: params.content,
                isPublic: params.isPublic,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { documentId: params.documentId },
            message: `Updated document successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update document",
        };
    }
};

const deleteDocumentHandler = async (
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
        // Use Secure Gateway
        const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: ctx.workspaceId,
            feature: "documents",
            tool: "delete",
            args: {
                id: params.documentId,
            }
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return {
            success: true,
            data: { documentId: params.documentId },
            message: `Deleted document successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete document",
        };
    }
};

// ============================================================================
// Tool Definitions
// ============================================================================

const documentTools: SubAgentTool[] = [
    {
        name: "createDocument",
        description: "Create a new document with a title AND full content. You MUST generate the document body - never create empty documents. Write the actual text, lists, or information the user requested.",
        parameters: {
            title: {
                type: "string",
                description: "Title of the document",
                required: true,
            },
            content: {
                type: "string",
                description: "REQUIRED. The full body content of the document in Markdown format. You MUST generate actual content here - never leave this empty. Include headers (# ##), bullet points, checkboxes (- [ ]), code blocks, etc. based on what the user requested.",
                required: true,
            },
            isPublic: {
                type: "boolean",
                description: "Whether the document is publicly visible (default: false)",
                required: false,
            },
        },
        handler: createDocumentHandler,
    },
    {
        name: "searchDocuments",
        description: "Search for documents by title in the current workspace",
        parameters: {
            query: {
                type: "string",
                description: "Search query to match against document titles",
                required: true,
            },
            limit: {
                type: "number",
                description: "Maximum number of results to return (default: 10)",
                required: false,
            },
        },
        handler: searchDocumentsHandler,
    },
    {
        name: "listDocuments",
        description: "List all documents in the current workspace",
        parameters: {
            limit: {
                type: "number",
                description: "Maximum number of documents to return (default: 20)",
                required: false,
            },
        },
        handler: listDocumentsHandler,
    },
    {
        name: "getDocument",
        description: "Get a specific document by ID, including its content",
        parameters: {
            documentId: {
                type: "string",
                description: "The ID of the document to retrieve",
                required: true,
            },
        },
        handler: getDocumentHandler,
    },
    {
        name: "updateDocument",
        description: "Update an existing document's title, content, or visibility",
        parameters: {
            documentId: {
                type: "string",
                description: "The ID of the document to update",
                required: true,
            },
            title: {
                type: "string",
                description: "New title for the document",
                required: false,
            },
            content: {
                type: "string",
                description: "New content for the document. If updating a list or text, provide the complete new content or the relevant section in Markdown.",
                required: false,
            },
            isPublic: {
                type: "boolean",
                description: "Whether the document should be publicly visible",
                required: false,
            },
        },
        handler: updateDocumentHandler,
    },
    {
        name: "deleteDocument",
        description: "Delete a document permanently",
        parameters: {
            documentId: {
                type: "string",
                description: "The ID of the document to delete",
                required: true,
            },
        },
        handler: deleteDocumentHandler,
    },
];

// ============================================================================
// Keywords for Query Routing
// ============================================================================

const DOCUMENT_KEYWORDS = [
    "document",
    "doc",
    "docs",
    "file",
    "create document",
    "new document",
    "make document",
    "write",
    "save",
    "note",
    "notes",
    "list documents",
    "find document",
    "search document",
    "show documents",
    "get document",
    "open document",
    "read document",
    "edit document",
    "update document",
    "delete document",
    "remove document",
];

// Indonesian keywords
const DOCUMENT_KEYWORDS_ID = [
    "dokumen",
    "buat dokumen",
    "buat file",
    "tulis",
    "simpan",
    "catatan",
    "cari dokumen",
    "hapus dokumen",
    "edit dokumen",
    "daftar dokumen",
];

const ALL_KEYWORDS = [...DOCUMENT_KEYWORDS, ...DOCUMENT_KEYWORDS_ID];

// ============================================================================
// Agent Definition
// ============================================================================

export const documentAgent: SubAgent = {
    id: "document-agent",
    name: "Document Agent",
    description: "manages documents - create, search, read, update, and delete documents in your workspace",
    featureId: "documents",
    icon: "FileText",
    tools: documentTools,

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
                    keyword.includes("update") ||
                    keyword.includes("edit")
                ) {
                    return 0.9;
                }
                return 0.75;
            }
        }

        // Fuzzy match - check for partial matches
        const fuzzyKeywords = ["doc", "file", "note", "write"];
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
            const recentDocs = await (ctx.convex as any).query(api.features.docs.documents.getWorkspaceDocuments, {
                workspaceId: ctx.workspaceId,
            });

            const limitedDocs = recentDocs.slice(0, 10);

            if (limitedDocs.length === 0) {
                return "No documents in this workspace yet.";
            }

            const docList = limitedDocs
                .map((doc: any) => `- "${doc.title}" (ID: ${doc._id}, ${doc.isPublic ? "public" : "private"})`)
                .join("\n");

            return `Recent documents:\n${docList}`;
        } catch (error) {
            console.error("[DocumentAgent] Failed to get context:", error);
            return "Unable to load document context.";
        }
    },

    systemPrompt: `You are a document management assistant. You help users create, find, read, update, and delete documents.

CRITICAL INSTRUCTIONS:
1. **CREATE RICH CONTENT**: When a user creates a document (e.g., "grocery list", "meeting notes"), you MUST generate the actual content for them.
   - Do NOT just create a file with a title and empty body.
   - Write out the list, the agenda, or the text they asked for in valid Markdown.
   - Use headers, bullet points, and check boxes.
2. **Title Generation**: If no title is given, generate a short, descriptive one.
3. **Be Helpful**: If the user's request is vague, take initiative to create a useful template or starting point in the document.`,
};

export default documentAgent;
