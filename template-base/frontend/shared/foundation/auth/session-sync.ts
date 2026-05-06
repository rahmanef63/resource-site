"use client"

export const AUTH_SYNC_CHANNEL_NAME = "superspace-auth"
export const AUTH_SYNC_STORAGE_KEY = "superspace:auth:event"

export type AuthSyncEvent = {
  type: "signed-out"
  at: number
}

const SIGNED_IN_UI_STORAGE_KEYS = [
  "superspace:lastWorkspaceId",
] as const

export function clearSignedInSessionState() {
  if (typeof window === "undefined") {
    return
  }

  SIGNED_IN_UI_STORAGE_KEYS.forEach((storageKey) => {
    window.localStorage.removeItem(storageKey)
  })
}

export function createSignedOutEvent(): AuthSyncEvent {
  return {
    type: "signed-out",
    at: Date.now(),
  }
}

export function serializeAuthSyncEvent(event: AuthSyncEvent) {
  return JSON.stringify(event)
}

export function parseAuthSyncEvent(rawValue: string | null | undefined): AuthSyncEvent | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<AuthSyncEvent>
    if (parsed.type !== "signed-out" || typeof parsed.at !== "number") {
      return null
    }

    return {
      type: "signed-out",
      at: parsed.at,
    }
  } catch {
    return null
  }
}

export function broadcastSignedOutEvent(event: AuthSyncEvent) {
  if (typeof window === "undefined") {
    return
  }

  const serializedEvent = serializeAuthSyncEvent(event)

  clearSignedInSessionState()

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME)
    channel.postMessage(serializedEvent)
    channel.close()
  }

  window.localStorage.setItem(AUTH_SYNC_STORAGE_KEY, serializedEvent)
}
