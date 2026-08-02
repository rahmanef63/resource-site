/**
 * API Key Validation Utilities for AI Providers
 * Validates API key formats and tests against provider APIs
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  provider?: string
  model?: string
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "")
}

function findInvalidHeaderValueChar(value: string): { index: number; code: number } | null {
  // Fetch header values must be valid ByteStrings (0..255) and must not include
  // ASCII control chars (0..31) or DEL (127). Non-Latin1 chars like an em dash (—)
  // trigger: "Cannot convert argument to a ByteString...".
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code > 0xff || code < 0x20 || code === 0x7f) {
      return { index: i, code }
    }
  }
  return null
}

/**
 * Provider-specific API key format validation
 */
export function validateApiKeyFormat(providerId: string, apiKey: string): ValidationResult {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false, error: "API key cannot be empty" }
  }

  const trimmedKey = apiKey.trim()

  // Guardrail: keys are used in HTTP headers (Authorization: Bearer ...)
  // so they must not contain Unicode punctuation or control characters.
  const invalidChar = findInvalidHeaderValueChar(trimmedKey)
  if (invalidChar) {
    const codeHex = invalidChar.code.toString(16).toUpperCase().padStart(4, "0")
    return {
      isValid: false,
      error:
        `API key contains an unsupported character at position ${invalidChar.index + 1} (U+${codeHex}). ` +
        `This often happens when '-' becomes an em dash '—'. Please re-copy the key from the provider dashboard.`,
    }
  }

  switch (providerId) {
    case "openai":
      // OpenAI keys start with 'sk-' and are typically 51 characters
      if (!trimmedKey.startsWith("sk-")) {
        return { isValid: false, error: "OpenAI API keys must start with 'sk-'" }
      }
      if (trimmedKey.length < 20) {
        return { isValid: false, error: "Invalid OpenAI API key format" }
      }
      break

    case "anthropic":
      // Anthropic keys start with 'sk-ant-api03-'
      if (!trimmedKey.startsWith("sk-ant-")) {
        return { isValid: false, error: "Anthropic API keys must start with 'sk-ant-'" }
      }
      break

    case "google":
      // Google AI keys are typically 39 characters alphanumeric
      if (!/^[a-zA-Z0-9_-]{20,}$/.test(trimmedKey)) {
        return { isValid: false, error: "Invalid Google AI API key format" }
      }
      break

    case "groq":
      // Groq keys start with 'gsk_' and are typically 56 characters
      if (!trimmedKey.startsWith("gsk_")) {
        return { isValid: false, error: "Groq API keys must start with 'gsk_'" }
      }
      break

    case "mistral":
      // Mistral keys are typically 32 characters alphanumeric
      if (!/^[a-zA-Z0-9]{32}$/.test(trimmedKey)) {
        return { isValid: false, error: "Invalid Mistral API key format" }
      }
      break

    case "cohere":
      // Cohere keys are typically 40 characters alphanumeric
      if (!/^[a-zA-Z0-9]{40}$/.test(trimmedKey)) {
        return { isValid: false, error: "Invalid Cohere API key format" }
      }
      break

    case "xai":
      // xAI keys are typically 48 characters and might contain specific prefixes
      if (trimmedKey.length < 20) {
        return { isValid: false, error: "Invalid xAI API key format" }
      }
      break

    case "together":
      // Together AI keys are typically 64 characters
      if (trimmedKey.length < 20) {
        return { isValid: false, error: "Invalid Together AI API key format" }
      }
      break

    case "perplexity":
      // Perplexity keys start with 'pplx-' for some keys
      if (trimmedKey.length < 20) {
        return { isValid: false, error: "Invalid Perplexity API key format" }
      }
      break

    case "deepseek":
      // DeepSeek keys are typically 48 characters
      if (trimmedKey.length < 20) {
        return { isValid: false, error: "Invalid DeepSeek API key format" }
      }
      break

    case "glm":
    case "z-ai":
      // Z.AI (GLM) keys don't have a public prefix requirement in docs.
      if (trimmedKey.length < 10) {
        return { isValid: false, error: "Invalid Z.AI (GLM) API key format" }
      }
      break

    case "openrouter":
      // OpenRouter keys start with 'sk-or-v1-'
      if (!trimmedKey.startsWith("sk-or-")) {
        return { isValid: false, error: "OpenRouter API keys must start with 'sk-or-'" }
      }
      if (trimmedKey.length < 20) {
        return { isValid: false, error: "Invalid OpenRouter API key format" }
      }
      break

    case "ollama":
      // Ollama doesn't require API key for local setup
      return { isValid: true }

    default:
      // For unknown providers, just check if it's not empty
      if (trimmedKey.length < 5) {
        return { isValid: false, error: "API key seems too short" }
      }
      break
  }

  return { isValid: true }
}

/**
 * Test API key against provider's API
 */
