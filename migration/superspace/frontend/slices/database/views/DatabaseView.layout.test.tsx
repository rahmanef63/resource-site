// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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

vi.mock("@/frontend/shared/ui/layout/header", () => ({
  StandardFeatureHeader: () => <div>Header</div>,
}));

vi.mock("../hooks/useDatabase", () => ({
  useDatabaseSidebar: () => ({ tables: [], isLoading: false }),
  useDatabaseRecord: () => ({
    record: null,
    viewModel: { features: [] },
    mapping: {},
    isLoading: false,
  }),
}));

vi.mock("../hooks", () => ({
  useDatabaseViewState: () => ({
    activeView: "table",
    setActiveView: vi.fn(),
    defaultViewType: "table",
  }),
  useDatabasePageHandlers: () => ({
    handleAddProperty: vi.fn(),
    handleRenameField: vi.fn(),
    handleToggleFieldRequired: vi.fn(),
    handleDeleteField: vi.fn(),
    handleUpdateFieldOptions: vi.fn(),
    handleToggleFieldVisibility: vi.fn(),
    handleReorderFields: vi.fn(),
    handleColumnSizingChange: vi.fn(),
    handleStatusChange: vi.fn(),
    handleMoveDates: vi.fn(),
    handleUpdateCell: vi.fn(),
  }),
}));

vi.mock("../components", () => ({
  DatabaseViewRenderer: () => <div>Database Center</div>,
  DatabaseToolbar: () => <div>Toolbar</div>,
}));

vi.mock("./DatabaseTree", () => ({ DatabaseTree: () => <div>Database Left</div> }));
vi.mock("./DatabaseRightPanel", () => ({ DatabaseRightPanel: () => <div>Database Right</div> }));
vi.mock("../dialog", () => ({ CreateDatabaseDialog: () => null }));
vi.mock("../lib/field-converter", () => ({ convertFieldsToProperties: () => [] }));
vi.mock("../utils", () => ({ findActiveDbView: () => null }));
vi.mock("@/frontend/shared/foundation/utils/data", () => ({ FeatureExportImport: () => <div>Export</div> }));
vi.mock("@/frontend/shared/ui/ai-assistant/FeatureAIAssistant", () => ({ FeatureAIAssistant: () => <div>AI</div> }));
vi.mock("@/frontend/shared/ui/components/loading/FeatureSkeletons", () => ({ FeatureSkeletons: () => <div>Loading</div> }));

import { DatabaseFeatureView } from "./DatabaseView";

describe("DatabaseView layout contract", () => {
  beforeEach(() => {
    featureLayoutSpy.mockClear();
  });

  it("uses the shared feature layout without custom mobile forks", () => {
    const { container } = render(<DatabaseFeatureView workspaceId={"ws_1" as any} />);

    const props = featureLayoutSpy.mock.calls.at(-1)?.[0];
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(props.storageKey).toBe("database-layout");
    expect(props.preset ?? "feature").toBe("feature");
    expect(container.firstChild).toHaveClass("h-full", "overflow-hidden");
  });
});
