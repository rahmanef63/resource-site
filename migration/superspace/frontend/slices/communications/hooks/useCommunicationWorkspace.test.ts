import { describe, expect, it } from "vitest"
import { resolveActiveCommunicationWorkspace } from "./useCommunicationWorkspace"

const workspaceA = {
  _id: "workspace-a",
  name: "Workspace A",
}

const workspaceB = {
  _id: "workspace-b",
  name: "Workspace B",
}

describe("resolveActiveCommunicationWorkspace", () => {
  it("prefers the communication workspace selection when it is valid", () => {
    const result = resolveActiveCommunicationWorkspace(
      [workspaceA, workspaceB] as any,
      "workspace-b",
      workspaceA as any,
    )

    expect(result?._id).toBe("workspace-b")
  })

  it("falls back to the current global workspace when the stored communication workspace is stale", () => {
    const result = resolveActiveCommunicationWorkspace(
      [workspaceA, workspaceB] as any,
      "workspace-missing",
      workspaceA as any,
    )

    expect(result?._id).toBe("workspace-a")
  })

  it("falls back to the first accessible workspace when there is no stored or global selection", () => {
    const result = resolveActiveCommunicationWorkspace(
      [workspaceA, workspaceB] as any,
      null,
      null,
    )

    expect(result?._id).toBe("workspace-a")
  })
})
