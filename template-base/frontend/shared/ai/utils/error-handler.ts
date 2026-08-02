/**
 * AI Error Handler
 * Parses and provides user-Contactly error messages for AI API errors
 */

export interface ParsedAIError {
  title: string
  message: string
  action?: string
  actionUrl?: string
  retryDelay?: number
  isRetryable: boolean
  severity: 'error' | 'warning' | 'info'
}

/**
 * Provider-specific error patterns and messages
 */
const ERROR_PATTERNS = {
  // Rate limit / Quota errors
  rateLimitPatterns: [
    /rate.?limit/i,
    /too.?many.?requests/i,
    /quota.?exceeded/i,
    /resource.?exhausted/i,
    /429/,
  ],

  // Authentication errors
  authPatterns: [
    /invalid.?api.?key/i,
    /unauthorized/i,
    /authentication/i,
    /invalid.?credentials/i,
    /401/,
    /403/,
  ],

  // Model errors
  modelPatterns: [
    /model.?not.?found/i,
    /invalid.?model/i,
    /model.?does.?not.?exist/i,
  ],

  // Network errors
  networkPatterns: [
    /network/i,
    /fetch.?failed/i,
    /connection/i,
    /timeout/i,
    /timed.?out/i,
    /econnrefused/i,
    /503/,
    /504/,
  ],

  // Content/Safety errors
  contentPatterns: [
    /content.?policy/i,
    /safety/i,
    /blocked/i,
    /harmful/i,
  ],
}

/**
 * Provider-specific API key URLs
 */
export const PROVIDER_KEY_URLS: Record<string, string> = {
  openai: 'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
  google: 'https://aistudio.google.com/app/apikey',
  groq: 'https://console.groq.com/keys',
  mistral: 'https://console.mistral.ai/api-keys',
  cohere: 'https://dashboard.cohere.com/api-keys',
  perplexity: 'https://www.perplexity.ai/settings/api',
  together: 'https://api.together.xyz/settings/api-keys',
  fireworks: 'https://fireworks.ai/account/api-keys',
  deepseek: 'https://platform.deepseek.com/api_keys',
  xai: 'https://console.x.ai',
  glm: 'https://z.ai/manage-apikey/apikey-list',
  'z-ai': 'https://z.ai/manage-apikey/apikey-list',
  openrouter: 'https://openrouter.ai/keys',
}

/**
 * Provider display names
 */
export const PROVIDER_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  google: 'Google (Gemini)',
  groq: 'Groq',
  mistral: 'Mistral AI',
  cohere: 'Cohere',
  perplexity: 'Perplexity',
  together: 'Together AI',
  fireworks: 'Fireworks AI',
  deepseek: 'DeepSeek',
  xai: 'xAI (Grok)',
  ollama: 'Ollama (Local)',
  glm: 'Z.AI (GLM)',
  'z-ai': 'Z.AI (GLM)',
  openrouter: 'OpenRouter',
}

/**
 * Extract retry delay from error message
 */
function extractRetryDelay(errorMessage: string): number | undefined {
  // Match patterns like "retry in 10s", "retry after 10 seconds", "10.460444404s"
  const patterns = [
    /retry.?(?:in|after)?\s*(\d+(?:\.\d+)?)\s*s(?:econds?)?/i,
    /(\d+(?:\.\d+)?)\s*s(?:econds?)?\s*(?:delay|wait)/i,
    /"retryDelay":\s*"(\d+)s?"/i,
  ]

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern)
    if (match) {
      return Math.ceil(parseFloat(match[1]))
    }
  }

  return undefined
}

/**
 * Check if error matches any pattern in the list
 */
function matchesPatterns(errorMessage: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(errorMessage))
}

/**
 * Parse AI API error and return user-Contactly error info
 */
