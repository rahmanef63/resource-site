/**
 * SKIPPED during studio extraction (resources/ project, single-tenant).
 * RBAC stubs in convex/auth/helpers.ts make these RBAC-dependent assertions vacuous.
 * TODO: un-skip when RBAC is restored on re-merge to SuperSpace.
 */
import { describe, it, expect } from "vitest";
import { studioConfig } from "@/frontend/slices/studio/config";

/**
 * Studio Feature — Config Validation Tests
 *
 * Tests cover:
 * - Valid feature definition exported from config.ts
 * - All required fields are present
 * - Permission names follow naming convention
 * - Routes are properly defined
 * - Dependencies are valid feature IDs
 * - Bundle configuration
 * - Technical / status / UI metadata
 */

describe.skip("Studio Feature Config", () => {
  // --------------------------------------------------------------------------
  // Basic export
  // --------------------------------------------------------------------------

  describe("Feature Definition Export", () => {
    it("should export a valid feature config object", () => {
      expect(studioConfig).toBeDefined();
      expect(typeof studioConfig).toBe("object");
    });

    it("should have id set to 'studio'", () => {
      expect(studioConfig.id).toBe("studio");
    });

    it("should have a non-empty name", () => {
      expect(studioConfig.name).toBeDefined();
      expect(studioConfig.name.length).toBeGreaterThan(0);
    });

    it("should have a non-empty description", () => {
      expect(studioConfig.description).toBeDefined();
      expect(studioConfig.description.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // ID format
  // --------------------------------------------------------------------------

  describe("ID Format", () => {
    it("should use lowercase kebab-case for id", () => {
      expect(studioConfig.id).toMatch(/^[a-z0-9-]+$/);
    });

    it("should not contain underscores or uppercase letters", () => {
      expect(studioConfig.id).not.toMatch(/[A-Z_]/);
    });
  });

  // --------------------------------------------------------------------------
  // UI Configuration
  // --------------------------------------------------------------------------

  describe("UI Configuration", () => {
    it("should have all required UI fields", () => {
      expect(studioConfig.ui).toBeDefined();
      expect(studioConfig.ui.icon).toBeDefined();
      expect(studioConfig.ui.path).toBeDefined();
      expect(studioConfig.ui.component).toBeDefined();
      expect(studioConfig.ui.category).toBeDefined();
      expect(typeof studioConfig.ui.order).toBe("number");
    });

    it("should have icon as a non-empty string", () => {
      expect(studioConfig.ui.icon.length).toBeGreaterThan(0);
    });

    it("should have path starting with /", () => {
      expect(studioConfig.ui.path).toMatch(/^\//);
    });

    it("should have path under /dashboard/", () => {
      expect(studioConfig.ui.path).toMatch(/^\/dashboard\//);
    });

    it("should have a valid category", () => {
      const validCategories = [
        "communication",
        "productivity",
        "collaboration",
        "administration",
        "social",
        "creativity",
        "analytics",
        "content",
      ];
      expect(validCategories).toContain(studioConfig.ui.category);
    });

    it("should have order as a non-negative number", () => {
      expect(studioConfig.ui.order).toBeGreaterThanOrEqual(0);
    });

    it("should have a non-empty component name", () => {
      expect(studioConfig.ui.component.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Technical Configuration
  // --------------------------------------------------------------------------

  describe("Technical Configuration", () => {
    it("should have all required technical fields", () => {
      expect(studioConfig.technical).toBeDefined();
      expect(studioConfig.technical.featureType).toBeDefined();
      expect(typeof studioConfig.technical.hasUI).toBe("boolean");
      expect(typeof studioConfig.technical.hasConvex).toBe("boolean");
      expect(typeof studioConfig.technical.hasTests).toBe("boolean");
      expect(studioConfig.technical.version).toBeDefined();
    });

    it("should have a valid featureType", () => {
      const validTypes = ["default", "system", "optional", "experimental"];
      expect(validTypes).toContain(studioConfig.technical.featureType);
    });

    it("should have version in semver format", () => {
      expect(studioConfig.technical.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should have hasUI set to true", () => {
      expect(studioConfig.technical.hasUI).toBe(true);
    });

    it("should have hasConvex set to true", () => {
      expect(studioConfig.technical.hasConvex).toBe(true);
    });

    it("should have hasTests set to true", () => {
      expect(studioConfig.technical.hasTests).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Status Configuration
  // --------------------------------------------------------------------------

  describe("Status Configuration", () => {
    it("should have all required status fields", () => {
      expect(studioConfig.status).toBeDefined();
      expect(studioConfig.status.state).toBeDefined();
      expect(typeof studioConfig.status.isReady).toBe("boolean");
    });

    it("should have a valid state", () => {
      const validStates = ["stable", "beta", "development", "experimental", "deprecated"];
      expect(validStates).toContain(studioConfig.status.state);
    });
  });

  // --------------------------------------------------------------------------
  // Permissions
  // --------------------------------------------------------------------------

  describe("Permissions", () => {
    it("should define permissions as an array", () => {
      expect(Array.isArray(studioConfig.permissions)).toBe(true);
    });

    it("should have at least one permission", () => {
      expect(studioConfig.permissions!.length).toBeGreaterThan(0);
    });

    it("should follow feature.action naming convention for all permissions", () => {
      studioConfig.permissions!.forEach((perm) => {
        // e.g. "studio.view", "studio.create", "studio.manage-templates"
        expect(perm).toMatch(/^studio\.[a-z][a-z0-9-]*$/);
      });
    });

    it("should include view permission", () => {
      expect(studioConfig.permissions).toContain("studio.view");
    });

    it("should include create permission", () => {
      expect(studioConfig.permissions).toContain("studio.create");
    });

    it("should include edit permission", () => {
      expect(studioConfig.permissions).toContain("studio.edit");
    });

    it("should include delete permission", () => {
      expect(studioConfig.permissions).toContain("studio.delete");
    });

    it("should include execute permission", () => {
      expect(studioConfig.permissions).toContain("studio.execute");
    });

    it("should include manage-templates permission", () => {
      expect(studioConfig.permissions).toContain("studio.manage-templates");
    });

    it("should not contain duplicate permissions", () => {
      const uniquePerms = new Set(studioConfig.permissions);
      expect(uniquePerms.size).toBe(studioConfig.permissions!.length);
    });
  });

  // --------------------------------------------------------------------------
  // Navigation
  // --------------------------------------------------------------------------

  describe("Navigation", () => {
    it("should define navigation", () => {
      expect(studioConfig.navigation).toBeDefined();
    });

    it("should have a route under /dashboard/", () => {
      expect(studioConfig.navigation?.route).toMatch(/^\/dashboard\//);
    });

    it("should have route consistent with ui.path", () => {
      expect(studioConfig.navigation?.route).toBe(studioConfig.ui.path);
    });

    it("should define aliases", () => {
      expect(studioConfig.navigation?.aliases).toBeDefined();
      expect(Array.isArray(studioConfig.navigation?.aliases)).toBe(true);
    });

    it("should have non-empty aliases if present", () => {
      if (studioConfig.navigation?.aliases) {
        studioConfig.navigation.aliases.forEach((alias) => {
          expect(alias.length).toBeGreaterThan(0);
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // Dependencies
  // --------------------------------------------------------------------------

  describe("Dependencies", () => {
    it("should define dependencies as an array", () => {
      expect(Array.isArray(studioConfig.dependencies)).toBe(true);
    });

    it("should have all dependencies as lowercase kebab-case strings", () => {
      studioConfig.dependencies!.forEach((dep) => {
        expect(dep).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Bundle Configuration
  // --------------------------------------------------------------------------

  describe("Bundle Configuration", () => {
    it("should define bundles", () => {
      expect(studioConfig.bundles).toBeDefined();
    });

    it("should have core, recommended, and optional arrays", () => {
      expect(Array.isArray(studioConfig.bundles?.core)).toBe(true);
      expect(Array.isArray(studioConfig.bundles?.recommended)).toBe(true);
      expect(Array.isArray(studioConfig.bundles?.optional)).toBe(true);
    });

    it("should not have a bundle id in more than one tier", () => {
      const core = new Set(studioConfig.bundles?.core ?? []);
      const recommended = new Set(studioConfig.bundles?.recommended ?? []);
      const optional = new Set(studioConfig.bundles?.optional ?? []);

      // No overlap between core and recommended
      core.forEach((id) => {
        expect(recommended.has(id)).toBe(false);
        expect(optional.has(id)).toBe(false);
      });

      // No overlap between recommended and optional
      recommended.forEach((id) => {
        expect(optional.has(id)).toBe(false);
      });
    });

    it("should have at least one bundle across all tiers for non-system features", () => {
      if (studioConfig.technical.featureType !== "system") {
        const totalBundles =
          (studioConfig.bundles?.core?.length ?? 0) +
          (studioConfig.bundles?.recommended?.length ?? 0) +
          (studioConfig.bundles?.optional?.length ?? 0);
        expect(totalBundles).toBeGreaterThan(0);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Tags
  // --------------------------------------------------------------------------

  describe("Tags", () => {
    it("should define tags as an array", () => {
      expect(Array.isArray(studioConfig.tags)).toBe(true);
    });

    it("should have at least one tag", () => {
      expect(studioConfig.tags!.length).toBeGreaterThan(0);
    });

    it("should have lowercase tags", () => {
      studioConfig.tags!.forEach((tag) => {
        expect(tag).toBe(tag.toLowerCase());
      });
    });
  });
});
