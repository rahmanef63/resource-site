import React, { useState } from 'react'
import { SignIn, SignUp } from '@/frontend/shared/foundation/auth'
import { ResponsiveDialog } from "@/frontend/shared/ui"

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {mode === 'signup'
            ? 'Join WorkspaceHub to collaborate with your workspace'
            : 'Sign in to your WorkspaceHub account'}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-4">
          {mode === 'signup' ? (
            <SignUp signInUrl="/" routing="hash" fallbackRedirectUrl="/dashboard/overview" />
          ) : (
            <SignIn signUpUrl="/" routing="hash" fallbackRedirectUrl="/dashboard/overview" />
          )}
          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {mode === 'signup'
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  );
}
