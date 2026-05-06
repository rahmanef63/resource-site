import { describe, expect, it } from "vitest";

import {
  compileStudioDocumentToFeaturePackage,
  StudioFeaturePackageCompileError,
} from "@/frontend/slices/studio/publishing";

describe("compileStudioDocumentToFeaturePackage", () => {
  it("compiles a UI-only Studio document into a feature package", () => {
    const featurePackage = compileStudioDocumentToFeaturePackage({
      version: "0.5",
      root: ["home-page"],
      nodes: {
        "home-page": {
          type: "section",
          props: {
            name: "Home",
            path: "/dashboard/home-feature",
          },
          children: ["headline"],
        },
        headline: {
          type: "text",
          props: {
            content: "Hello world",
          },
          children: [],
        },
      },
      metadata: {
        id: "doc-ui-1",
        name: "Home Feature",
        version: "1.2.3",
      },
    });

    expect(featurePackage.identity.packageId).toBe("studio.home-feature");
    expect(featurePackage.identity.generationMode).toBe("full-json");
    expect(featurePackage.ui.pages[0]?.route).toBe("/dashboard/home-feature");
    expect(featurePackage.install.menuItems[0]?.slug).toBe("home-feature");
  });

  it("compiles a unified document with a publish-certified flow", () => {
    const featurePackage = compileStudioDocumentToFeaturePackage({
      studioVersion: "1.0",
      kind: "unified",
      metadata: {
        id: "doc-unified-1",
        name: "Lead Router",
        version: "2.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ui: {
        version: "0.5",
        root: ["lead-router-page"],
        nodes: {
          "lead-router-page": {
            type: "section",
            props: {
              name: "Lead Router",
              path: "/dashboard/lead-router",
            },
            children: [],
          },
        },
      },
      flow: {
        version: "1.0",
        nodes: [
          {
            id: "n1",
            name: "Manual Trigger",
            type: "trigger.manual",
            position: { x: 0, y: 0 },
            parameters: {},
          },
          {
            id: "n2",
            name: "Set Variable",
            type: "data.set",
            position: { x: 100, y: 0 },
            parameters: {
              key: "channel",
              value: "sales",
            },
          },
        ],
        edges: [
          {
            id: "e1",
            source: "n1",
            target: "n2",
          },
        ],
      },
    });

    expect(featurePackage.actions.workflows).toHaveLength(1);
    expect(featurePackage.actions.publishCertifiedNodes).toContain("trigger.manual");
    expect(featurePackage.permissions.required.map((item) => item.key)).toContain("lead-router.manage");
  });

  it("rejects unsupported widgets during publish compile", () => {
    expect(() =>
      compileStudioDocumentToFeaturePackage({
        version: "0.5",
        root: ["unsafe-page"],
        nodes: {
          "unsafe-page": {
            type: "kanbanBlock",
            props: {
              path: "/dashboard/unsafe-feature",
            },
            children: [],
          },
        },
      }),
    ).toThrow(StudioFeaturePackageCompileError);
  });

  it("rejects unsupported workflow nodes during publish compile", () => {
    expect(() =>
      compileStudioDocumentToFeaturePackage({
        studioVersion: "1.0",
        kind: "workflow",
        metadata: {
          id: "doc-flow-1",
          name: "Unsafe Flow",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        flow: {
          version: "1.0",
          nodes: [
            {
              id: "n1",
              name: "Webhook Trigger",
              type: "trigger.webhook",
              position: { x: 0, y: 0 },
              parameters: {},
            },
          ],
          edges: [],
        },
      }),
    ).toThrow(StudioFeaturePackageCompileError);
  });

  it("normalizes legacy UI schema versions before compiling", () => {
    const featurePackage = compileStudioDocumentToFeaturePackage({
      version: "0.4",
      root: ["legacy-page"],
      nodes: {
        "legacy-page": {
          type: "section",
          props: {
            name: "Legacy Page",
            path: "/dashboard/legacy-page",
          },
          children: [],
        },
      },
      metadata: {
        name: "Legacy Page",
      },
    });

    expect(featurePackage.identity.createdFrom?.uiSchemaVersion).toBe("0.5");
    expect(featurePackage.identity.createdFrom?.sourceUiSchemaVersion).toBe("0.4");
    expect(featurePackage.identity.slug).toBe("legacy-page");
  });

  it("rejects engine-owned features for Studio generation", () => {
    expect(() =>
      compileStudioDocumentToFeaturePackage(
        {
          version: "0.5",
          root: ["ai-page"],
          nodes: {
            "ai-page": {
              type: "section",
              props: {
                name: "AI Page",
                path: "/dashboard/ai-generated",
              },
              children: [],
            },
          },
          metadata: {
            name: "AI Page",
          },
        },
        {
          targetFeatureId: "ai",
        },
      ),
    ).toThrow(/engine-owned/i);
  });

  it("downgrades hybrid-json features to wrapper/install packages", () => {
    const featurePackage = compileStudioDocumentToFeaturePackage(
      {
        studioVersion: "1.0",
        kind: "unified",
        metadata: {
          id: "doc-documents-1",
          name: "Documents Wrapper",
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ui: {
          version: "0.5",
          root: ["documents-page"],
          nodes: {
            "documents-page": {
              type: "section",
              props: {
                name: "Documents Wrapper",
                path: "/dashboard/documents-wrapper",
              },
              children: [],
            },
          },
        },
        flow: {
          version: "1.0",
          nodes: [
            {
              id: "n1",
              name: "Manual Trigger",
              type: "trigger.manual",
              position: { x: 0, y: 0 },
              parameters: {},
            },
          ],
          edges: [],
        },
      },
      {
        targetFeatureId: "documents",
      },
    );

    expect(featurePackage.identity.generationMode).toBe("hybrid-json");
    expect(featurePackage.identity.sharedEngineId).toBe("documents");
    expect(featurePackage.actions.workflows).toEqual([]);
    expect(featurePackage.install.enabledFeatures).toEqual(["documents"]);
    expect(featurePackage.agent.definitionPath).toBe("convex/features/docs/agent.ts");
  });
});
