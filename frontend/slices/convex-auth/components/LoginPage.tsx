"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvex } from "convex/react"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@convex/_generated/api"

type Mode = "signIn" | "signUp"

export interface LoginPageProps {
  /** Where to send users after successful auth. Defaults to "/". */
  redirectTo?: string
  /** Optional brand header text. */
  brand?: string
}

/**
 * Kitab Login surface — login-or-register single flow per si-coder convention:
 *   1. User types email + password
 *   2. We probe `auth.checkEmail.userExistsByEmail`
 *   3. signIn() with flow = "signIn" | "signUp" accordingly
 *
 * Errors are surfaced via sonner toast (Indonesian-localized to match
 * @convex-dev/auth thrown strings from harvested convex/features/auth/auth.ts).
 */
export function LoginPage({ redirectTo = "/", brand = "Welcome back" }: LoginPageProps) {
  const router = useRouter()
  const { signIn } = useAuthActions()
  const convex = useConvex()
  const [mode, setMode] = useState<Mode>("signIn")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // Probe whether the email exists to pick signIn vs signUp.
      const exists = await convex.query(api.features.auth.checkEmail.userExistsByEmail, { email })
      const flow: Mode = exists ? "signIn" : "signUp"
      await signIn("password", {
        email,
        password,
        flow,
        ...(flow === "signUp" ? { name: name || email.split("@")[0] } : {}),
      })
      toast.success(flow === "signUp" ? "Account created" : "Signed in")
      router.push(redirectTo)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed"
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function signInWithGoogle() {
    setError(null)
    try {
      await signIn("google", { redirectTo })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed"
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{brand}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account or create a new one.
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signIn">Sign in</TabsTrigger>
            <TabsTrigger value="signUp">Sign up</TabsTrigger>
          </TabsList>

          <form onSubmit={submit} className="mt-4 space-y-4">
            {mode === "signUp" && (
              <TabsContent value="signUp" className="mt-0 space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                    autoComplete="name"
                  />
                </div>
              </TabsContent>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {mode === "signUp" && (
                <p className="text-xs text-muted-foreground">
                  Min 8 characters, must include a letter and a digit.
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Please wait…" : mode === "signUp" ? "Create account" : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={signInWithGoogle}
            >
              Continue with Google
            </Button>
          </form>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
