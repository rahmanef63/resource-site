"use client";

import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

/**
 * This file provides a backend client for CMS Lite feature using Convex
 * 
 * MIGRATION NOTE:
 * This replaces the old ~backend/client pattern from React project.
 * Now uses Convex hooks (useQuery, useMutation) for data operations.
 * 
 * Usage in components:
 * - Import useConvex hook: import { useConvex } from "convex/react"
 * - Use Convex queries: const products = useQuery(api.features.cmsLite.products.queries.list, { workspaceId })
 * - Use Convex mutations: const createProduct = useMutation(api.features.cmsLite.products.mutations.create)
 */

// This file is kept for backward compatibility but should be migrated away from
// Instead, use Convex hooks directly in components
console.warn("⚠️ backend.ts is deprecated - Use Convex hooks (useQuery, useMutation) directly in components");

export { useConvex, useMutation, useQuery, api };
