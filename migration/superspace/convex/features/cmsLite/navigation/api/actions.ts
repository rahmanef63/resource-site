import { v } from "convex/values";
import { action } from "../../_generated";
import { requirePermission } from "../../../../shared/auth";
import { PERMS } from "../../../../shared/schema";
import { logAuditEvent } from "../../../../shared/audit";
import type { ActionCtxWithDb } from "../../../../auth/helpers";

type NavigationTranslationArray = Array<{
  locale: string;
  title: string;
  description?: string;
}>;

type NavigationItemTranslationRecord = Record<
  string,
  { label: string; description?: string; ariaLabel?: string }
>;

type NavigationGroupTranslationRecord = Record<
  string,
  { title: string; description?: string }
>;

const navigationItemsTable = "navigationItems" as const;
const navigationGroupsTable = "navigationGroups" as const;

const mapItemTranslationsToArray = (
  translations: NavigationItemTranslationRecord,
): NavigationTranslationArray =>
  Object.entries(translations).map(([locale, value]) => ({
    locale,
    title: value.label,
    description: value.description,
  }));

const mapGroupTranslationsToArray = (
  translations: NavigationGroupTranslationRecord,
): NavigationTranslationArray =>
  Object.entries(translations).map(([locale, value]) => ({
    locale,
    title: value.title,
    description: value.description,
  }));

const mapItemTranslationsToRecord = (
  translations: NavigationTranslationArray,
): NavigationItemTranslationRecord =>
  translations.reduce<NavigationItemTranslationRecord>((acc, translation) => {
    acc[translation.locale] = {
      label: translation.title,
      description: translation.description,
    };
    return acc;
  }, {});

const mapGroupTranslationsToRecord = (
  translations: NavigationTranslationArray,
): NavigationGroupTranslationRecord =>
  translations.reduce<NavigationGroupTranslationRecord>((acc, translation) => {
    acc[translation.locale] = {
      title: translation.title,
      description: translation.description,
    };
    return acc;
  }, {});

/**
 * Export navigation configuration to JSON
 */
export const exportJson = action({
  args: {
    workspaceId: v.string(),
    includeGroups: v.optional(v.boolean()),
  },
  returns: v.object({
    version: v.string(),
    exportedAt: v.string(),
    items: v.array(
      v.object({
        key: v.string(),
        type: v.string(),
        translations: v.array(
          v.object({
            locale: v.string(),
            title: v.string(),
            description: v.optional(v.string()),
          }),
        ),
        path: v.string(),
        isExternal: v.boolean(),
        target: v.optional(v.string()),
        icon: v.optional(v.string()),
        data: v.optional(v.record(v.string(), v.any())),
        metadata: v.optional(v.record(v.string(), v.any())),
        children: v.optional(
          v.array(
            v.object({
              key: v.string(),
              type: v.string(),
              translations: v.array(
                v.object({
                  locale: v.string(),
                  title: v.string(),
                  description: v.optional(v.string()),
                }),
              ),
              path: v.string(),
              isExternal: v.boolean(),
              target: v.optional(v.string()),
              icon: v.optional(v.string()),
              data: v.optional(v.record(v.string(), v.any())),
              metadata: v.optional(v.record(v.string(), v.any())),
            }),
          ),
        ),
      }),
    ),
    groups: v.optional(
      v.array(
        v.object({
          name: v.string(),
          translations: v.array(
            v.object({
              locale: v.string(),
              title: v.string(),
              description: v.optional(v.string()),
            }),
          ),
          status: v.optional(v.string()),
          items: v.array(v.string()),
          settings: v.optional(v.record(v.string(), v.any())),
          metadata: v.optional(v.record(v.string(), v.any())),
        }),
      ),
    ),
  }),
  async handler(ctx, args) {
    const actionCtx = ctx as ActionCtxWithDb;
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.MANAGE_NAVIGATION,
    );

    const items = await actionCtx.db
      .query(navigationItemsTable)
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    type NavigationItemDoc = typeof items[number];
    const childrenByParent = new Map<string, NavigationItemDoc[]>();
    for (const item of items) {
      if (item.parentKey) {
        const existing = childrenByParent.get(item.parentKey) ?? [];
        existing.push(item);
        childrenByParent.set(item.parentKey, existing);
      }
    }

    const rootItems = items.filter((item) => !item.parentKey);

    const groups = args.includeGroups
      ? await actionCtx.db
          .query(navigationGroupsTable)
          .withIndex("by_workspace", (q) =>
            q.eq("workspaceId", args.workspaceId),
          )
          .take(1000)
      : undefined;

    await logAuditEvent(actionCtx, {
      workspaceId: args.workspaceId,
      action: "navigation.export",
      actor: membership.userId,
      actorUserId: membership.userDocId,
      target: {
        type: "navigation",
        id: args.workspaceId,
        workspaceId: args.workspaceId,
      },
      metadata: {
        itemCount: items.length,
        groupCount: groups?.length ?? 0,
      },
    });

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      items: rootItems.map((item) => ({
        key: item.key,
        type: item.type,
        translations: mapItemTranslationsToArray(item.translations),
        path: item.path ?? "",
        isExternal: item.isExternal,
        target: item.target,
        icon: item.icon,
        data: item.data ?? undefined,
        metadata: item.metadata ?? undefined,
        children: (childrenByParent.get(item.key) ?? []).map((child) => ({
          key: child.key,
          type: child.type,
          translations: mapItemTranslationsToArray(child.translations),
          path: child.path ?? "",
          isExternal: child.isExternal,
          target: child.target,
          icon: child.icon,
          data: child.data ?? undefined,
          metadata: child.metadata ?? undefined,
        })),
      })),
      groups: groups?.map((group) => ({
        name: group.name,
        translations: mapGroupTranslationsToArray(group.translations),
        status: group.status,
        items: group.items,
        settings: group.settings ?? undefined,
        metadata: group.metadata ?? undefined,
      })),
    };
  },
});

