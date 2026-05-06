/**
 * Variant Registry System
 *
 * A flexible, extensible system for registering and rendering different item variants
 * in secondary sidebars without hardcoding logic.
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

import { z } from "zod";
import type { ReactNode } from "react";

/** Branded ID for type safety */
export type VariantId = string & { readonly __brand: "VariantId" };

/** Helper to create type-safe variant IDs */
export const asVariantId = (s: string): VariantId => s as VariantId;

/**
 * Base item properties shared across all variants
 */
export type ItemBase = {
  /** Unique identifier */
  id: string;
  /** Display label */
  label?: string;
  /** Icon component or icon name */
  icon?: React.ElementType | string;
  /** Avatar URL for user/chat items */
  avatarUrl?: string;
  /** Link href if item is clickable */
  href?: string;
  /** Whether item is currently active/selected */
  active?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Generic metadata object */
  meta?: Record<string, unknown>;
};

/**
 * Utility functions available to all renderers
 */
export type RenderUtils = {
  /** i18n translation function */
  t: (key: string, params?: any) => string;
  /** Format ISO date string to human-readable time */
  formatTime: (iso: string) => string;
  /** Format number as currency */
  formatCurrency: (amount: number, currency?: string) => string;
};

/**
 * Context passed to variant renderer
 */
export type RenderCtx<Params = any> = {
  /** The item being rendered with its params */
  item: ItemBase & { variantId: VariantId; params: Params };
  /** Optional UI slots for customization */
  slots?: {
    leading?: ReactNode;
    trailing?: ReactNode;
    badge?: ReactNode;
  };
  /** Generic action handler */
  onAction?: (id: string, action: string, extra?: any) => void;
  /** Utility functions */
  utils: RenderUtils;
};

/**
 * Variant definition with type-safe params
 */
export type VariantDef<Params = any> = {
  /** Unique variant identifier */
  id: VariantId;
  /** Human-readable title for documentation */
  title?: string;
  /** Description of what this variant is for */
  description?: string;
  /** Zod schema for validating params */
  paramsSchema: z.ZodType<Params>;
  /** Optional schema for validating meta */
  metaSchema?: z.ZodType<any>;
  /** Render function that returns React element */
  render: (ctx: RenderCtx<Params>) => ReactNode;
};

/**
 * Registry for managing variants
 */
class VariantRegistry {
  private map = new Map<VariantId, VariantDef<any>>();

  /**
   * Register a new variant definition
   */
  register<T>(def: VariantDef<T>): void {
    if (this.map.has(def.id)) {
      console.warn(`[VariantRegistry] Overriding existing variant: ${def.id}`);
    }
    this.map.set(def.id, def);
  }

  /**
   * Get variant definition by ID
   */
  get(id: VariantId): VariantDef<any> | undefined {
    return this.map.get(id);
  }

  /**
   * Check if variant exists
   */
  has(id: VariantId): boolean {
    return this.map.has(id);
  }

  /**
   * Get all registered variants
   */
  list(): VariantDef<any>[] {
    return [...this.map.values()];
  }

  /**
   * Unregister a variant
   */
  unregister(id: VariantId): boolean {
    return this.map.delete(id);
  }

  /**
   * Clear all variants
   */
  clear(): void {
    this.map.clear();
  }
}

/** Global variant registry instance */
export const itemVariantRegistry = new VariantRegistry();

/**
 * Helper function to create a variant with type inference
 */
export function createVariant<T>(opts: {
  id: string;
  title?: string;
  description?: string;
  paramsSchema: z.ZodType<T>;
  metaSchema?: z.ZodType<any>;
  render: (ctx: RenderCtx<T>) => ReactNode;
}): VariantDef<T> {
  return {
    id: asVariantId(opts.id),
    title: opts.title,
    description: opts.description,
    paramsSchema: opts.paramsSchema,
    metaSchema: opts.metaSchema,
    render: opts.render,
  };
}

/**
 * Item type used by SecondaryList
 */
export type SecondaryItem = ItemBase & {
  /** Variant ID determining how to render */
  variantId: VariantId;
  /** Variant-specific params (validated by variant's schema) */
  params?: unknown;
};

/**
 * Helper object for well-known variant IDs with type safety
 */
export const itemVariant = {
  /** Chat conversation item */
  chat: asVariantId("chat"),
  /** Voice/video call item */
  call: asVariantId("call"),
  /** Document/file item */
  doc: asVariantId("doc"),
  /** Menu/tree navigation item */
  menu: asVariantId("menu"),
  /** Status/story item */
  status: asVariantId("status"),
  /** Generic list item */
  list: asVariantId("list"),
  /** Create custom variant ID */
  custom: (id: string) => asVariantId(id),
} as const;
