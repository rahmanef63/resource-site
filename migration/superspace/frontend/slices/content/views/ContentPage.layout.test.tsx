// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const featureLayoutSpy = vi.fn((props: any) => (
  <div data-testid="layout" data-storage-key={props.storageKey} data-preset={props.preset ?? "feature"}>
    <div>{props.sidebarContent}</div>
    <div>{props.mainContent}</div>
    <div>{props.inspector}</div>
  </div>
));

vi.mock("@/frontend/shared/ui/layout/container/three-column", () => ({
  FeatureThreeColumnLayout: (props: any) => featureLayoutSpy(props),
}));

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("../hooks/useContentLibrary", () => ({
  useContentLibrary: () => ({
    items: [],
    selectedContent: null,
    stats: { total: 0, byType: {}, byStatus: {}, totalSize: 0, aiGenerated: 0 },
    folders: [],
    availableTags: [],
    isLoading: false,
    filters: { sortBy: "createdAt", sortOrder: "desc" },
    selectedId: null,
    selectedIds: new Set(),
    selectionMode: false,
    updateFilters: vi.fn(),
    clearFilters: vi.fn(),
    selectItem: vi.fn(),
    clearSelectedItem: vi.fn(),
    toggleSelection: vi.fn(),
    clearSelection: vi.fn(),
    selectMany: vi.fn(),
    setSelectionMode: vi.fn(),
    createContent: vi.fn(),
    deleteContent: vi.fn(),
    duplicateContent: vi.fn(),
    bulkDelete: vi.fn(),
    bulkUpdateSelected: vi.fn(),
    createAiJob: vi.fn(),
    generateUploadUrl: vi.fn(),
    uploadFile: vi.fn(),
    uploadUrl: vi.fn(),
    updateContent: vi.fn(),
    replaceContentFile: vi.fn(),
    createFolder: vi.fn(),
    renameFolder: vi.fn(),
    deleteFolder: vi.fn(),
  }),
}));

vi.mock("../components/ContentList", () => ({ ContentList: () => <div>Content List</div> }));
vi.mock("../components/ContentInspector", () => ({ ContentInspector: () => <div>Content Inspector</div> }));
vi.mock("../components/ContentAIChat", () => ({ ContentAIChat: () => <div>Content AI</div> }));
vi.mock("../components/FolderManager", () => ({ FolderManager: () => <div>Folders</div> }));
vi.mock("../components/ContentFilters", () => ({ ContentFiltersBar: () => <div>Filters</div> }));
vi.mock("@/frontend/shared/ui/components/upload", () => ({ UploadDialog: () => null }));
vi.mock("@/components/ui/shadcn-io/image-crop", () => ({
  ImageCrop: ({ children }: any) => <div>{children}</div>,
  ImageCropContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@/components/ui/shadcn-io/image-zoom", () => ({ ImageZoom: ({ children }: any) => <div>{children}</div> }));
vi.mock("next/image", () => ({ default: (props: any) => <img alt={props.alt} /> }));

import ContentPage from "./ContentPage";

describe("ContentPage layout contract", () => {
  beforeEach(() => {
    featureLayoutSpy.mockClear();
  });

  it("uses feature layout with content storage key", () => {
    render(<ContentPage workspaceId={"ws_1" as any} />);

    const props = featureLayoutSpy.mock.calls.at(-1)?.[0];
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(props.storageKey).toBe("content-layout");
    expect(props.preset ?? "feature").toBe("feature");
  });

  it("uses the shared stacked layout instead of custom mobile branches", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/content/views/ContentPage.tsx"), "utf8");
    expect(source).toContain('storageKey="content-layout"');
    expect(source).toContain('preset="feature"');
    expect(source).toContain("persistState={true}");
    expect(source).not.toContain("useIsMobile");
    expect(source).not.toContain("if (isMobile)");
  });
});
