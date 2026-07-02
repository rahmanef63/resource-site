"use client"

/**
 * AI API Keys Settings with Validation
 * Configure API keys for different AI providers
 */

import { useState } from "react"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import {
  useAISettingsStorage,
  AI_PROVIDERS,
  getAIProvider,
  type AIApiKeyConfig
} from "./useAISettings"
import { validateApiKeyFormat, getApiKeyExample, type ValidationResult } from "../utils/api-key-validation"
import { useAiFetch } from "@/frontend/shared/ai/hooks/useAiFetch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  Key,
  Trash2,
  Plus,
  Crown,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield
} from "lucide-react"
import {
  Accordion,
} from "@/components/ui/accordion"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { toast } from "sonner"

/**
 * Get tier badge for provider
 */
function ProviderTierBadge({ tier }: { tier: "premium" | "opensource" | "enterprise" }) {
  const config = {
    premium: { label: "Premium", icon: Crown, variant: "default" as const, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    enterprise: { label: "Enterprise", icon: Building2, variant: "secondary" as const, className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    opensource: { label: "Open Source", icon: Sparkles, variant: "outline" as const, className: "bg-green-500/10 text-green-600 border-green-500/20" },
  }

  const { label, icon: Icon, className } = config[tier]

  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}

/**
 * API Key Input Component with show/hide toggle and validation
 */
function ApiKeyInput({
  value,
  onChange,
  placeholder,
  disabled,
  onValidate,
  validationResult,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  onValidate?: () => void
  validationResult?: ValidationResult | null
}) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            // Clear validation when typing
            if (validationResult) {
              onValidate?.()
            }
          }}
          placeholder={placeholder || "sk-..."}
          disabled={disabled}
          className={`pr-20 font-mono text-sm ${
            validationResult?.isValid === false
              ? "border-red-500 focus:border-red-500"
              : validationResult?.isValid === true
              ? "border-green-500 focus:border-green-500"
              : ""
          }`}
        />
        <div className="absolute right-0 top-0 h-full flex items-center">
          {validationResult && (
            <div className="mr-2">
              {validationResult.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
          <Button aria-label="Hide"
            type="button"
            variant="ghost"
            size="sm"
            className="h-full px-2 hover:bg-transparent"
            onClick={() => setShowKey(!showKey)}
            disabled={disabled}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {validationResult?.isValid === false && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validationResult.error}
        </p>
      )}
      {validationResult?.isValid === true && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          API key is valid
          {validationResult.model && ` (${validationResult.model})`}
        </p>
      )}
    </div>
  )
}

/**
 * AI API Keys Settings with Validation
 * Configure API keys for different AI providers
 */