interface ImportedItem {
  key: string;
  type: string;
  translations: NavigationTranslationArray;
  path?: string;
  isExternal?: boolean;
  status?: string;
  displayOrder?: number;
  target?: string;
  icon?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  children?: ImportedItem[];
}

interface ImportedGroup {
  name: string;
  translations: NavigationTranslationArray;
  status?: "active" | "draft" | "inactive";
  displayOrder?: number;
  items: string[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Import navigation from JSON configuration
 */
export const importJson = action({
  args: {
    workspaceId: v.string(),
    content: v.string(), // Base64 encoded JSON
    options: v.optional(
      v.object({
        overwrite: v.optional(v.boolean()),
        importGroups: v.optional(v.boolean()),
      }),
    ),
  },
  returns: v.object({
    itemsCreated: v.number(),
    itemsUpdated: v.number(),
    itemsSkipped: v.number(),
    groupsCreated: v.number(),
    groupsUpdated: v.number(),
    groupsSkipped: v.number(),
  }),
  async handler(ctx, args) {
    const actionCtx = ctx as ActionCtxWithDb;
    const membership = await requirePermission(
      actionCtx,
      args.workspaceId,
      PERMS.MANAGE_NAVIGATION,
    );
    const options = args.options ?? {};

    try {
      const content = JSON.parse(
        Buffer.from(args.content, "base64").toString(),
      ) as { items: ImportedItem[]; groups?: ImportedGroup[] };

      if (!content.items || !Array.isArray(content.items)) {
        throw new Error("Invalid import format - missing items array");
      }

      const results = {
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsSkipped: 0,
        groupsCreated: 0,
        groupsUpdated: 0,
        groupsSkipped: 0,
      };

      for (const [index, item] of content.items.entries()) {
        try {
          const now = Date.now();
          await actionCtx.db.insert(navigationItemsTable, {
            workspaceId: args.workspaceId,
            key: item.key,
            type: item.type,
            status: item.status ?? "active",
            displayOrder: item.displayOrder ?? index,
            translations: mapItemTranslationsToRecord(item.translations),
            path: item.path ?? undefined,
            isExternal: item.isExternal ?? false,
            target: item.target,
            icon: item.icon,
            data: item.data,
            metadata: item.metadata,
            createdAt: now,
            updatedAt: now,
            createdBy: membership.userId,
            updatedBy: membership.userId,
          });

          results.itemsCreated++;

          if (item.children) {
            for (const [childIndex, child] of item.children.entries()) {
              const childNow = Date.now();
              try {
                await actionCtx.db.insert(navigationItemsTable, {
                  workspaceId: args.workspaceId,
                  key: child.key,
                  type: child.type,
                  status: child.status ?? "active",
                  displayOrder: child.displayOrder ?? childIndex,
                  parentKey: item.key,
                  translations: mapItemTranslationsToRecord(child.translations),
                  path: child.path ?? undefined,
                  isExternal: child.isExternal ?? false,
                  target: child.target,
                  icon: child.icon,
                  data: child.data,
                  metadata: child.metadata,
                  createdAt: childNow,
                  updatedAt: childNow,
                  createdBy: membership.userId,
                  updatedBy: membership.userId,
                });
                results.itemsCreated++;
              } catch (error) {
                results.itemsSkipped++;
                console.error("Failed to import child item:", child.key, error);
              }
            }
          }
        } catch (error) {
          results.itemsSkipped++;
          console.error("Failed to import parent item:", item.key, error);
        }
      }

      if (content.groups && options.importGroups) {
        for (const [groupIndex, group] of content.groups.entries()) {
          const now = Date.now();
          try {
            await actionCtx.db.insert(navigationGroupsTable, {
              workspaceId: args.workspaceId,
              name: group.name,
              status: group.status ?? "active",
              displayOrder: group.displayOrder ?? groupIndex,
              translations: mapGroupTranslationsToRecord(group.translations),
              items: group.items,
              settings: group.settings,
              metadata: group.metadata,
              createdAt: now,
              updatedAt: now,
            });
            results.groupsCreated++;
          } catch (error) {
            results.groupsSkipped++;
            console.error("Failed to import group:", group.name, error);
          }
        }
      }

      await logAuditEvent(actionCtx, {
        workspaceId: args.workspaceId,
        action: "navigation.import",
        actor: membership.userId,
      actorUserId: membership.userDocId,
        target: {
          type: "navigation",
          id: args.workspaceId,
          workspaceId: args.workspaceId,
        },
        changes: {
          ...results,
          importOptions: options,
        },
      });

      return results;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to import navigation: ${error.message}`);
      }
      throw new Error("Failed to import navigation: Unknown error");
    }
  },
});
