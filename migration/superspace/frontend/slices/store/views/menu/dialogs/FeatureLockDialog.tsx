"use client"

/**
 * Feature Lock Dialog
 * 
 * Shows password input for locked features.
 * When a member clicks on a locked feature, they need to enter
 * the password set by the workspace owner.
 */

import * as React from "react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react"

interface FeatureLockDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    featureName: string
    featureSlug: string
    onUnlock: (password: string) => Promise<boolean>
    onRequestAccess?: () => void
}

export function FeatureLockDialog({
    open,
    onOpenChange,
    featureName,
    featureSlug,
    onUnlock,
    onRequestAccess,
}: FeatureLockDialogProps) {
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false)
    const [isVerifying, setIsVerifying] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [attempts, setAttempts] = React.useState(0)

    const maxAttempts = 5

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password.trim() || isVerifying) return

        setIsVerifying(true)
        setError(null)

        try {
            const success = await onUnlock(password)
            if (success) {
                setPassword("")
                setAttempts(0)
                onOpenChange(false)
            } else {
                const newAttempts = attempts + 1
                setAttempts(newAttempts)
                if (newAttempts >= maxAttempts) {
                    setError(`Too many failed attempts. Please contact the workspace owner.`)
                } else {
                    setError(`Incorrect password. ${maxAttempts - newAttempts} attempts remaining.`)
                }
            }
        } catch (err) {
            setError("Failed to verify password. Please try again.")
        } finally {
            setIsVerifying(false)
        }
    }

    const handleClose = () => {
        setPassword("")
        setError(null)
        onOpenChange(false)
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={handleClose} variant="modal" size="sm">
            <ResponsiveDialog.Header>
                <ResponsiveDialog.Title className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-500" />
                    Feature Locked
                </ResponsiveDialog.Title>
                <ResponsiveDialog.Description>
                    <span className="font-medium text-foreground">{featureName}</span> is locked.
                    Enter the password to access this feature.
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                <form id="feature-lock-form" onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="feature-password">Password</Label>
                        <div className="relative">
                            <Input
                                id="feature-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter feature password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isVerifying || attempts >= maxAttempts}
                                autoFocus
                                className="pr-10"
                            />
                            <Button aria-label="Hide"
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {attempts >= maxAttempts && onRequestAccess && (
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onRequestAccess}
                                className="w-full"
                            >
                                Request Access from Owner
                            </Button>
                        </div>
                    )}
                </form>
            </ResponsiveDialog.Body>

            <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                </Button>
                <Button aria-label="Lock"
                    type="submit"
                    form="feature-lock-form"
                    disabled={!password.trim() || isVerifying || attempts >= maxAttempts}
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            Unlock
                        </>
                    )}
                </Button>
            </ResponsiveDialog.Footer>
        </ResponsiveDialog>
    )
}
