/**
 * Rich Text Renderer Component
 * 
 * Renders rich text content with support for:
 * - Markdown-like formatting (bold, italic, code, etc.)
 * - Code blocks with syntax highlighting
 * - Mentions (@user, #channel)
 * - Links with previews
 * - Emoji rendering
 * - Lists and blockquotes
 * 
 * @module shared/communications/components
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

// =============================================================================
// Types
// =============================================================================

export type RichTextBlockType = 
  | "paragraph"
  | "heading"
  | "code_block"
  | "code_inline"
  | "blockquote"
  | "list"
  | "list_item"
  | "mention"
  | "link"
  | "image"
  | "divider"
  | "bold"
  | "italic"
  | "strikethrough"

export interface RichTextBlock {
  type: RichTextBlockType
  content?: string
  children?: RichTextBlock[]
  // For code blocks
  language?: string
  // For headings
  level?: 1 | 2 | 3 | 4 | 5 | 6
  // For lists
  ordered?: boolean
  // For mentions
  mentionType?: "user" | "channel" | "everyone"
  mentionId?: string
  // For links
  href?: string
  // For images
  src?: string
  alt?: string
}

export interface RichTextRendererProps {
  /** Raw content string or structured blocks */
  content: string | RichTextBlock[]
  /** Enable code highlighting */
  enableCodeHighlight?: boolean
  /** Enable link previews */
  enableLinkPreview?: boolean
  /** On mention click */
  onMentionClick?: (type: string, id: string) => void
  /** Custom class */
  className?: string
}

// =============================================================================
// Parser - Converts markdown-like text to blocks
// =============================================================================

function parseTextToBlocks(text: string): RichTextBlock[] {
  const blocks: RichTextBlock[] = []
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block (```)
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || 'text'
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push({
        type: 'code_block',
        content: codeLines.join('\n'),
        language,
      })
      i++
      continue
    }

    // Blockquote (>)
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      blocks.push({
        type: 'blockquote',
        content: quoteLines.join('\n'),
      })
      continue
    }

    // Headings (#)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        content: headingMatch[2],
      })
      i++
      continue
    }

    // Divider (---)
    if (line.match(/^[-]{3,}$/)) {
      blocks.push({ type: 'divider' })
      i++
      continue
    }

    // Unordered list (- or *)
    if (line.match(/^[-*]\s+/)) {
      const items: RichTextBlock[] = []
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push({
          type: 'list_item',
          content: lines[i].replace(/^[-*]\s+/, ''),
        })
        i++
      }
      blocks.push({
        type: 'list',
        ordered: false,
        children: items,
      })
      continue
    }

    // Ordered list (1. 2. etc)
    if (line.match(/^\d+\.\s+/)) {
      const items: RichTextBlock[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push({
          type: 'list_item',
          content: lines[i].replace(/^\d+\.\s+/, ''),
        })
        i++
      }
      blocks.push({
        type: 'list',
        ordered: true,
        children: items,
      })
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraph
    blocks.push({
      type: 'paragraph',
      content: line,
    })
    i++
  }

  return blocks
}

// =============================================================================
// Inline Parser - Handles inline formatting
// =============================================================================

function parseInlineContent(text: string, onMentionClick?: (type: string, id: string) => void): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold (**text**)
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      elements.push(
        <strong key={key++} className="font-semibold">
          {parseInlineContent(boldMatch[1], onMentionClick)}
        </strong>
      )
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic (*text* or _text_)
    const italicMatch = remaining.match(/^[*_]([^*_]+)[*_]/)
    if (italicMatch && !remaining.startsWith('**')) {
      elements.push(
        <em key={key++} className="italic">
          {parseInlineContent(italicMatch[1], onMentionClick)}
        </em>
      )
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Strikethrough (~~text~~)
    const strikeMatch = remaining.match(/^~~(.+?)~~/)
    if (strikeMatch) {
      elements.push(
        <del key={key++} className="line-through text-muted-foreground">
          {parseInlineContent(strikeMatch[1], onMentionClick)}
        </del>
      )
      remaining = remaining.slice(strikeMatch[0].length)
      continue
    }

    // Inline code (`code`)
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      elements.push(
        <code 
          key={key++} 
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-primary"
        >
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // User mention (@username)
    const userMentionMatch = remaining.match(/^@(\w+)/)
    if (userMentionMatch) {
      elements.push(
        <button
          key={key++}
          onClick={() => onMentionClick?.('user', userMentionMatch[1])}
          className="inline-flex items-center px-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
        >
          @{userMentionMatch[1]}
        </button>
      )
      remaining = remaining.slice(userMentionMatch[0].length)
      continue
    }

    // Channel mention (#channel)
    const channelMentionMatch = remaining.match(/^#(\w+)/)
    if (channelMentionMatch) {
      elements.push(
        <button
          key={key++}
          onClick={() => onMentionClick?.('channel', channelMentionMatch[1])}
          className="inline-flex items-center px-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/20 transition-colors"
        >
          #{channelMentionMatch[1]}
        </button>
      )
      remaining = remaining.slice(channelMentionMatch[0].length)
      continue
    }

    // Links [text](url) or auto-link
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      elements.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Auto-link URLs
    const urlMatch = remaining.match(/^(https?:\/\/[^\s]+)/)
    if (urlMatch) {
      elements.push(
        <a
          key={key++}
          href={urlMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {urlMatch[1]}
        </a>
      )
      remaining = remaining.slice(urlMatch[0].length)
      continue
    }

    // Plain text - consume until next special character
    const plainMatch = remaining.match(/^[^*_`@#~[\]h]+/i) || remaining.match(/^./)
    if (plainMatch) {
      elements.push(plainMatch[0])
      remaining = remaining.slice(plainMatch[0].length)
    }
  }

  return elements
}