export async function testApiKey(
  providerId: string,
  apiKey: string,
  baseUrl?: string
): Promise<ValidationResult> {
  try {
    const normalizedProviderId = providerId === "z-ai" ? "glm" : providerId

    // First validate format
    const formatValidation = validateApiKeyFormat(normalizedProviderId, apiKey)
    if (!formatValidation.isValid) {
      return formatValidation
    }

    // Z.AI (GLM): use documented chat endpoint for validation.
    // Docs: https://docs.z.ai/guides/develop/http/introduction
    if (normalizedProviderId === "glm") {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const effectiveBaseUrl = normalizeBaseUrl(baseUrl || "https://api.z.ai/api/paas/v4")
      const endpoint = `${effectiveBaseUrl}/chat/completions`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          // Recommended in Z.AI docs examples; also helps some gateways classify traffic.
          "Accept-Language": "en-US,en",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1,
          stream: false,
        }),
      })

      clearTimeout(timeoutId)

      if (response.status === 401) {
        return { isValid: false, error: "Invalid API key" }
      }
      if (response.status === 403) {
        return { isValid: false, error: "API key does not have required permissions" }
      }
      if (response.status === 429) {
        const text = await response.text().catch(() => "")
        const requestId = response.headers.get("x-request-id") || response.headers.get("cf-ray") || undefined

        // Z.AI uses HTTP 429 for some account/quota states (e.g. insufficient balance)
        // Example: {"error":{"code":"1113","message":"Insufficient balance or no resource package. Please recharge."}}
        try {
          const parsed = JSON.parse(text)
          const code = parsed?.error?.code
          const message = parsed?.error?.message
          if (code === "1113") {
            // Key is valid, but account has no credits.
            return { isValid: true, provider: normalizedProviderId, model: "glm-4-flash" }
          }
          if (message) {
            return {
              isValid: false,
              error: `Z.AI (GLM) API returned 429: ${message}${code ? ` (code ${code})` : ""}${requestId ? ` [request-id: ${requestId}]` : ""}`,
            }
          }
        } catch {
          // ignore JSON parse errors
        }

        return {
          isValid: false,
          error: `Rate limit exceeded (HTTP 429) from ${endpoint}${requestId ? ` [request-id: ${requestId}]` : ""}${text ? `: ${text.slice(0, 200)}` : ""}`,
        }
      }
      if (response.status >= 500) {
        return { isValid: false, error: "Provider server error. Please try again later." }
      }

      if (response.ok) {
        return { isValid: true, provider: normalizedProviderId, model: "glm-4-flash" }
      }

      const errorText = await response.text().catch(() => "Unknown error")
      return {
        isValid: false,
        error: `API returned ${response.status}: ${errorText.slice(0, 100)}`,
      }
    }

    // Provider-specific API endpoints
    const endpoints = {
      openai: "https://api.openai.com/v1/models",
      anthropic: "https://api.anthropic.com/v1/messages",
      google: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      groq: "https://api.groq.com/openai/v1/models",
      mistral: "https://api.mistral.ai/v1/models",
      cohere: "https://api.cohere.ai/v1/models",
      xai: "https://api.x.ai/v1/models",
      together: "https://api.together.xyz/v1/models",
      perplexity: "https://api.perplexity.ai/models",
      deepseek: "https://api.deepseek.com/v1/models",
      openrouter: "https://openrouter.ai/api/v1/models",
      ollama: baseUrl ? `${baseUrl}/api/tags` : "http://localhost:11434/api/tags"
    }

    const endpoint = endpoints[normalizedProviderId as keyof typeof endpoints] || baseUrl

    if (!endpoint) {
      return { isValid: false, error: "No endpoint configured for provider" }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }

    // Add authorization based on provider
    if (normalizedProviderId === "anthropic") {
      headers["x-api-key"] = apiKey
      headers["anthropic-version"] = "2023-06-01"
    } else if (normalizedProviderId === "google") {
      // Google uses query parameter for auth, already included in endpoint
    } else if (normalizedProviderId !== "ollama") {
      headers["Authorization"] = `Bearer ${apiKey}`
    }

    // Make test request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(endpoint, {
      method: normalizedProviderId === "anthropic" ? "POST" : "GET",
      headers,
      signal: controller.signal,
      body: normalizedProviderId === "anthropic" ? JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }]
      }) : undefined
    })

    clearTimeout(timeoutId)

    if (response.status === 401) {
      return { isValid: false, error: "Invalid API key" }
    }

    if (response.status === 403) {
      return { isValid: false, error: "API key does not have required permissions" }
    }

    if (response.status === 429) {
      const text = await response.text().catch(() => "")
      const requestId = response.headers.get("x-request-id") || response.headers.get("cf-ray") || undefined
      return {
        isValid: false,
        error: `Rate limit exceeded (HTTP 429)${requestId ? ` [request-id: ${requestId}]` : ""}${text ? `: ${text.slice(0, 200)}` : ""}`,
      }
    }

    if (response.status >= 500) {
      return { isValid: false, error: "Provider server error. Please try again later." }
    }

    if (response.ok) {
      // Try to extract model info for some providers
      let model: string | undefined
      try {
        const data = await response.json()
        if (normalizedProviderId === "openai" && data.data?.[0]?.id) {
          model = data.data[0].id
        } else if (normalizedProviderId === "anthropic" && data.model) {
          model = data.model
        }
      } catch {
        // Ignore response parsing errors
      }

      return {
        isValid: true,
        provider: normalizedProviderId,
        model
      }
    }

    // Handle other error codes
    const errorText = await response.text().catch(() => "Unknown error")
    return {
      isValid: false,
      error: `API returned ${response.status}: ${errorText.slice(0, 100)}`
    }

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { isValid: false, error: "Request timed out. Please check your connection." }
      }
      if (error.message.includes("fetch")) {
        return { isValid: false, error: "Network error. Please check your internet connection." }
      }
      return { isValid: false, error: error.message }
    }
    return { isValid: false, error: "Unknown error occurred" }
  }
}

/**
 * Get example API key format for each provider
 */
export function getApiKeyExample(providerId: string): string {
  const examples = {
    openai: "sk-proj-abcd...",
    anthropic: "sk-ant-api03-...",
    google: "AIzaSy...",
    groq: "gsk_...",
    mistral: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    cohere: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    xai: "xai-...",
    together: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    perplexity: "pplx-...",
    deepseek: "sk-...",
    glm: "YOUR_API_KEY",
    "z-ai": "YOUR_API_KEY",
    openrouter: "sk-or-v1-...",
    ollama: "No key required for local Ollama"
  }

  return examples[providerId as keyof typeof examples] || "Enter your API key"
}