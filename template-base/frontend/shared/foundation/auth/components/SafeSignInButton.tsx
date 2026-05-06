'use client'

import React from 'react'
import { useAuthClient } from '@/frontend/shared/foundation/auth'

type SafeSignInButtonProps = {
  children: React.ReactNode
  mode?: 'modal' | 'redirect'
  appearance?: any
  afterSignInUrl?: string
  fallbackRedirectUrl?: string
}

export function SafeSignInButton({
  children,
  mode = 'modal',
  appearance,
  afterSignInUrl = '/dashboard/overview',
  fallbackRedirectUrl = '/dashboard/overview',
}: SafeSignInButtonProps) {
  const { openSignIn, redirectToSignIn } = useAuthClient()

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (mode === 'redirect') {
        await redirectToSignIn({ afterSignInUrl, signInFallbackRedirectUrl: fallbackRedirectUrl })
      } else {
        await openSignIn({ appearance, afterSignInUrl, fallbackRedirectUrl })
      }
    } catch (err) {
      // If auth is in a bad state (e.g., deleted account with stale session),
      // fall back to a safe hard redirect without invoking server actions.
      try { window.location.assign('/') } catch {}
    }
  }

  return <span onClick={onClick}>{children}</span>
}

export default SafeSignInButton