// =============================================================================
// Code Block Component
// =============================================================================

interface CodeBlockProps {
  code: string
  language: string
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-2 rounded-lg overflow-hidden border bg-zinc-950 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 dark:bg-zinc-800 border-b border-zinc-800">
        <span className="text-xs text-zinc-400 font-mono uppercase">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-zinc-100 leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  )
}

// =============================================================================
// Block Renderer
// =============================================================================

interface BlockRendererProps {
  block: RichTextBlock
  onMentionClick?: (type: string, id: string) => void
}

function BlockRenderer({ block, onMentionClick }: BlockRendererProps) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="leading-relaxed">
          {block.content ? parseInlineContent(block.content, onMentionClick) : null}
        </p>
      )

    case 'heading':
      const HeadingTag = `h${block.level || 2}` as React.ElementType
      const headingClasses: Record<number, string> = {
        1: 'text-2xl font-bold mt-4 mb-2',
        2: 'text-xl font-bold mt-3 mb-2',
        3: 'text-lg font-semibold mt-3 mb-1',
        4: 'text-base font-semibold mt-2 mb-1',
        5: 'text-sm font-semibold mt-2 mb-1',
        6: 'text-sm font-medium mt-2 mb-1 text-muted-foreground',
      }
      return (
        <HeadingTag className={headingClasses[block.level || 2]}>
          {block.content ? parseInlineContent(block.content, onMentionClick) : null}
        </HeadingTag>
      )

    case 'code_block':
      return <CodeBlock code={block.content || ''} language={block.language || 'text'} />

    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-2 italic text-muted-foreground bg-muted/30 rounded-r-lg">
          {block.content ? parseInlineContent(block.content, onMentionClick) : null}
        </blockquote>
      )

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag className={cn(
          "my-2 pl-6 space-y-1",
          block.ordered ? "list-decimal" : "list-disc"
        )}>
          {block.children?.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item.content ? parseInlineContent(item.content, onMentionClick) : null}
            </li>
          ))}
        </ListTag>
      )

    case 'divider':
      return <hr className="my-4 border-border" />

    case 'image':
      if (!block.src) {
        return null
      }
      return (
        <figure className="my-2">
          <Image
            src={block.src}
            alt={block.alt || 'Image'}
            width={800}
            height={600}
            className="max-w-full h-auto rounded-lg border"
            sizes="100vw"
          />
          {block.alt && (
            <figcaption className="text-xs text-muted-foreground mt-1 text-center">
              {block.alt}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}

// =============================================================================
// Main Component
// =============================================================================

export function RichTextRenderer({
  content,
  enableCodeHighlight = true,
  enableLinkPreview = false,
  onMentionClick,
  className,
}: RichTextRendererProps) {
  // Parse content if it's a string
  const blocks = React.useMemo(() => {
    if (typeof content === 'string') {
      return parseTextToBlocks(content)
    }
    return content
  }, [content])

  return (
    <div className={cn("rich-text-content space-y-1", className)}>
      {blocks.map((block, index) => (
        <BlockRenderer 
          key={index} 
          block={block} 
          onMentionClick={onMentionClick}
        />
      ))}
    </div>
  )
}

export default RichTextRenderer
