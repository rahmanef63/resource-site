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

vi.mock("../hooks", () => ({
  useCrmCustomers: () => ({
    customers: [],
    stats: {},
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
  }),
}));

vi.mock("../components/CrmRightPanel", () => ({ CrmRightPanel: () => <div>CRM Right</div> }));
vi.mock("../components", () => ({ CreateCustomerDialog: () => null }));
vi.mock("../components/EditCustomerDialog", () => ({ EditCustomerDialog: () => null }));
vi.mock("../components/CustomerDetailView", () => ({ CustomerDetailView: () => <div>CRM Center</div> }));
vi.mock("@/frontend/shared/ui/layout/header", () => ({ FeatureHeader: () => <div>Header</div> }));

import CrmView from "./CrmView";

describe("CrmView layout contract", () => {
  beforeEach(() => {
    featureLayoutSpy.mockClear();
  });

  it("renders through FeatureThreeColumnLayout with storage", () => {
    render(<CrmView workspaceId={"ws_1" as any} />);

    const props = featureLayoutSpy.mock.calls.at(-1)?.[0];
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(props.storageKey).toBe("crm-layout");
    expect(props.preset ?? "feature").toBe("feature");
  });
});