export function AIApiKeysSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()
  // Shared /api/ai/* fetch chokepoint (injects auth Bearer token). Must be
  // called before the early `isLoading` return to satisfy Rules of Hooks.
  const aiFetch = useAiFetch()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [newApiKey, setNewApiKey] = useState("")
  const [newBaseUrl, setNewBaseUrl] = useState("")
  const [isValidatingKey, setIsValidatingKey] = useState(false)
  const [keyValidationResult, setKeyValidationResult] = useState<ValidationResult | null>(null)
  const [validatingProviderId, setValidatingProviderId] = useState<string | null>(null)
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({})

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  const configuredProviders = settings.apiKeys || []

  /**
   * Validate API key against provider
   */
  const validateApiKey = async (providerId: string, apiKey: string, baseUrl?: string): Promise<ValidationResult> => {
    // Skip validation for Ollama
    if (providerId === "ollama") {
      const result: ValidationResult = { isValid: true }
      setKeyValidationResult(result)
      return result
    }

    // First do client-side format validation
    const formatValidation = validateApiKeyFormat(providerId, apiKey)
    if (!formatValidation.isValid) {
      setKeyValidationResult(formatValidation)
      return formatValidation
    }

    setIsValidatingKey(true)
    setValidatingProviderId(providerId)

    try {
      const response = await aiFetch("/api/ai/test-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId,
          apiKey: apiKey.trim(),
          baseUrl: baseUrl?.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const result = {
          isValid: true,
          provider: data.provider,
          model: data.model
        }
        setKeyValidationResult(result)
        setValidationResults(prev => ({ ...prev, [providerId]: result }))
        return result
      } else {
        const result = {
          isValid: false,
          error: data.error || "Validation failed"
        }
        setKeyValidationResult(result)
        setValidationResults(prev => ({ ...prev, [providerId]: result }))
        return result
      }
    } catch (error) {
      const result = {
        isValid: false,
        error: "Network error. Please try again."
      }
      setKeyValidationResult(result)
      setValidationResults(prev => ({ ...prev, [providerId]: result }))
      return result
    } finally {
      setIsValidatingKey(false)
      setValidatingProviderId(null)
    }
  }

  const handleAddApiKey = async () => {
    if (!selectedProvider) {
      toast.error("Please select a provider")
      return
    }

    // Ollama doesn't require API key
    if (selectedProvider !== "ollama" && !newApiKey.trim()) {
      toast.error("Please enter an API key")
      return
    }

    // Validate the API key before saving
    const validation = await validateApiKey(selectedProvider, newApiKey, newBaseUrl)

    if (!validation.isValid) {
      toast.error("Invalid API key: " + (validation.error || "Unknown error"))
      return
    }

    const newConfig: AIApiKeyConfig = {
      providerId: selectedProvider,
      apiKey: newApiKey.trim(),
      baseUrl: newBaseUrl.trim() || undefined,
      isEnabled: true,
      lastValidated: new Date().toISOString(),
    }

    // Remove existing config for this provider if exists
    const filtered = configuredProviders.filter(k => k.providerId !== selectedProvider)
    updateSetting("apiKeys", [...filtered, newConfig])

    toast.success(`API key added for ${getAIProvider(selectedProvider)?.name}`)
    setAddDialogOpen(false)
    setSelectedProvider("")
    setNewApiKey("")
    setNewBaseUrl("")
    setKeyValidationResult(null)
  }

  const handleRemoveApiKey = (providerId: string) => {
    const filtered = configuredProviders.filter(k => k.providerId !== providerId)
    updateSetting("apiKeys", filtered)
    // Clear validation result for this provider
    setValidationResults(prev => {
      const { [providerId]: _, ...rest } = prev
      return rest
    })
    toast.success("API key removed")
  }

  const handleToggleApiKey = (providerId: string, enabled: boolean) => {
    const updated = configuredProviders.map(k =>
      k.providerId === providerId ? { ...k, isEnabled: enabled } : k
    )
    updateSetting("apiKeys", updated)
  }

  const handleUpdateApiKey = async (providerId: string, apiKey: string) => {
    const updated = configuredProviders.map(k =>
      k.providerId === providerId ? { ...k, apiKey } : k
    )
    updateSetting("apiKeys", updated)

    // Clear validation if key was changed
    if (validationResults[providerId]) {
      setValidationResults(prev => {
        const { [providerId]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleUpdateBaseUrl = (providerId: string, baseUrl: string) => {
    const updated = configuredProviders.map(k =>
      k.providerId === providerId ? { ...k, baseUrl: baseUrl || undefined } : k
    )
    updateSetting("apiKeys", updated)
  }

  // Group providers by tier
  const premiumProviders = AI_PROVIDERS.filter(p => p.tier === "premium")
  const enterpriseProviders = AI_PROVIDERS.filter(p => p.tier === "enterprise")
  const opensourceProviders = AI_PROVIDERS.filter(p => p.tier === "opensource")

  const unconfiguredProviders = AI_PROVIDERS.filter(
    p => !configuredProviders.some(k => k.providerId === p.id)
  )

  return (
    <div className="space-y-6">
      {/* Configured API Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Configure API keys to use AI models from different providers
            </CardDescription>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Provider
          </Button>
          <ResponsiveDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} variant="modal" size="md">
            <ResponsiveDialog.Header>
              <ResponsiveDialog.Title className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Add AI Provider
              </ResponsiveDialog.Title>
              <ResponsiveDialog.Description>
                Configure and validate an API key to use models from this provider
              </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>
            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value)
                      setKeyValidationResult(null)
                      setNewApiKey("")
                      setNewBaseUrl("")
                    }}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select a provider...</option>
                    <optgroup label="Premium">
                      {premiumProviders.filter(p => !configuredProviders.some(k => k.providerId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Enterprise">
                      {enterpriseProviders.filter(p => !configuredProviders.some(k => k.providerId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Open Source">
                      {opensourceProviders.filter(p => !configuredProviders.some(k => k.providerId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {selectedProvider && (
                  <>
                    <div className="rounded-lg border p-3 bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{getAIProvider(selectedProvider)?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getAIProvider(selectedProvider)?.description}
                          </p>
                        </div>
                        <ProviderTierBadge tier={getAIProvider(selectedProvider)?.tier || "opensource"} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {getAIProvider(selectedProvider)?.sdkPackage}
                        </code>
                        <a
                          href={getAIProvider(selectedProvider)?.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        API Key
                        {selectedProvider !== "ollama" && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <ApiKeyInput
                        value={newApiKey}
                        onChange={setNewApiKey}
                        placeholder={getApiKeyExample(selectedProvider)}
                        validationResult={keyValidationResult}
                        onValidate={() => setKeyValidationResult(null)}
                      />
                      {selectedProvider !== "ollama" && (
                        <p className="text-xs text-muted-foreground">
                          Enter your API key. It will be validated before saving.
                        </p>
                      )}
                    </div>

                    {(selectedProvider === "ollama" || selectedProvider === "fireworks") && (
                      <div className="space-y-2">
                        <Label>Base URL (Optional)</Label>
                        <Input
                          value={newBaseUrl}
                          onChange={(e) => setNewBaseUrl(e.target.value)}
                          placeholder={selectedProvider === "ollama" ? "http://localhost:11434" : "https://api.fireworks.ai/inference/v1"}
                        />
                        <p className="text-xs text-muted-foreground">
                          Custom endpoint URL for self-hosted or proxy setups
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button aria-label="Check circle"
                        variant="outline"
                        size="sm"
                        onClick={() => validateApiKey(selectedProvider, newApiKey, newBaseUrl)}
                        disabled={!newApiKey.trim() || isValidatingKey || selectedProvider === "ollama"}
                        className="flex-1"
                      >
                        {isValidatingKey && validatingProviderId === selectedProvider ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Test Key
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </ResponsiveDialog.Body>
            <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
              <Button variant="outline" onClick={() => {
                setAddDialogOpen(false)
                setKeyValidationResult(null)
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleAddApiKey}
                disabled={
                  !selectedProvider ||
                  (selectedProvider !== "ollama" && !newApiKey) ||
                  isValidatingKey ||
                  (keyValidationResult?.isValid === false)
                }
              >
                {isValidatingKey ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Add API Key"
                )}
              </Button>
            </ResponsiveDialog.Footer>
          </ResponsiveDialog>
        </CardHeader>
        <CardContent>
          {configuredProviders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No API keys configured</p>
              <p className="text-sm mt-1">Add an API key to start using AI models</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configuredProviders.map((config) => {
                const provider = getAIProvider(config.providerId)
                const validation = validationResults[config.providerId]
                if (!provider) return null

                return (
                  <div
                    key={config.providerId}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          config.isEnabled ? "bg-primary/10" : "bg-muted"
                        }`}>
                          {config.isEnabled ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{provider.name}</span>
                            <ProviderTierBadge tier={provider.tier} />
                            {validation?.isValid && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Validated
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {provider.models.length} models available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SettingsToggle
                          label=""
                          checked={config.isEnabled}
                          onCheckedChange={(checked) => handleToggleApiKey(config.providerId, checked)}
                        />
                        <Button aria-label="Delete"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveApiKey(config.providerId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {config.providerId !== "ollama" && (
                      <div className="space-y-2">
                        <Label className="text-xs">API Key</Label>
                        <ApiKeyInput
                          value={config.apiKey}
                          onChange={(value) => handleUpdateApiKey(config.providerId, value)}
                          disabled={!config.isEnabled}
                          validationResult={validation}
                          onValidate={() => {
                            setValidationResults(prev => {
                              const { [config.providerId]: _, ...rest } = prev
                              return rest
                            })
                          }}
                        />
                      </div>
                    )}

                    {(config.providerId === "ollama" || config.baseUrl) && (
                      <div className="space-y-2">
                        <Label className="text-xs">Base URL</Label>
                        <Input
                          value={config.baseUrl || ""}
                          onChange={(e) => handleUpdateBaseUrl(config.providerId, e.target.value)}
                          placeholder="http://localhost:11434"
                          disabled={!config.isEnabled}
                          className="text-sm"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {provider.sdkPackage}
                      </code>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Providers Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Providers</CardTitle>
          <CardDescription>
            Reference guide for supported AI providers and their SDKs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion
            type="single"
            className="w-full"
            items={[
              {
                value: "premium",
                title: (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Premium Providers ({premiumProviders.length})
                  </div>
                ),
                content: (
                  <div className="space-y-3 pt-2">
                    {premiumProviders.map(provider => (
                      <div key={provider.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border">
                              {provider.sdkPackage}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {provider.models.length} models
                            </span>
                          </div>
                        </div>
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                value: "enterprise",
                title: (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    Enterprise Providers ({enterpriseProviders.length})
                  </div>
                ),
                content: (
                  <div className="space-y-3 pt-2">
                    {enterpriseProviders.map(provider => (
                      <div key={provider.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border">
                              {provider.sdkPackage}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {provider.models.length} models
                            </span>
                          </div>
                        </div>
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                value: "opensource",
                title: (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    Open Source Providers ({opensourceProviders.length})
                  </div>
                ),
                content: (
                  <div className="space-y-3 pt-2">
                    {opensourceProviders.map(provider => (
                      <div key={provider.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border">
                              {provider.sdkPackage}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {provider.models.length} models
                            </span>
                          </div>
                        </div>
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
