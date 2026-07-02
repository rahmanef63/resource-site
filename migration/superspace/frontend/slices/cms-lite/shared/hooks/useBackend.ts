"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

/**
 * Backend Hook for CMS Lite with Convex Integration
 * 
 * This hook provides a unified interface for CMS Lite CRUD operations
 * using Convex backend.
 */
export function useBackend() {
  // Quicklinks mutations
  const createQuicklinkMutation = useMutation(api.features.cmsLite.quicklinks.api.mutations.createQuicklink);
  const updateQuicklinkMutation = useMutation(api.features.cmsLite.quicklinks.api.mutations.updateQuicklink);
  const deleteQuicklinkMutation = useMutation(api.features.cmsLite.quicklinks.api.mutations.deleteQuicklink);

  // Products mutations
  const createProductMutation = useMutation(api.features.cmsLite.products.api.mutations.createProduct);
  const updateProductMutation = useMutation(api.features.cmsLite.products.api.mutations.updateProduct);
  const deleteProductMutation = useMutation(api.features.cmsLite.products.api.mutations.deleteProduct);
  const importProductsMutation = useMutation(api.features.cmsLite.products.api.mutations.importProducts);

  // Posts mutations
  const createPostMutation = useMutation(api.features.cmsLite.posts.api.mutations.createPost);
  const updatePostMutation = useMutation(api.features.cmsLite.posts.api.mutations.updatePost);
  const deletePostMutation = useMutation(api.features.cmsLite.posts.api.mutations.deletePost);

  // Portfolio mutations
  const createPortfolioMutation = useMutation(api.features.cmsLite.portfolio.api.mutations.createPortfolio);
  const updatePortfolioMutation = useMutation(api.features.cmsLite.portfolio.api.mutations.updatePortfolio);
  const deletePortfolioMutation = useMutation(api.features.cmsLite.portfolio.api.mutations.deletePortfolio);

  // Website Settings mutations
  const updateWebsiteSettingsMutation = useMutation(api.features.cmsLite.website_settings.api.mutations.updateWebsiteSettings);
  const verifyDomainMutation = useMutation(api.features.cmsLite.website_settings.api.mutations.verifyDomain);

  const backend = {
    products: {
      list: async (_params?: any) => {
        console.warn('⚠️ products.list - use useQuery(api.features.cmsLite.products.api.queries.listProducts) directly');
        return { products: [] };
      },
      listAll: async (_params?: any) => {
        console.warn('⚠️ products.listAll - use useQuery(api.features.cmsLite.products.api.queries.listAllProducts) directly');
        return { products: [] };
      },
      get: async (_params?: any) => {
        console.warn('⚠️ products.get - use useQuery(api.features.cmsLite.products.api.queries.getProductBySlug) directly');
        return { product: null };
      },
      create: async (params: any) => {
        const result = await createProductMutation(params);
        return { id: result.id };
      },
      update: async (params: any) => {
        await updateProductMutation(params);
        return { success: true };
      },
      delete: async (params: any) => {
        await deleteProductMutation(params);
        return { success: true };
      },
      exportJSON: async (_params?: any) => {
        console.warn('⚠️ products.exportJSON not yet implemented');
        return { data: [] };
      },
      importJSON: async (params: { workspaceId: string; data: any[] }) => {
        const result = await importProductsMutation(params);
        return result;
      },
    },
    posts: {
      list: async (_params?: any) => {
        console.warn('⚠️ posts.list - use useQuery(api.features.cmsLite.posts.api.queries.listPosts) directly');
        return { posts: [] };
      },
      listAll: async (_params?: any) => {
        console.warn('⚠️ posts.listAll - use useQuery(api.features.cmsLite.posts.api.queries.listAllPosts) directly');
        return { posts: [] };
      },
      get: async (_params?: any) => {
        console.warn('⚠️ posts.get - use useQuery(api.features.cmsLite.posts.api.queries.getPostBySlug) directly');
        return { post: null };
      },
      create: async (params: any) => {
        const result = await createPostMutation(params);
        return { id: result.id };
      },
      update: async (params: any) => {
        await updatePostMutation(params);
        return { success: true };
      },
      delete: async (params: any) => {
        await deletePostMutation(params);
        return { success: true };
      },
      deletePost: async (params: any) => {
        await deletePostMutation(params);
        return { success: true };
      },
      getRevisions: async (_params?: any) => {
        console.warn('⚠️ posts.getRevisions not yet implemented');
        return { revisions: [] };
      },
      restoreRevision: async (_params?: any) => {
        console.warn('⚠️ posts.restoreRevision not yet implemented');
        return { success: true };
      },
      bulkUpdate: async (_params?: any) => {
        console.warn('⚠️ posts.bulkUpdate not yet implemented');
        return { success: true };
      },
      exportJSON: async (_params?: any) => {
        console.warn('⚠️ posts.exportJSON not yet implemented');
        return { data: [] };
      },
      importJSON: async (_params?: any) => {
        console.warn('⚠️ posts.importJSON not yet implemented');
        return { imported: 0 };
      },
    },
    portfolio: {
      list: async (_params?: any) => {
        console.warn('⚠️ portfolio.list - use useQuery(api.features.cmsLite.portfolio.api.queries.listPortfolio) directly');
        return { items: [] };
      },
      listAll: async (_params?: any) => {
        console.warn('⚠️ portfolio.listAll - use useQuery(api.features.cmsLite.portfolio.api.queries.listAllPortfolio) directly');
        return { items: [] };
      },
      get: async (_params?: any) => {
        console.warn('⚠️ portfolio.get not yet implemented');
        return { item: null };
      },
      create: async (params: any) => {
        const result = await createPortfolioMutation(params);
        return { id: result.item.id };
      },
      update: async (params: any) => {
        await updatePortfolioMutation(params);
        return { success: true };
      },
      delete: async (params: any) => {
        await deletePortfolioMutation(params);
        return { success: true };
      },
      deletePortfolio: async (params: any) => {
        await deletePortfolioMutation(params);
        return { success: true };
      },
    },
    services: {
      list: async (_params?: any) => {
        console.warn('⚠️ services.list not yet implemented');
        return { services: [] };
      },
      listAll: async (_params?: any) => {
        console.warn('⚠️ services.listAll not yet implemented - use useQuery directly');
        return { services: [] };
      },
      get: async (_params?: any) => ({ service: null }),
      create: async (params: any) => {
        console.warn('⚠️ services.create not yet implemented');
        return { id: 1 };
      },
      update: async (params: any) => {
        console.warn('⚠️ services.update not yet implemented');
        return { success: true };
      },
      delete: async (params: any) => {
        console.warn('⚠️ services.delete not yet implemented');
        return { success: true };
      },
      deleteService: async (params: any) => {
        console.warn('⚠️ services.deleteService not yet implemented');
        return { success: true };
      },
      exportJSON: async (_params?: any) => {
        console.warn('⚠️ services.exportJSON not yet implemented');
        return { data: [] };
      },
      importJSON: async (_params?: any) => {
        console.warn('⚠️ services.importJSON not yet implemented');
        return { imported: 0 };
      },
    },
    settings: {
      get: async (_params?: any) => ({ settings: {} }),
      update: async (_params?: any) => ({ success: true }),
      exportAll: async (_params?: any) => {
        console.warn('⚠️ settings.exportAll not yet implemented');
        return { data: {} };
      },
      importAll: async (_params?: any) => {
        console.warn('⚠️ settings.importAll not yet implemented');
        return { success: true, imported: 0 };
      },
    },
    navigation: {
      list: async (_params?: any) => {
        console.warn('⚠️ navigation.list not yet implemented');
        return { items: [] };
      },
      listAll: async (_params?: any) => {
        console.warn('⚠️ navigation.listAll not yet implemented - use useQuery directly');
        return { items: [] };
      },
      create: async (params: any) => {
        console.warn('⚠️ navigation.create not yet implemented');
        return { id: 1 };
      },
      update: async (params: any) => {
        console.warn('⚠️ navigation.update not yet implemented');
        return { success: true };
      },
      delete: async (params: any) => {
        console.warn('⚠️ navigation.delete not yet implemented');
        return { success: true };
      },
      deleteNavigation: async (params: any) => {
        console.warn('⚠️ navigation.deleteNavigation not yet implemented');
        return { success: true };
      },
    },
    features: {
      list: async (_params?: any) => {
        console.warn('⚠️ features.list not yet implemented');
        return { features: [] };
      },
      listAll: async (_params?: any) => {
        console.warn('⚠️ features.listAll not yet implemented - use useQuery directly');
        return { features: [] };
      },
      create: async (params: any) => {
        console.warn('⚠️ features.create not yet implemented');
        return { id: 1 };
      },
      update: async (params: any) => {
        console.warn('⚠️ features.update not yet implemented');
        return { success: true };
      },
      delete: async (params: any) => {
        console.warn('⚠️ features.delete not yet implemented');
        return { success: true };
      },
      deleteFeature: async (params: any) => {
        console.warn('⚠️ features.deleteFeature not yet implemented');
        return { success: true };
      },
    },
    quicklinks: {
      list: async (_params?: any) => {
        console.warn('⚠️ quicklinks.list not yet implemented');
        return { quicklinks: [] };
      },
      listAll: async (_params?: any) => {
        console.warn('⚠️ quicklinks.listAll not yet implemented - use useQuery directly');
        return { quicklinks: [] };
      },
      create: async (params: any) => {
        // Ensure required fields
        const quicklinkData = {
          title: params.title || '',
          url: params.url || '',
          icon: params.icon || null,
          displayOrder: params.displayOrder || 0,
          active: params.active !== undefined ? params.active : true,
        };
        const result = await createQuicklinkMutation(quicklinkData);
        return { id: result.id };
      },
      update: async (params: any) => {
        const result = await updateQuicklinkMutation(params);
        return { success: result.success };
      },
      delete: async (params: any) => {
        const result = await deleteQuicklinkMutation(params);
        return { success: result.success };
      },
    },
    users: {
      list: async (_params?: any) => ({ users: [] }),
      create: async (_params?: any) => ({ id: 1 }),
      update: async (_params?: any) => ({ success: true }),
      delete: async (_params?: any) => ({ success: true }),
      deleteUser: async (_params?: any) => ({ success: true }),
      exportJSON: async (_params?: any) => ({ users: [] }),
      importJSON: async (_params?: any) => ({ imported: 0, updated: 0, failed: 0, errors: [] }),
    },
    ai: {
      getStats: async (_params?: any) => ({ 
        totalRequests: 0, 
        rateLimitedRequests: 0,
        averageMessageLength: 0,
        averageResponseLength: 0,
        requestsByLocale: {},
        recentActivity: [],
      }),
      getErrors: async (_params?: any) => ({ errors: [] }),
      getSettings: async (_params?: any) => ({ 
        enabled: true, 
        defaultLocale: 'en',
        rateLimitPerMinute: 10,
        rateLimitPerHour: 100,
        systemPromptId: '',
        systemPromptEn: '',
        systemPromptAr: '',
        personality: 'professional',
        customPersonality: '',
      }),
      updateSettings: async (_params?: any) => ({ success: true }),
      listKBDocuments: async (_params?: any) => ({ documents: [] }),
      createKBDocument: async (_params?: any) => ({ id: 1 }),
      updateKBDocument: async (_params?: any) => ({ success: true }),
      deleteKBDocument: async (_params?: any) => ({ success: true }),
      chat: async (_params?: any) => ({ reply: 'Hello! This is a mock response. Implement actual AI chat with Convex.', references: [] }),
      recommend: async (_params?: any) => ({ recommendations: [] }),
    },
    comments: {
      list: async (_params?: any) => ({ comments: [] }),
      create: async (_params?: any) => ({ id: 1 }),
      update: async (_params?: any) => ({ success: true }),
      delete: async (_params?: any) => ({ success: true }),
    },
    landing: {
      getContent: async (_params?: any) => ({ content: { data: {} } }),
      updateContent: async (_params?: any) => ({ success: true }),
    },
    websiteSettings: {
      get: async (_params?: any) => {
        console.warn('⚠️ websiteSettings.get - use useQuery(api.features.cmsLite.website_settings.api.queries.getWebsiteSettings) directly');
        return null;
      },
      update: async (params: any) => {
        const result = await updateWebsiteSettingsMutation(params);
        return { id: result };
      },
      verifyDomain: async (params: { workspaceId: Id<"workspaces">; domain: string }) => {
        const result = await verifyDomainMutation(params);
        return result;
      },
    },
  };

  return backend;
}

// Export the api and hooks for direct usage
export { api, useQuery, useMutation };

// Updated: 2025-11-01 (Convex Integration)
