/**
 * Shared Rich Text Components
 * 
 * Provides unified rich text rendering and editing capabilities
 * for use across all features (Chat, AI, Documents, etc.)
 * 
 * @module shared/ui/components/rich-text
 * 
 * @example
 * // Basic markdown rendering in chat bubble
 * <RichTextRenderer content={message.text} variant="markdown" />
 * 
 * @example
 * // HTML rendering from Tiptap editor
 * <RichTextRenderer content={htmlContent} variant="html" />
 * 
 * @example
 * // Inline editing with Tiptap
 * <RichTextEditor value={content} onChange={setContent} />
 */

"use client"

import React, { useMemo, memo } from "react"
import DOMPurify from "isomorphic-dompurify"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export type RichTextVariant = "plain" | "markdown" | "html"

export interface RichTextRendererProps {
  /** The content to render */
  content: string
  /** How to interpret the content */
  variant?: RichTextVariant
  /** Additional className */
  className?: string
  /** Whether to render inline (no block elements) */
  inline?: boolean
  /** Maximum lines before truncation (0 = no limit) */
  maxLines?: number
  /** Custom link click handler */
  onLinkClick?: (url: string) => void
}

// ============================================================================
// Markdown Parser (Simple, no dependencies)
// ============================================================================

interface ParsedToken {
  type: "text" | "bold" | "italic" | "code" | "link" | "codeblock" | "linebreak"
  content: string
  url?: string
  children?: ParsedToken[]
}

function parseMarkdown(text: string): ParsedToken[] {
  if (!text) return []
  
  const tokens: ParsedToken[] = []
  let remaining = text
  
  // Process text character by character
  while (remaining.length > 0) {
    // Check for code blocks first (```)
    const codeBlockMatch = remaining.match(/^```(\w*)\n?([\s\S]*?)```/)
    if (codeBlockMatch) {
      tokens.push({
        type: "codeblock",
        content: codeBlockMatch[2],
      })
      remaining = remaining.slice(codeBlockMatch[0].length)
      continue
    }
    
    // Check for inline code (`)
    const inlineCodeMatch = remaining.match(/^`([^`]+)`/)
    if (inlineCodeMatch) {
      tokens.push({
        type: "code",
        content: inlineCodeMatch[1],
      })
      remaining = remaining.slice(inlineCodeMatch[0].length)
      continue
    }
    
    // Check for bold (**text** or __text__)
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/)
    if (boldMatch) {
      tokens.push({
        type: "bold",
        content: boldMatch[2],
        children: parseMarkdown(boldMatch[2]),
      })
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }
    
    // Check for italic (*text* or _text_)
    const italicMatch = remaining.match(/^(\*|_)([^\*_]+)\1/)
    if (italicMatch) {
      tokens.push({
        type: "italic",
        content: italicMatch[2],
        children: parseMarkdown(italicMatch[2]),
      })
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }
    
    // Check for links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      tokens.push({
        type: "link",
        content: linkMatch[1],
        url: linkMatch[2],
      })
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }
    
    // Check for linebreaks
    if (remaining.startsWith("\n")) {
      tokens.push({
        type: "linebreak",
        content: "",
      })
      remaining = remaining.slice(1)
      continue
    }
    
    // Regular text - consume until we hit a special character
    const textMatch = remaining.match(/^[^`*_\[\n]+/)
    if (textMatch) {
      tokens.push({
        type: "text",
        content: textMatch[0],
      })
      remaining = remaining.slice(textMatch[0].length)
      continue
    }
    
    // If nothing matched, consume one character as text
    tokens.push({
      type: "text",
      content: remaining[0],
    })
    remaining = remaining.slice(1)
  }
  
  return tokens
}

// ============================================================================
// Token Renderer
// ============================================================================

interface TokenRendererProps {
  tokens: ParsedToken[]
  onLinkClick?: (url: string) => void
}

const TokenRenderer = memo(function TokenRenderer({ 
  tokens, 
  onLinkClick 
}: TokenRendererProps) {
  return (
    <>
      {tokens.map((token, index) => {
        const key = `${token.type}-${index}`
        
        switch (token.type) {
          case "text":
            return <span key={key}>{token.content}</span>
          
          case "bold":
            return (
              <strong key={key} className="font-semibold">
                {token.children ? (
                  <TokenRenderer tokens={token.children} onLinkClick={onLinkClick} />
                ) : (
                  token.content
                )}
              </strong>
            )
          
          case "italic":
            return (
              <em key={key} className="italic">
                {token.children ? (
                  <TokenRenderer tokens={token.children} onLinkClick={onLinkClick} />
                ) : (
                  token.content
                )}
              </em>
            )
          
          case "code":
            return (
              <code 
                key={key} 
                className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[0.9em]"
              >
                {token.content}
              </code>
            )
          
          case "codeblock":
            return (
              <pre 
                key={key} 
                className="p-3 my-2 rounded-lg bg-muted overflow-x-auto"
              >
                <code className="font-mono text-sm">{token.content}</code>
              </pre>
            )
          
          case "link":
            return (
              <a
                key={key}
                href={token.url}
                onClick={(e) => {
                  if (onLinkClick) {
                    e.preventDefault()
                    onLinkClick(token.url!)
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {token.content}
              </a>
            )
          
          case "linebreak":
            return <br key={key} />
          
          default:
            return null
        }
      })}
    </>
  )
})

// ============================================================================
// HTML Renderer (safe, sanitized)
// ============================================================================

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
  "code", "pre", "blockquote",
  "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "span", "div"
]

const ALLOWED_ATTR = [
  "href", "target", "rel", "class", "id",
  "src", "alt", "width", "height",
  "colspan", "rowspan",
  "style",
]

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "textarea"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  })
}

// ============================================================================
// Main Component
// ============================================================================

export const RichTextRenderer = memo(function RichTextRenderer({
  content,
  variant = "markdown",
  className,
  inline = false,
  maxLines = 0,
  onLinkClick,
}: RichTextRendererProps) {
  // Parse content based on variant
  const renderedContent = useMemo(() => {
    if (!content) return null
    
    switch (variant) {
      case "plain":
        return <span className="whitespace-pre-wrap">{content}</span>
      
      case "markdown":
        const tokens = parseMarkdown(content)
        return <TokenRenderer tokens={tokens} onLinkClick={onLinkClick} />
      
      case "html":
        return (
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} 
          />
        )
      
      default:
        return <span>{content}</span>
    }
  }, [content, variant, onLinkClick])
  
  const containerClasses = cn(
    "text-sm break-words",
    inline && "inline",
    maxLines > 0 && `line-clamp-${maxLines}`,
    className
  )
  
  if (inline) {
    return <span className={containerClasses}>{renderedContent}</span>
  }
  
  return <div className={containerClasses}>{renderedContent}</div>
})

// ============================================================================
// Exports
// ============================================================================

export default RichTextRenderer
