"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Users } from "lucide-react"
import { useMutation, useQuery } from "convex/react"

import type { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"

function extractTokenFromInput(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  try {
    const url = new URL(trimmed)
    const fromQuery = url.searchParams.get("token") || url.searchParams.get("t")
    if (fromQuery) return fromQuery
    const segments = url.pathname.split("/").filter(Boolean)
    const last = segments[segments.length - 1]
    if (last) return last
  } catch {
    // not a URL
  }
  return trimmed
}

export interface JoinWorkspacePanelProps {
  className?: string
  onJoined?: (workspaceId: Id<"workspaces">) => void
  actionLabel?: string
}

export function JoinWorkspacePanel({
  className,
  onJoined,
  actionLabel = "Join workspace",
}: JoinWorkspacePanelProps) {
  const [rawInput, setRawInput] = React.useState("")
  const [submittedToken, setSubmittedToken] = React.useState<string | null>(null)
  const [isJoining, setIsJoining] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [joinedWorkspaceId, setJoinedWorkspaceId] = React.useState<Id<"workspaces"> | null>(null)

  const token = extractTokenFromInput(rawInput)
  const lookupToken = token.length > 0 ? token : null
  const lookupResult = useQuery(
    api.workspace.invitations.getInvitationByToken,
    lookupToken ? { token: lookupToken } : "skip",
  ) as
    | {
        _id: Id<"invitations">
        status: "pending" | "accepted" | "declined" | "expired"
        expiresAt: number
        type: "workspace" | "personal"
        inviteeEmail: string
        workspace?: { _id: Id<"workspaces">; name: string; slug?: string } | null
        role?: { name?: string } | null
        inviter?: { name?: string; email?: string } | null
      }
    | null
    | undefined

  const acceptByToken = useMutation(api.workspace.invitations.acceptInvitationByToken)

  const handleJoin = React.useCallback(async () => {
    if (!token) return
    setError(null)
    setIsJoining(true)
    try {
      const invitation = (await acceptByToken({ token })) as {
        workspaceId?: Id<"workspaces"> | null
        type: "workspace" | "personal"
      }
      setSubmittedToken(token)
      if (invitation?.workspaceId) {
        setJoinedWorkspaceId(invitation.workspaceId)
        onJoined?.(invitation.workspaceId)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept invitation")
    } finally {
      setIsJoining(false)
    }
  }, [acceptByToken, onJoined, token])

  const isLookupLoading = lookupToken !== null && lookupResult === undefined
  const hasValidInvitation =
    lookupResult &&
    lookupResult.status === "pending" &&
    lookupResult.expiresAt > Date.now()
  const isExpired =
    lookupResult && lookupResult.expiresAt <= Date.now() && submittedToken === null

  return (
    <div className={cn("mx-auto w-full max-w-xl space-y-4", className)}>
      {joinedWorkspaceId ? (
        <div className="space-y-3 rounded-lg border bg-green-50 p-4 text-sm dark:bg-green-950/20">
          <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            You joined {lookupResult?.workspace?.name ?? "the workspace"} successfully.
          </div>
          <p className="text-xs text-muted-foreground">
            Redirecting you to the new workspace…
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5 rounded-xl border border-border/60 bg-card/60 p-5 sm:p-6">
            <div className="space-y-1.5">
              <label htmlFor="join-workspace-input" className="block text-sm font-medium">
                Invitation link or token
              </label>
              <p className="text-xs text-muted-foreground">
                Paste the full invitation URL or just the token ID shared with you.
              </p>
              <div className="relative mt-1">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="join-workspace-input"
                  type="text"
                  value={rawInput}
                  onChange={(e) => {
                    setRawInput(e.target.value)
                    setError(null)
                  }}
                  placeholder="https://… or invitation token"
                  className="w-full rounded-xl border border-input/80 bg-background pl-9 pr-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {lookupToken && isLookupLoading && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking up invitation…
              </div>
            )}

            {lookupToken && !isLookupLoading && lookupResult === null && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Invitation not found. Check the link and try again.
              </div>
            )}

            {hasValidInvitation && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {lookupResult?.workspace?.name ?? "Workspace invitation"}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {lookupResult?.role?.name && (
                    <span className="rounded border px-1.5 py-0.5">
                      Role: {lookupResult.role.name}
                    </span>
                  )}
                  <span className="rounded border px-1.5 py-0.5">
                    Invite for {lookupResult!.inviteeEmail}
                  </span>
                  {lookupResult?.inviter?.name && (
                    <span className="rounded border px-1.5 py-0.5">
                      From {lookupResult.inviter.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {isExpired && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                This invitation has expired. Ask the sender for a new link.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <Button
            onClick={handleJoin}
            disabled={!hasValidInvitation || isJoining}
            className="w-full gap-2 sm:w-auto"
          >
            {isJoining && <Loader2 className="h-4 w-4 animate-spin" />}
            {actionLabel}
          </Button>

          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            You must be signed in with the email the invitation was sent to.
          </p>
        </>
      )}
    </div>
  )
}
