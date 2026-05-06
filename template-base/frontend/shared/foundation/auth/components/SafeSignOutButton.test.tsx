/**
 * @vitest-environment jsdom
 */

import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const {
  mockSignOut,
  mockBroadcastSignedOutEvent,
  mockCreateSignedOutEvent,
} = vi.hoisted(() => ({
  mockSignOut: vi.fn().mockResolvedValue(undefined),
  mockBroadcastSignedOutEvent: vi.fn(),
  mockCreateSignedOutEvent: vi.fn().mockReturnValue({ type: "signed-out", at: 1 }),
}))

import { SafeSignOutButton } from "./SafeSignOutButton"

vi.mock("@/frontend/shared/foundation/auth", () => ({
  useAuthClient: () => ({
    signOut: mockSignOut,
  }),
}))

vi.mock("@/frontend/shared/foundation/auth/session-sync", () => ({
  broadcastSignedOutEvent: mockBroadcastSignedOutEvent,
  createSignedOutEvent: mockCreateSignedOutEvent,
}))

describe("SafeSignOutButton", () => {
  it("broadcasts the sign-out event after auth sign-out resolves", async () => {
    render(
      <SafeSignOutButton>
        <button type="button">Sign out</button>
      </SafeSignOutButton>,
    )

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/" })
      expect(mockCreateSignedOutEvent).toHaveBeenCalledTimes(1)
      expect(mockBroadcastSignedOutEvent).toHaveBeenCalledWith({ type: "signed-out", at: 1 })
    })
  })
})
