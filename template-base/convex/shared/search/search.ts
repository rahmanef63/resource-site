/**
 * Shared Search Implementation
 * Provides unified search functionality across all ERP modules
 */

import { v } from "convex/values";
import { query, mutation, action } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";

// Search across multiple entities
export const searchEntities = query({
  args: {
    query: v.string(),
    entities: v.array(v.string()),
    filters: v.optional(v.array(v.any())),
    sort: v.optional(v.any()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { query, entities, filters, sort, limit = 20, cursor, workspaceId }) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // For now, we'll use basic search with users table as an example
    // In a real implementation, you'd dynamically query each entity
    let results: any[] = [];
    const searchResults: any[] = [];

    // Example search in users table
    if (entities.includes("users")) {
      const users = await ctx.db.query("users").collect();

      const filteredUsers = users.map((user: any) => ({
        ...user,
        _entity: "users",
        _score: calculateScore(user, query),
      })).filter((user: any) => user._score > 0);

      searchResults.push(...filteredUsers);
    }

    // Sort by relevance score
    searchResults.sort((a, b) => b._score - a._score);

    // Apply limit
    const limitedResults = searchResults.slice(0, limit);

    return {
      results: limitedResults,
      total: searchResults.length,
      hasMore: searchResults.length > limit,
    };
  },
});

// Save a search configuration
export const saveSearch = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    query: v.string(),
    entities: v.array(v.string()),
    filters: v.optional(v.array(v.any())),
    sort: v.optional(v.any()),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Create saved search entry in a temporary structure
    // In a real implementation, this would be stored in a dedicated table
    const searchId = `saved_search_${Date.now()}`;

    // For now, return a mock response
    return {
      id: searchId,
      ...args,
      userId: identity.subject,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
});

// Get saved searches
export const getSavedSearches = query({
  args: {
    workspaceId: v.id("workspaces"),
    includePublic: v.boolean(),
  },
  handler: async (ctx, { workspaceId, includePublic }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // For now, return mock data
    // In a real implementation, this would query from the database
    return [];
  },
});

// Get search suggestions
export const getSearchSuggestions = query({
  args: {
    partial: v.string(),
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { partial, workspaceId, limit = 5 }) => {
    if (!partial || partial.length < 2) return [];

    // Return mock suggestions
    return [
      `${partial} example 1`,
      `${partial} example 2`,
      `${partial} example 3`,
    ].slice(0, limit);
  },
});

// Rebuild search index for an entity
export const rebuildSearchIndex = action({
  args: {
    entity: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { entity, workspaceId }) => {

    // Implementation would rebuild the search index
    return { success: true, entity, updatedAt: Date.now() };
  },
});

// Helper function to calculate relevance score
function calculateScore(item: any, query: string): number {
  if (!query) return 1;

  let score = 0;
  const queryLower = query.toLowerCase();

  // Check common fields
  const fieldsToCheck = ['name', 'email', 'title', 'description'];

  for (const field of fieldsToCheck) {
    const value = item[field];
    if (typeof value === "string") {
      const valueLower = value.toLowerCase();

      // Exact match gets highest score
      if (valueLower === queryLower) {
        score += 100;
      }
      // Starts with query
      else if (valueLower.startsWith(queryLower)) {
        score += 50;
      }
      // Contains query
      else if (valueLower.includes(queryLower)) {
        score += 25;
      }
    }
  }

  return score;
}