export function parseAIError(
  error: Error | string,
  provider?: string
): ParsedAIError {
  const errorMessage = typeof error === 'string' ? error : error.message
  const providerName = provider ? (PROVIDER_NAMES[provider] || provider) : 'AI Provider'
  const keyUrl = provider ? PROVIDER_KEY_URLS[provider] : undefined

  // Billing / insufficient balance (some providers return 429 for this)
  if (/insufficient\s+balance|no\s+resource\s+package|please\s+recharge/i.test(errorMessage)) {
    const billingUrl = provider === 'glm' || provider === 'z-ai' ? 'https://z.ai/subscribe' : keyUrl
    return {
      title: 'Insufficient Balance',
      message: `Your ${providerName} account has insufficient balance/credits to process this request. Please recharge or add a resource package.`,
      action: 'Recharge / Billing',
      actionUrl: billingUrl,
      isRetryable: false,
      severity: 'error',
    }
  }

  // Rate limit / Quota exceeded
  if (matchesPatterns(errorMessage, ERROR_PATTERNS.rateLimitPatterns)) {
    const retryDelay = extractRetryDelay(errorMessage)

    return {
      title: 'Rate Limit Exceeded',
      message: `You've exceeded the API rate limit for ${providerName}. ${retryDelay
          ? `Please wait ${retryDelay} seconds before trying again.`
          : 'Please wait a moment before trying again.'
        }`,
      action: 'Check your usage & billing',
      actionUrl: keyUrl,
      retryDelay,
      isRetryable: true,
      severity: 'warning',
    }
  }

  // Authentication errors
  if (matchesPatterns(errorMessage, ERROR_PATTERNS.authPatterns)) {
    return {
      title: 'Authentication Failed',
      message: `Your API key for ${providerName} is invalid or has expired. Please check your API key in Settings.`,
      action: 'Get new API key',
      actionUrl: keyUrl,
      isRetryable: false,
      severity: 'error',
    }
  }

  // Model errors
  if (matchesPatterns(errorMessage, ERROR_PATTERNS.modelPatterns)) {
    return {
      title: 'Model Not Available',
      message: `The selected model is not available for ${providerName}. Please choose a different model in Settings.`,
      action: 'View available models',
      actionUrl: keyUrl,
      isRetryable: false,
      severity: 'error',
    }
  }

  // Network errors
  if (matchesPatterns(errorMessage, ERROR_PATTERNS.networkPatterns)) {
    const isTimeout = /timeout|timed.?out|504/i.test(errorMessage)
    return {
      title: isTimeout ? 'Request Timed Out' : 'Connection Error',
      message: isTimeout
        ? `The request to ${providerName} took too long. The service may be slow or overloaded. Please try again.`
        : `Unable to connect to ${providerName}. Please check your internet connection and try again.`,
      isRetryable: true,
      severity: 'warning',
    }
  }

  // Content/Safety errors
  if (matchesPatterns(errorMessage, ERROR_PATTERNS.contentPatterns)) {
    return {
      title: 'Content Blocked',
      message: 'Your message was blocked due to content policy. Please rephrase your request.',
      isRetryable: false,
      severity: 'warning',
    }
  }

  // Specific provider error parsing
  if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
    const retryDelay = extractRetryDelay(errorMessage)
    return {
      title: 'Quota Exceeded',
      message: `Your ${providerName} quota has been exhausted. ${retryDelay
          ? `Try again in ${retryDelay} seconds, or upgrade your plan.`
          : 'Please upgrade your plan or wait for quota reset.'
        }`,
      action: 'Upgrade plan',
      actionUrl: keyUrl,
      retryDelay,
      isRetryable: true,
      severity: 'warning',
    }
  }

  // API key not configured
  if (errorMessage.includes('No API key configured')) {
    return {
      title: 'API Key Required',
      message: `No API key configured for ${providerName}. Please add your API key in AI Settings.`,
      action: 'Get API key',
      actionUrl: keyUrl,
      isRetryable: false,
      severity: 'error',
    }
  }

  // Unknown provider
  if (errorMessage.includes('Unknown provider')) {
    return {
      title: 'Provider Not Supported',
      message: 'The selected AI provider is not supported. Please choose a different provider.',
      isRetryable: false,
      severity: 'error',
    }
  }

  // Default error
  return {
    title: 'AI Error',
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    isRetryable: true,
    severity: 'error',
  }
}

/**
 * Format error for toast notification
 */
export function formatErrorForToast(parsedError: ParsedAIError): {
  title: string
  description: string
} {
  let description = parsedError.message

  if (parsedError.action && parsedError.actionUrl) {
    description += ` [${parsedError.action}](${parsedError.actionUrl})`
  }

  return {
    title: parsedError.title,
    description,
  }
}
