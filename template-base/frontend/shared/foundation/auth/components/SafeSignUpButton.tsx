'use client'

import React from 'react'
import { useAuthClient } from '@/frontend/shared/foundation/auth'

type SafeSignUpButtonProps = {
  children: React.ReactNode
  mode?: 'modal' | 'redirect'
  appearance?: any
  afterSignUpUrl?: string
  fallbackRedirectUrl?: string
}

export function SafeSignUpButton({
  children,
  mode = 'modal',
  appearance,
  afterSignUpUrl = '/dashboard',
  fallbackRedirectUrl = '/dashboard',
}: SafeSignUpButtonProps) {
  const { openSignUp, redirectToSignUp } = useAuthClient()

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (mode === 'redirect') {
        await redirectToSignUp({ afterSignUpUrl, signUpFallbackRedirectUrl: fallbackRedirectUrl })
      } else {
        await openSignUp({ appearance, afterSignUpUrl, fallbackRedirectUrl })
      }
    } catch (err) {
      try { window.location.assign('/') } catch {}
    }
  }

  return <span onClick={onClick}>{children}</span>
}

export default SafeSignUpButton
