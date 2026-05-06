"use client"

import { Component, type ErrorInfo, type ReactNode, Suspense } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { AppContent } from "../foundation";
import { PageLoading } from "@/frontend/shared/ui/components/loading/PageLoading";

// Error Boundary for catching component load failures
class PageErrorBoundary extends Component<
  { children: ReactNode; activeView: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; activeView: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error loading page '${this.props.activeView}':`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Page Failed to Load</h2>
            <p className="text-sm text-muted-foreground">
              The page &quot;{this.props.activeView}&quot; could not be loaded.
            </p>
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium hover:underline">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs">
                {this.state.error?.message || "Unknown error"}
                {"\n"}
                {this.state.error?.stack}
              </pre>
            </details>
            <div className="text-sm text-muted-foreground">
              <p>This might happen if:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-left">
                <li>The page component file is missing</li>
                <li>There is a compilation error in the component</li>
                <li>Required dependencies are not installed</li>
              </ul>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.href = "/dashboard/overview"
              }}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading fallback for Suspense
function PageLoadingFallback() {
  return <PageLoading />;
}

interface AppContentWrapperProps {
  workspaceId?: Id<"workspaces"> | null
  activeView: string
}

/**
 * Wrapper around AppContent that adds:
 * - Error boundary for catching page load failures
 * - Suspense boundary with loading state
 */
export function AppContentWrapper({ workspaceId, activeView }: AppContentWrapperProps) {
  return (
    <PageErrorBoundary activeView={activeView}>
      <Suspense fallback={<PageLoadingFallback />}>
        <AppContent workspaceId={workspaceId} activeView={activeView} />
      </Suspense>
    </PageErrorBoundary>
  )
}
