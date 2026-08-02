"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useConvexAuth, useMutation } from "convex/react"
import type { Id } from "@convex/_generated/dataModel"
import { useAuth } from "@/frontend/shared/foundation/auth"
import { ArrowRight, ArrowLeft, Check, Loader2, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColumnLayout } from "@/frontend/shared/ui/layout/container"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"

import { OnboardingProgress } from "./OnboardingProgress"
import { BundleSelector } from "./BundleSelector"
import { FeatureCustomizer } from "./FeatureCustomizer"
import {
  useBundleWithFeatures,
  getMergedBundleEnabledFeatures,
} from "../hooks/useBundles"
import { CORE_FEATURES } from "../constants"
import type { AvailableFeatureId } from "../constants"
import { WORKSPACE_ONBOARDING_PROGRESS_STEPS, WORKSPACE_ONBOARDING_WIZARD_STEPS } from "../constants/onboarding"
import type { WorkspaceType } from "../types"
import type { ExtendedOnboardingData } from "./onboarding-types"

interface RobustOnboardingFlowProps {
  onComplete: (workspaceId: Id<"workspaces">, enabledFeatures: AvailableFeatureId[]) => void
  variant?: "page" | "dialog"
  initialType?: WorkspaceType
}

export function RobustOnboardingFlow({
  onComplete,
  variant = "page",
  initialType = "personal"
}: RobustOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [data, setData] = useState<ExtendedOnboardingData>({
    name: "",
    type: initialType,
    description: "",
    selectedBundleId: null,
    enabledFeatures: [],
    disabledFeatures: [],
  })

  const { isSignedIn } = useAuth()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()

  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace)
  const trackEvent = useMutation(api.features.analytics.mutations.trackEvent)
  const pathname = usePathname()

  const { bundle: selectedBundle } = useBundleWithFeatures(data.selectedBundleId)

  const handleBundleSelect = useCallback((bundleId: string) => {
    setData(prev => ({
      ...prev,
      selectedBundleId: bundleId,
      disabledFeatures: [],
    }))
  }, [])

  useEffect(() => {
    if (selectedBundle) {
      const enabledFeatures = getMergedBundleEnabledFeatures(selectedBundle)
      setData(prev => {
        const prevSorted = [...prev.enabledFeatures].sort().join(',')
        const newSorted = [...enabledFeatures].sort().join(',')
        if (prevSorted === newSorted) return prev
        return { ...prev, enabledFeatures }
      })
    }
  }, [selectedBundle])

  const handleToggleFeature = useCallback((featureId: AvailableFeatureId) => {
    if (CORE_FEATURES.includes(featureId)) return

    setData(prev => {
      const isEnabled = prev.enabledFeatures.includes(featureId)
      if (isEnabled) {
        return {
          ...prev,
          enabledFeatures: prev.enabledFeatures.filter(f => f !== featureId),
          disabledFeatures: [...prev.disabledFeatures, featureId],
        }
      } else {
        return {
          ...prev,
          enabledFeatures: [...prev.enabledFeatures, featureId],
          disabledFeatures: prev.disabledFeatures.filter(f => f !== featureId),
        }
      }
    })
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < WORKSPACE_ONBOARDING_WIZARD_STEPS.length - 1) {
      setSubmitError(null)
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0 && !isSubmitting) {
      setSubmitError(null)
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep, isSubmitting])

  const handleStartOver = useCallback(() => {
    setCurrentStep(0)
    setSubmitError(null)
    setData({
      name: "",
      type: initialType,
      description: "",
      selectedBundleId: null,
      enabledFeatures: [],
      disabledFeatures: [],
    })
  }, [initialType])

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: return data.name.trim().length > 0
      case 1: return data.selectedBundleId !== null
      case 2: return data.enabledFeatures.length > 0
      default: return false
    }
  }, [currentStep, data])

  const handleComplete = async () => {
    if (!isSignedIn) {
      setSubmitError("You need to sign in before creating a workspace.")
      return
    }
    if (isConvexLoading || !isConvexAuthenticated) {
      setSubmitError("Authentication is still loading. Please wait a moment and try again.")
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    const slugify = (s: string) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

    const base = slugify(data.name) || "workspace"

    let attempt = 0
    while (attempt < 10) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
      try {
        const workspaceId = await createWorkspace({
          name: data.name,
          slug: candidate,
          type: data.type,
          description: data.description,
          isPublic: false,
          bundleId: data.selectedBundleId || undefined,
          enabledFeatures: data.enabledFeatures,
          selectedMenuSlugs: data.enabledFeatures,
        })

        void trackEvent({
          workspaceId,
          eventType: "onboarding",
          eventName: "onboarding.workspace_created",
          properties: {
            workspaceType: data.type,
            bundleId: data.selectedBundleId ?? undefined,
            enabledFeaturesCount: data.enabledFeatures.length,
            enabledFeatures: data.enabledFeatures,
          },
          metadata: {
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
            referrer: typeof document !== "undefined" ? document.referrer : undefined,
            path: pathname ?? undefined,
          },
        }).catch((err: unknown) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[Onboarding] analytics trackEvent failed", err)
          }
        })

        onComplete(workspaceId, data.enabledFeatures)
        setIsSubmitting(false)
        return
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        const duplicate = msg.includes("slug already exists") || (msg.includes("slug") && msg.includes("exists"))
        const unauthenticated = msg.toLowerCase().includes("not authenticated")

        if (unauthenticated) {
          setSubmitError("Authentication expired. Please sign in again and retry.")
          break
        }
        if (!duplicate) {
          setSubmitError("We couldn't create the workspace. Please try again.")
          break
        }
        attempt += 1
      }
    }

    setIsSubmitting(false)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div
            className="mx-auto w-full max-w-xl"
            data-testid="onboarding-details-form"
          >
            <div className="space-y-5 rounded-xl border border-border/60 bg-card/60 p-5 sm:p-6">
              <div className="space-y-1.5">
                <label htmlFor="onboarding-workspace-type" className="block text-sm font-medium">
                  Workspace Type
                </label>
                <p className="text-xs text-muted-foreground">
                  This helps us show the most relevant starting templates.
                </p>
                <select
                  id="onboarding-workspace-type"
                  value={data.type}
                  onChange={(e) => setData(prev => ({ ...prev, type: e.target.value as WorkspaceType }))}
                  className="mt-1 w-full rounded-xl border border-input/80 bg-background px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  <option value="personal">Personal</option>
                  <option value="family">Family</option>
                  <option value="group">Team / Group</option>
                  <option value="organization">Organization</option>
                  <option value="institution">Institution</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onboarding-workspace-name" className="block text-sm font-medium">
                  Workspace Name *
                </label>
                <input
                  id="onboarding-workspace-name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome Workspace"
                  autoFocus
                  className="w-full rounded-xl border border-input/80 bg-background px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onboarding-workspace-description" className="block text-sm font-medium">
                  Description <span className="text-muted-foreground">(Optional)</span>
                </label>
                <textarea
                  id="onboarding-workspace-description"
                  value={data.description}
                  onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What will you use this workspace for?"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-input/80 bg-background px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
              You can rename the workspace, switch templates, and refine features again after it is created.
            </p>
          </div>
        )

      case 1:
        return (
          <BundleSelector
            workspaceType={data.type}
            selectedBundleId={data.selectedBundleId}
            onSelect={handleBundleSelect}
          />
        )

      case 2:
        return (
          <FeatureCustomizer
            selectedBundleId={data.selectedBundleId}
            enabledFeatures={data.enabledFeatures}
            onToggleFeature={handleToggleFeature}
          />
        )

      default:
        return null
    }
  }

  const isLastStep = currentStep === WORKSPACE_ONBOARDING_WIZARD_STEPS.length - 1
  const isFirstStep = currentStep === 0
  const currentStepMeta = WORKSPACE_ONBOARDING_WIZARD_STEPS[currentStep]

  const content = (
    // ✅ FIX 1: flex-1 min-h-0 overflow-hidden agar bounded height mengalir ke bawah
    <div className="flex w-full min-h-0 flex-1 flex-col overflow-visible lg:overflow-hidden">
      <ColumnLayout
        scrollable={false}
        // ✅ FIX 2: use h-auto on mobile so it fits content tightly, h-full on desktop to fill area
        className="flex h-auto lg:h-full sm:min-h-[560px] flex-col overflow-hidden rounded-[24px] border border-border/70 bg-card/95 shadow-sm"
        headerClassName="border-b border-border/60 bg-card/95 px-0 py-0 flex-none"
        // ✅ FIX 3: body content management
        footerClassName="bg-card/95 flex-none"
        header={(
          <div className="space-y-3 px-4 py-3 sm:space-y-4 sm:px-6 sm:py-4 lg:px-7">
            <OnboardingProgress
              variant="pulse-line"
              currentStep={currentStep}
              steps={WORKSPACE_ONBOARDING_PROGRESS_STEPS}
            />
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-xl">
                {currentStepMeta.title}
              </h2>
              <p className="max-w-2xl text-xs text-muted-foreground sm:text-sm">
                {currentStepMeta.description}
              </p>
            </div>
          </div>
        )}
        footer={(
          <div>
            {submitError && (
              <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-4 sm:px-6 lg:px-7">
                <p className="mb-3 text-sm text-destructive">{submitError}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleComplete}
                    disabled={isSubmitting}
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Retry
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartOver}
                    disabled={isSubmitting}
                  >
                    <Home className="mr-1 h-4 w-4" />
                    Start Over
                  </Button>
                </div>
              </div>
            )}

            <div
              className="flex items-center justify-between gap-3 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-7"
              data-testid="onboarding-footer-actions"
            >
              <button
                onClick={handleBack}
                disabled={isFirstStep || isSubmitting}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm ${isFirstStep || isSubmitting
                  ? "cursor-not-allowed text-muted-foreground"
                  : "text-foreground hover:bg-muted"
                  }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {isLastStep ? (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed || isSubmitting}
                  className="ml-auto gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Creating..." : "Create Workspace"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed || isSubmitting}
                  className="ml-auto gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      >
        {/*
          ✅ FIX 4: Wrapper div ini penting jika ColumnLayout tidak otomatis
          memberi flex-1 min-h-0 ke children slot-nya.
          Ini memastikan ScrollArea mendapat bounded height yang benar.
        */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScrollArea
            className="h-full w-full flex-1"
            data-testid="onboarding-step-scroll-area"
          >
            <div
              className="px-4 py-4 sm:px-6 lg:px-7 lg:py-5"
              data-testid="onboarding-step-body"
            >
              {renderStepContent()}
            </div>
          </ScrollArea>
        </div>
      </ColumnLayout>
    </div>
  )

  if (variant === "dialog") {
    return content
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 md:px-8">
        {content}
      </div>
    </div>
  )
}
