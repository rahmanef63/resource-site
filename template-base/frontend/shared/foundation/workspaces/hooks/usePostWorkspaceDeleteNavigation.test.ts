import { describe, expect, it } from "vitest"

import { resolvePostWorkspaceDeleteRoute } from "./usePostWorkspaceDeleteNavigation"

describe("resolvePostWorkspaceDeleteRoute", () => {
  it("redirects to onboarding when the deleted workspace was the last one", () => {
    expect(
      resolvePostWorkspaceDeleteRoute({
        deletedWorkspaceId: "ws_1",
        currentWorkspaceId: "ws_1",
        remainingWorkspaceIds: ["ws_1"],
      }),
    ).toMatchObject({
      nextWorkspaceId: null,
      redirectTo: "/dashboard/workspace",
      reason: "last-workspace",
    })
  })

  it("moves the current selection to another workspace and falls back to overview", () => {
    expect(
      resolvePostWorkspaceDeleteRoute({
        deletedWorkspaceId: "ws_1",
        currentWorkspaceId: "ws_1",
        remainingWorkspaceIds: ["ws_1", "ws_2", "ws_3"],
      }),
    ).toMatchObject({
      nextWorkspaceId: "ws_2",
      redirectTo: "/dashboard/overview",
      reason: "deleted-current-workspace",
    })
  })

  it("does not redirect when deleting a non-current workspace", () => {
    expect(
      resolvePostWorkspaceDeleteRoute({
        deletedWorkspaceId: "ws_2",
        currentWorkspaceId: "ws_1",
        remainingWorkspaceIds: ["ws_1", "ws_2", "ws_3"],
      }),
    ).toMatchObject({
      nextWorkspaceId: "ws_1",
      redirectTo: null,
      reason: "deleted-non-current-workspace",
    })
  })
})
