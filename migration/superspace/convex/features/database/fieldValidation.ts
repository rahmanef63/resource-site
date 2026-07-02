/**
 * Field Validation API
 * Feature #109 - Custom validation rules for fields
 */

import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";

// =============================================================================
// Queries
// =============================================================================

/**
 * Get all validations for a field
 */
export const getFieldValidations = query({
  args: {
    fieldId: v.id("dbFields"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dbFieldValidations")
      .withIndex("by_field", (q) => q.eq("fieldId", args.fieldId))
      .take(1000);
  },
});

/**
 * Get all validations for a table
 */
export const getTableValidations = query({
  args: {
    tableId: v.id("dbTables"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dbFieldValidations")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);
  },
});

/**
 * Get active validations for a table
 */
export const getActiveValidations = query({
  args: {
    tableId: v.id("dbTables"),
  },
  handler: async (ctx, args) => {
    const validations = await ctx.db
      .query("dbFieldValidations")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    return validations.filter((v) => v.isActive);
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a validation rule
 */
export const createValidation = mutation({
  args: {
    fieldId: v.id("dbFields"),
    tableId: v.id("dbTables"),
    validationType: v.union(
      v.literal("regex"),
      v.literal("range"),
      v.literal("custom_script"),
      v.literal("dependency"),
      v.literal("unique_composite"),
      v.literal("cross_field")
    ),
    config: v.object({
      pattern: v.optional(v.string()),
      min: v.optional(v.number()),
      max: v.optional(v.number()),
      script: v.optional(v.string()),
      dependsOnFields: v.optional(v.array(v.id("dbFields"))),
      compositeFields: v.optional(v.array(v.id("dbFields"))),
      errorMessage: v.optional(v.string()),
    }),
    runOnCreate: v.optional(v.boolean()),
    runOnUpdate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify field exists
    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    const validationId = await ctx.db.insert("dbFieldValidations", {
      fieldId: args.fieldId,
      tableId: args.tableId,
      validationType: args.validationType,
      config: args.config,
      isActive: true,
      runOnCreate: args.runOnCreate ?? true,
      runOnUpdate: args.runOnUpdate ?? true,
      createdById: user._id,
      createdAt: Date.now(),
    });

    return validationId;
  },
});

/**
 * Update a validation rule
 */
export const updateValidation = mutation({
  args: {
    validationId: v.id("dbFieldValidations"),
    config: v.optional(
      v.object({
        pattern: v.optional(v.string()),
        min: v.optional(v.number()),
        max: v.optional(v.number()),
        script: v.optional(v.string()),
        dependsOnFields: v.optional(v.array(v.id("dbFields"))),
        compositeFields: v.optional(v.array(v.id("dbFields"))),
        errorMessage: v.optional(v.string()),
      })
    ),
    isActive: v.optional(v.boolean()),
    runOnCreate: v.optional(v.boolean()),
    runOnUpdate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { validationId, ...updates } = args;

    const validation = await ctx.db.get(validationId);
    if (!validation) {
      throw new Error("Validation not found");
    }

    await ctx.db.patch(validationId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return validationId;
  },
});

/**
 * Delete a validation rule
 */
export const deleteValidation = mutation({
  args: {
    validationId: v.id("dbFieldValidations"),
  },
  handler: async (ctx, args) => {
    const validation = await ctx.db.get(args.validationId);
    if (!validation) {
      throw new Error("Validation not found");
    }

    await ctx.db.delete(args.validationId);
    return true;
  },
});

/**
 * Toggle validation active state
 */
export const toggleValidation = mutation({
  args: {
    validationId: v.id("dbFieldValidations"),
  },
  handler: async (ctx, args) => {
    const validation = await ctx.db.get(args.validationId);
    if (!validation) {
      throw new Error("Validation not found");
    }

    await ctx.db.patch(args.validationId, {
      isActive: !validation.isActive,
      updatedAt: Date.now(),
    });

    return !validation.isActive;
  },
});

/**
 * Validate a value against field validations
 * This is a utility function that can be called from other mutations
 */
export const validateValue = query({
  args: {
    fieldId: v.id("dbFields"),
    value: v.any(),
    isCreate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const validations = await ctx.db
      .query("dbFieldValidations")
      .withIndex("by_field", (q) => q.eq("fieldId", args.fieldId))
      .take(1000);

    const activeValidations = validations.filter((v) => {
      if (!v.isActive) return false;
      if (args.isCreate && !v.runOnCreate) return false;
      if (!args.isCreate && !v.runOnUpdate) return false;
      return true;
    });

    const errors: Array<{ type: string; message: string }> = [];

    for (const validation of activeValidations) {
      switch (validation.validationType) {
        case "regex":
          if (validation.config.pattern && typeof args.value === "string") {
            const regex = new RegExp(validation.config.pattern);
            if (!regex.test(args.value)) {
              errors.push({
                type: "regex",
                message:
                  validation.config.errorMessage ||
                  `Value does not match pattern: ${validation.config.pattern}`,
              });
            }
          }
          break;

        case "range":
          if (typeof args.value === "number") {
            if (
              validation.config.min !== undefined &&
              args.value < validation.config.min
            ) {
              errors.push({
                type: "range",
                message:
                  validation.config.errorMessage ||
                  `Value must be at least ${validation.config.min}`,
              });
            }
            if (
              validation.config.max !== undefined &&
              args.value > validation.config.max
            ) {
              errors.push({
                type: "range",
                message:
                  validation.config.errorMessage ||
                  `Value must be at most ${validation.config.max}`,
              });
            }
          }
          break;

        // Note: custom_script, dependency, unique_composite, cross_field
        // would require more complex implementation with row context
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

/**
 * Validate an entire row against all field validations
 */
export const validateRow = query({
  args: {
    tableId: v.id("dbTables"),
    rowData: v.record(v.string(), v.any()),
    isCreate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get all fields for the table
    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    // Get all validations for the table
    const validations = await ctx.db
      .query("dbFieldValidations")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    const fieldErrors: Record<string, Array<{ type: string; message: string }>> =
      {};

    for (const field of fields) {
      const value = args.rowData[field.name];
      const fieldValidations = validations.filter(
        (v) => v.fieldId === field._id && v.isActive
      );

      const errors: Array<{ type: string; message: string }> = [];

      for (const validation of fieldValidations) {
        // Skip based on create/update context
        if (args.isCreate && !validation.runOnCreate) continue;
        if (!args.isCreate && !validation.runOnUpdate) continue;

        switch (validation.validationType) {
          case "regex":
            if (validation.config.pattern && typeof value === "string") {
              const regex = new RegExp(validation.config.pattern);
              if (!regex.test(value)) {
                errors.push({
                  type: "regex",
                  message:
                    validation.config.errorMessage ||
                    `Value does not match required pattern`,
                });
              }
            }
            break;

          case "range":
            if (typeof value === "number") {
              if (
                validation.config.min !== undefined &&
                value < validation.config.min
              ) {
                errors.push({
                  type: "range",
                  message:
                    validation.config.errorMessage ||
                    `Value must be at least ${validation.config.min}`,
                });
              }
              if (
                validation.config.max !== undefined &&
                value > validation.config.max
              ) {
                errors.push({
                  type: "range",
                  message:
                    validation.config.errorMessage ||
                    `Value must be at most ${validation.config.max}`,
                });
              }
            }
            break;

          case "cross_field":
            // Cross-field validation example: compare with another field
            if (
              validation.config.dependsOnFields &&
              validation.config.dependsOnFields.length > 0
            ) {
              // Get the dependent field
              const depField = fields.find(
                (f) => f._id === validation.config.dependsOnFields![0]
              );
              if (depField) {
                const depValue = args.rowData[depField.name];
                // Simple comparison - could be extended
                if (value === depValue) {
                  errors.push({
                    type: "cross_field",
                    message:
                      validation.config.errorMessage ||
                      `Value conflicts with ${depField.name}`,
                  });
                }
              }
            }
            break;
        }
      }

      if (errors.length > 0) {
        fieldErrors[field.name] = errors;
      }
    }

    return {
      isValid: Object.keys(fieldErrors).length === 0,
      errors: fieldErrors,
    };
  },
});

/**
 * Create a regex validation shortcut
 */
export const createRegexValidation = mutation({
  args: {
    fieldId: v.id("dbFields"),
    tableId: v.id("dbTables"),
    pattern: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate the regex pattern
    try {
      new RegExp(args.pattern);
    } catch (e) {
      throw new Error("Invalid regex pattern");
    }

    return await ctx.db.insert("dbFieldValidations", {
      fieldId: args.fieldId,
      tableId: args.tableId,
      validationType: "regex",
      config: {
        pattern: args.pattern,
        errorMessage: args.errorMessage,
      },
      isActive: true,
      runOnCreate: true,
      runOnUpdate: true,
      createdById: user._id,
      createdAt: Date.now(),
    });
  },
});

/**
 * Create a range validation shortcut
 */
export const createRangeValidation = mutation({
  args: {
    fieldId: v.id("dbFields"),
    tableId: v.id("dbTables"),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (args.min === undefined && args.max === undefined) {
      throw new Error("At least one of min or max must be specified");
    }

    return await ctx.db.insert("dbFieldValidations", {
      fieldId: args.fieldId,
      tableId: args.tableId,
      validationType: "range",
      config: {
        min: args.min,
        max: args.max,
        errorMessage: args.errorMessage,
      },
      isActive: true,
      runOnCreate: true,
      runOnUpdate: true,
      createdById: user._id,
      createdAt: Date.now(),
    });
  },
});
