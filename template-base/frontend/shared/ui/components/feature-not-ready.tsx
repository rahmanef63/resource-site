"use client"

import { AlertTriangle, Construction, ExternalLink, Info } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface FeatureNotReadyProps {
  featureName: string
  featureSlug: string
  status: "development" | "beta" | "coming-soon" | "error"
  message?: string
  expectedRelease?: string
  docsUrl?: string
  onGoBack?: () => void
}

const statusConfig = {
  development: {
    icon: Construction,
    title: "Feature in Development",
    badgeVariant: "secondary" as const,
    badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    description: "This feature is currently under active development.",
  },
  beta: {
    icon: Info,
    title: "Beta Feature",
    badgeVariant: "secondary" as const,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    description: "This feature is in beta. Some functionality may be incomplete.",
  },
  "coming-soon": {
    icon: Info,
    title: "Coming Soon",
    badgeVariant: "outline" as const,
    badgeColor: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    description: "This feature is planned for a future release.",
  },
  error: {
    icon: AlertTriangle,
    title: "Feature Not Available",
    badgeVariant: "destructive" as const,
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    description: "This feature encountered an error or is not available.",
  },
}

export function FeatureNotReady({
  featureName,
  featureSlug,
  status,
  message,
  expectedRelease,
  docsUrl,
  onGoBack,
}: FeatureNotReadyProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl">{featureName}</CardTitle>
                <CardDescription className="mt-1">
                  Slug: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{featureSlug}</code>
                </CardDescription>
              </div>
            </div>
            <Badge className={config.badgeColor} variant={config.badgeVariant}>
              {status.toUpperCase().replace("", " ")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <Icon className="h-4 w-4" />
            <AlertTitle>{config.title}</AlertTitle>
            <AlertDescription>{message || config.description}</AlertDescription>
          </Alert>

          {expectedRelease && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Expected Release</p>
              <p className="text-sm text-muted-foreground">{expectedRelease}</p>
            </div>
          )}

          {status === "development" && (
            <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Development Status
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>Backend API endpoints may be incomplete</li>
                <li>UI components are being refined</li>
                <li>Features may change without notice</li>
              </ul>
            </div>
          )}

          {status === "beta" && (
            <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Beta Notice</p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                This feature is functional but may have bugs or missing functionality. Your feedback is
                appreciated!
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {onGoBack && (
              <Button variant="outline" onClick={onGoBack}>
                Go Back
              </Button>
            )}

            {docsUrl && (
              <Button variant="outline" asChild>
                <Link href={docsUrl} target="_blank" rel="noopener noreferrer">
                  View Documentation
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button variant="outline" asChild>
              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report Issue
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
