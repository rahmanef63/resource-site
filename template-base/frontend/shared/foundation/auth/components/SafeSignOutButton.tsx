'use client'

import React from 'react'
import { useAuthClient } from '@/frontend/shared/foundation/auth'
import {
  broadcastSignedOutEvent,
  createSignedOutEvent,
} from '@/frontend/shared/foundation/auth/session-sync'

type SafeSignOutButtonProps = {
  children: React.ReactNode
  redirectUrl?: string
}

export function SafeSignOutButton({ children, redirectUrl = '/' }: SafeSignOutButtonProps) {
  const { signOut } = useAuthClient()

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await signOut({ redirectUrl })
      broadcastSignedOutEvent(createSignedOutEvent())
    } catch (err) {
      // Swallow dev-time errors (e.g., Windows FS ENOENT) and hard redirect.
      try {
        broadcastSignedOutEvent(createSignedOutEvent())
        window.location.assign(redirectUrl)
      } catch {}
    }
  }

  return <span onClick={onClick}>{children}</span>
}

export default SafeSignOutButton
