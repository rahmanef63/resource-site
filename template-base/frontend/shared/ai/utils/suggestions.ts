/**
 * AI Suggestion Generator
 * Generates contextual follow-up suggestions using AI
 */

export interface GenerateSuggestionsOptions {
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
  conversationContext?: string[]
}

/**
 * Generate AI-powered follow-up suggestions based on conversation context
 */
export async function generateAISuggestions(
  lastMessage: string,
  options: GenerateSuggestionsOptions
): Promise<string[]> {
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that generates 3 short follow-up question suggestions (5-8 words each) based on the conversation context. 
The suggestions should be natural, helpful, and encourage deeper exploration of the topic.
Return ONLY a JSON array of 3 strings, nothing else. Example: ["Question 1", "Question 2", "Question 3"]`
          },
          ...(options.conversationContext || []).map(msg => ({
            role: "user" as const,
            content: msg
          })),
          {
            role: "user",
            content: `Based on this response: "${lastMessage.slice(0, 500)}", generate 3 follow-up question suggestions.`
          }
        ],
        provider: options.provider,
        model: options.model,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        temperature: 0.7,
        maxTokens: 100,
      }),
    })

    if (!response.ok) {
      console.error("Failed to generate suggestions:", response.statusText)
      return getFallbackSuggestions(lastMessage)
    }

    const data = await response.json()
    const content = data.content?.trim()
    
    if (!content) {
      return getFallbackSuggestions(lastMessage)
    }

    // Try to parse JSON array from response
    try {
      // Extract JSON array if wrapped in markdown code blocks
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0])
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return suggestions.slice(0, 3).filter((s: any) => typeof s === 'string' && s.length > 0)
        }
      }
    } catch (parseError) {
      console.error("Failed to parse AI suggestions:", parseError)
    }

    // Fallback to extracting lines if JSON parsing fails
    const lines = content.split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.startsWith('[') && !line.startsWith(']'))
      .map((line: string) => line.replace(/^["'\-*]\s*/, '').replace(/["']$/, ''))
      .filter((line: string) => line.length > 5 && line.length < 100)
    
    if (lines.length >= 3) {
      return lines.slice(0, 3)
    }

    return getFallbackSuggestions(lastMessage)
  } catch (error) {
    console.error("Error generating AI suggestions:", error)
    return getFallbackSuggestions(lastMessage)
  }
}

/**
 * Get context-aware fallback suggestions
 */
function getFallbackSuggestions(content: string): string[] {
  const lowerContent = content.toLowerCase()
  const suggestions: string[] = []

  // Context-aware suggestions
  if (lowerContent.includes("code") || lowerContent.includes("function") || lowerContent.includes("const ")) {
    suggestions.push("Can you explain this code?")
    suggestions.push("How can I optimize this?")
    suggestions.push("What are potential edge cases?")
  } else if (lowerContent.includes("error") || lowerContent.includes("bug") || lowerContent.includes("issue")) {
    suggestions.push("How do I debug this?")
    suggestions.push("What's causing this error?")
    suggestions.push("Show me a working example")
  } else if (lowerContent.includes("react") || lowerContent.includes("component") || lowerContent.includes("jsx")) {
    suggestions.push("How do I test this component?")
    suggestions.push("Can you add TypeScript types?")
    suggestions.push("What about performance?")
  } else if (lowerContent.includes("database") || lowerContent.includes("query") || lowerContent.includes("sql")) {
    suggestions.push("How do I optimize this query?")
    suggestions.push("What about data security?")
    suggestions.push("Show me the schema design")
  } else if (lowerContent.includes("api") || lowerContent.includes("endpoint") || lowerContent.includes("fetch")) {
    suggestions.push("How do I handle errors?")
    suggestions.push("What about rate limiting?")
    suggestions.push("Can you add authentication?")
  } else {
    // Generic suggestions
    suggestions.push("Tell me more about this")
    suggestions.push("Can you give an example?")
    suggestions.push("What are the alternatives?")
  }

  return suggestions.slice(0, 3)
}
