"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { createAuthFlow, type AuthSignIn } from "../lib/flow-core";

/** React adapter for the framework-neutral auth flow core. */
export function useAuthFlow() {
  const { signIn, signOut } = useAuthActions();
  return createAuthFlow({
    signIn: signIn as AuthSignIn,
    signOut,
  });
}
