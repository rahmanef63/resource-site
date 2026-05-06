"use client"

/**
 * Auth helpers backed by @convex-dev/auth.
 *
 * Exports: useUser, useAuth, useAuthClient, SignInButton, SignUpButton,
 * SignOutButton, UserButton, SignIn, SignUp.
 */

import * as React from "react"
import { useConvexAuth, useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"

type AuthUserShape = {
  id: string
  fullName: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string | undefined
  primaryEmailAddress: { emailAddress: string } | undefined
}

function useAuthUser(): { isLoaded: boolean; user: AuthUserShape | null } {
  const { isLoading } = useConvexAuth()
  const me = useQuery(
    // resolved at runtime; see convex/auth.ts for canonical query
    (api as any).auth?.loggedInUser ?? (api as any).users?.current,
  )
  const isLoaded = !isLoading && me !== undefined
  if (!isLoaded || !me) return { isLoaded, user: null }

  const fullName = (me as any).name ?? null
  const [firstName, ...rest] = (fullName ?? "").split(" ")
  const lastName = rest.length ? rest.join(" ") : null
  return {
    isLoaded,
    user: {
      id: String((me as any)._id),
      fullName,
      firstName: firstName || null,
      lastName,
      imageUrl: (me as any).image ?? (me as any).imageUrl ?? undefined,
      primaryEmailAddress: (me as any).email
        ? { emailAddress: (me as any).email }
        : undefined,
    },
  }
}

export const useUser = useAuthUser

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { user } = useAuthUser()
  return {
    isLoaded: !isLoading,
    isSignedIn: isAuthenticated,
    userId: user?.id ?? null,
  }
}

export function useAuthClient() {
  const { signOut: convexSignOut } = useAuthActions()
  return React.useMemo(
    () => ({
      signOut: async (opts?: { redirectUrl?: string }) => {
        await convexSignOut()
        if (opts?.redirectUrl && typeof window !== "undefined") {
          window.location.assign(opts.redirectUrl)
        }
      },
      openSignIn: async (_opts?: any) => {
        if (typeof window !== "undefined") window.location.assign("/sign-in")
      },
      openSignUp: async (_opts?: any) => {
        if (typeof window !== "undefined") window.location.assign("/sign-up")
      },
      openUserProfile: async (_opts?: any) => {
        if (typeof window !== "undefined") window.location.assign("/dashboard/settings/profile")
      },
      redirectToSignIn: async (_opts?: any) => {
        if (typeof window !== "undefined") window.location.assign("/sign-in")
      },
      redirectToSignUp: async (_opts?: any) => {
        if (typeof window !== "undefined") window.location.assign("/sign-up")
      },
    }),
    [convexSignOut],
  )
}

type ButtonShellProps = {
  children?: React.ReactNode
  mode?: "modal" | "redirect"
  fallbackRedirectUrl?: string
  appearance?: any
}

export function SignInButton({ children, fallbackRedirectUrl }: ButtonShellProps) {
  const onClick = () => {
    const target = fallbackRedirectUrl ?? "/sign-in"
    if (typeof window !== "undefined") window.location.assign(target)
  }
  return (
    <span role="button" onClick={onClick}>
      {children ?? <Button>Sign in</Button>}
    </span>
  )
}

export function SignUpButton({ children, fallbackRedirectUrl }: ButtonShellProps) {
  const onClick = () => {
    const target = fallbackRedirectUrl ?? "/sign-up"
    if (typeof window !== "undefined") window.location.assign(target)
  }
  return (
    <span role="button" onClick={onClick}>
      {children ?? <Button variant="outline">Sign up</Button>}
    </span>
  )
}

export function SignOutButton({ children, redirectUrl = "/" }: ButtonShellProps & { redirectUrl?: string }) {
  const { signOut } = useAuthClient()
  const onClick = async () => {
    await signOut({ redirectUrl })
  }
  return (
    <span role="button" onClick={onClick}>
      {children ?? <Button variant="ghost">Sign out</Button>}
    </span>
  )
}

export function UserButton() {
  const { user } = useAuthUser()
  if (!user) return null
  const fallback = (user.fullName ?? "U").slice(0, 2).toUpperCase()
  return (
    <Avatar className="h-8 w-8">
      {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={user.fullName ?? "User"} /> : null}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

type AuthFormProps = { routing?: string; fallbackRedirectUrl?: string; signInUrl?: string; signUpUrl?: string }

export function SignIn({ fallbackRedirectUrl }: AuthFormProps) {
  return (
    <div className="flex flex-col gap-3 text-center">
      <p className="text-sm text-muted-foreground">
        Sign-in form placeholder. Implement with @convex-dev/auth Password / OAuth providers.
      </p>
      <Button onClick={() => (window.location.href = fallbackRedirectUrl ?? "/sign-in")}>
        Open Sign In
      </Button>
    </div>
  )
}

export function SignUp({ fallbackRedirectUrl }: AuthFormProps) {
  return (
    <div className="flex flex-col gap-3 text-center">
      <p className="text-sm text-muted-foreground">
        Sign-up form placeholder. Implement with @convex-dev/auth Password / OAuth providers.
      </p>
      <Button onClick={() => (window.location.href = fallbackRedirectUrl ?? "/sign-up")}>
        Open Sign Up
      </Button>
    </div>
  )
}
