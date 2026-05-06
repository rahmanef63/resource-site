"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { IconAlertCircle, IconArrowLeft, IconHome } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface StatePageProps {
  title: string
  description: string
  children?: ReactNode
  showHomeLink?: boolean
  showBackLink?: boolean
}

/**
 * Reusable component for state pages (not-found, error, etc.)
 * Consistent styling across all dashboard state pages
 */
export function StatePage({
  title,
  description,
  children,
  showHomeLink = true,
  showBackLink = false,
}: StatePageProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        {showBackLink && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <IconArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        )}
        {showHomeLink && (
          <Button variant="default" size="sm" asChild className="gap-2">
            <Link href="/dashboard">
              <IconHome className="h-4 w-4" />
              Dashboard Home
            </Link>
          </Button>
        )}
      </div>

      {children}
    </div>
  )
}

/**
 * Not Found state page component
 */
export function NotFoundState({
  title = "Page Not Found",
  description = "The page you are looking for doesn't exist or you don't have access to it.",
  showBackLink = true,
}: Partial<StatePageProps>) {
  return (
    <StatePage
      title={title}
      description={description}
      showHomeLink
      showBackLink={showBackLink}
    />
  )
}

/**
 * Error state page component
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again later.",
  showBackLink = true,
  children,
}: Partial<StatePageProps>) {
  return (
    <StatePage
      title={title}
      description={description}
      showHomeLink
      showBackLink={showBackLink}
    >
      {children}
    </StatePage>
  )
}

/**
 * Unauthorized state page component
 */
export function UnauthorizedState({
  title = "Access Denied",
  description = "You don't have permission to access this resource.",
}: Partial<StatePageProps>) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-6">
      <div className="rounded-full bg-destructive/10 p-4 mb-2">
        <IconAlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </div>
      <Button variant="default" size="sm" asChild className="gap-2">
        <Link href="/dashboard">
          <IconHome className="h-4 w-4" />
          Dashboard Home
        </Link>
      </Button>
    </div>
  )
}

/**
 * No Workspace state page component
 */
export function NoWorkspaceState() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">No Workspace Yet</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Create your first workspace to get started with SuperSpace.
        </p>
      </div>
      <Button variant="default" size="default" asChild>
        <Link href="/dashboard/workspace">Create Workspace</Link>
      </Button>
    </div>
  )
}

/**
 * Unauthenticated state page component
 */
export function UnauthenticatedState() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Not Signed In</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Please sign in to access the dashboard.
        </p>
      </div>
      <Button variant="default" size="default" asChild>
        <Link href="/">Go to Home</Link>
      </Button>
    </div>
  )
}
