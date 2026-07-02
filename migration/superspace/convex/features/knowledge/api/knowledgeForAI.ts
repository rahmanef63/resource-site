import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { resolveCandidateUserIds } from "../../../auth/helpers";

/**
 * Get documents from the documents table for AI context
 * This is the primary source of knowledge from the Knowledge feature
 */
export const getDocumentsForAIContext = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()), // "article" or "document" or undefined for all
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, category, limit = 20 }) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) return [];

    // Get documents from the workspace (capped to prevent unbounded reads)
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .take(1000);

    // Filter by visibility (public or owned by user)
    const visibleDocs = documents.filter(
      (doc) => doc.isPublic || candidateIds.includes(String(doc.createdBy))
    );

    // Optionally filter by category
    let filteredDocs = visibleDocs;
    if (category) {
      const categoryTag = `__category:${category}`;
      filteredDocs = visibleDocs.filter((doc) => {
        const tags = doc.metadata?.tags || [];
        // If category is specified, match it. If no tags, default to "document"
        if (category === "document") {
          return !tags.some((t: string) => t.startsWith("__category:")) || 
                 tags.includes(categoryTag);
        }
        return tags.includes(categoryTag);
      });
    }

    // Sort by last modified and limit
    const sortedDocs = filteredDocs
      .sort((a, b) => (b.lastModified ?? b._creationTime) - (a.lastModified ?? a._creationTime))
      .slice(0, limit);

    // Format for AI consumption
    return sortedDocs.map((doc) => ({
      id: doc._id,
      title: doc.title,
      content: doc.content || "",
      isPublic: doc.isPublic,
      category: getDocumentCategory(doc.metadata?.tags),
      lastModified: doc.lastModified ?? doc._creationTime,
    }));
  },
});

/**
 * Get all knowledge context for AI in a single optimized query
 * Combines documents, workspace context, and user profile
 */
export const getFullKnowledgeContext = query({
  args: {
    workspaceId: v.id("workspaces"),
    includeDocuments: v.optional(v.boolean()),
    includeWorkspaceContext: v.optional(v.boolean()),
    documentLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const {
      workspaceId,
      includeDocuments = true,
      includeWorkspaceContext = true,
      documentLimit = 10,
    } = args;

    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) return null;

    const result: {
      workspace?: { name: string; type: string; description?: string };
      workspaceContext?: {
        teamOverview?: string;
        projectContext?: string;
        goalsObjectives?: string;
        skills?: string;
        processes?: string;
        tools?: string;
        communication?: string;
      };
      documents?: Array<{ title: string; content: string; category: string }>;
      formattedContext?: string;
    } = {};

    // Get workspace info
    const workspace = await ctx.db.get(workspaceId);
    if (workspace) {
      result.workspace = {
        name: workspace.name,
        type: workspace.type,
        description: workspace.description,
      };
    }

    // Get workspace context
    if (includeWorkspaceContext) {
      const wsContext = await ctx.db
        .query("workspaceContext")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .unique();
      
      if (wsContext) {
        result.workspaceContext = {
          teamOverview: wsContext.teamOverview,
          projectContext: wsContext.projectContext,
          goalsObjectives: wsContext.goalsObjectives,
          skills: wsContext.skills,
          processes: wsContext.processes,
          tools: wsContext.tools,
          communication: wsContext.communication,
        };
      }
    }

    // Get documents
    if (includeDocuments) {
      const documents = await ctx.db
        .query("documents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .take(1000);

      const visibleDocs = documents
        .filter((doc) => doc.isPublic || candidateIds.includes(String(doc.createdBy)))
        .sort((a, b) => (b.lastModified ?? b._creationTime) - (a.lastModified ?? a._creationTime))
        .slice(0, documentLimit);

      result.documents = visibleDocs.map((doc) => ({
        title: doc.title,
        content: doc.content || "",
        category: getDocumentCategory(doc.metadata?.tags),
      }));
    }

    // Format as a single context string for AI
    result.formattedContext = formatContextForAI(result);

    return result;
  },
});

/**
 * Get document count by category for AI stats
 */
export const getDocumentCounts = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { workspaceId }) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) {
      return { articles: 0, documents: 0, total: 0 };
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .take(1000);

    const visibleDocs = documents.filter(
      (doc) => doc.isPublic || candidateIds.includes(String(doc.createdBy))
    );

    let articles = 0;
    let regularDocs = 0;

    for (const doc of visibleDocs) {
      const category = getDocumentCategory(doc.metadata?.tags);
      if (category === "article") {
        articles++;
      } else {
        regularDocs++;
      }
    }

    return {
      articles,
      documents: regularDocs,
      total: visibleDocs.length,
    };
  },
});

// Helper function to extract category from tags
function getDocumentCategory(tags?: string[]): string {
  if (!tags) return "document";
  const categoryTag = tags.find((t) => t.startsWith("__category:"));
  if (categoryTag) {
    return categoryTag.replace("__category:", "");
  }
  return "document";
}

// Helper function to format context for AI consumption
function formatContextForAI(context: {
  workspace?: { name: string; type: string; description?: string };
  workspaceContext?: {
    teamOverview?: string;
    projectContext?: string;
    goalsObjectives?: string;
    skills?: string;
    processes?: string;
    tools?: string;
    communication?: string;
  };
  documents?: Array<{ title: string; content: string; category: string }>;
}): string {
  const sections: string[] = [];

  // Workspace header
  if (context.workspace) {
    sections.push(`# Workspace: ${context.workspace.name}`);
    if (context.workspace.description) {
      sections.push(context.workspace.description);
    }
  }

  // Workspace context
  if (context.workspaceContext) {
    const wc = context.workspaceContext;
    const contextParts: string[] = [];
    
    if (wc.teamOverview) contextParts.push(`## Team Overview\n${wc.teamOverview}`);
    if (wc.projectContext) contextParts.push(`## Project Context\n${wc.projectContext}`);
    if (wc.goalsObjectives) contextParts.push(`## Goals & Objectives\n${wc.goalsObjectives}`);
    if (wc.skills) contextParts.push(`## Skills & Expertise\n${wc.skills}`);
    if (wc.processes) contextParts.push(`## Processes & Workflows\n${wc.processes}`);
    if (wc.tools) contextParts.push(`## Tools & Technologies\n${wc.tools}`);
    if (wc.communication) contextParts.push(`## Communication Preferences\n${wc.communication}`);
    
    if (contextParts.length > 0) {
      sections.push(contextParts.join("\n\n"));
    }
  }

  // Documents
  if (context.documents && context.documents.length > 0) {
    const articles = context.documents.filter((d) => d.category === "article");
    const docs = context.documents.filter((d) => d.category !== "article");

    if (articles.length > 0) {
      sections.push("# Knowledge Base Articles");
      for (const article of articles) {
        sections.push(`## ${article.title}\n${article.content}`);
      }
    }

    if (docs.length > 0) {
      sections.push("# Documents");
      for (const doc of docs) {
        sections.push(`## ${doc.title}\n${doc.content}`);
      }
    }
  }

  return sections.join("\n\n---\n\n");
}
