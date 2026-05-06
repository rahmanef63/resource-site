"use client"

/**
 * StudioAIGenerateDialog
 *
 * Floating dialog accessible from the Studio toolbar.
 * Lets users generate a full UI layout or automation flow from a text prompt
 * without needing to select any node first.
 * Uses useStudioAI → /api/ai/chat → studioCanvasBridge.importSchema
 *
 * System prompt is derived from the normative schema contract in:
 *   frontend/slices/studio/ui/types/StudioUISchema.ts
 * See also: docs/ui/ai-generation-guide.md §D
 */

import { useState } from "react"
import { Sparkles, Loader2, Wand2, AlertTriangle } from "lucide-react"
import { validateLayoutRichness } from "@/frontend/slices/studio/lib/validateLayoutRichness"
import { Button } from "@/components/ui/button"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useStudioAI } from "@/frontend/slices/studio/hooks/useStudioAI"
import { studioCanvasBridge } from "@/frontend/slices/studio/canvas/studioCanvasBridge"
import { validateStudioUISchema, resolveAliasProps, applyLayoutDefaults } from "@/frontend/slices/studio/ui/utils/validateStudioSchema"
import { StudioAIModelPicker } from "./StudioAIModelPicker"

/**
 * Formal system prompt for the Studio UI generator.
 *
 * Source of truth for widget types and rules:
 *   frontend/slices/studio/ui/types/StudioUISchema.ts → WIDGET_REGISTRY
 *
 * Update this prompt when:
 *   - WIDGET_REGISTRY changes
 *   - Layout defaults change
 *   - New normative rules are added
 */
const SYSTEM_PROMPT = `You are a Studio UI schema generator for SuperSpace.

## Output Contract
Return ONLY valid JSON matching Studio UI Schema v0.5.
No explanation. No markdown fences. No comments. Raw JSON only.

## Document format
{
  "version": "0.5",
  "root": ["<top-level-node-id>"],
  "nodes": {
    "<node-id>": { "type": "<widget-type>", "props": { ... }, "children": ["<child-id>"] }
  },
  "metadata": { "name": "<title>", "createdAt": "${new Date().toISOString()}" }
}

## Node IDs
- kebab-case: lowercase letters, digits, hyphens only
- Start with a letter. 2–64 characters.
- Examples: hero-section, metric-card-1, nav-bar
- Invalid: Hero, hero_section, 1-hero

## Widget types
Elements: div, section, grid, flex, twoColumn, threeColumn, text, image, button, iconButton, link, input, textarea, select, checkbox, radioGroup, switch, label, slider, separator, spacer
Components: accordion, alert, aspectRatio, avatar, badge, breadcrumb, carousel, collapsible, hoverCard, progress, scrollArea, skeleton, tabs, toggleGroup, navGroup
Blocks (show empty state without real data — use sparingly): kanbanBlock, tableBlock, calendarBlock, chartBlock, filterBlock, formBlock, listBlock, statsBlock, metricCardBlock

NEVER emit: row, column, container, heading, divider, toggle (use toggleGroup instead), alertDialog, dialog, drawer, dropdownMenu, formGroup, inputGroup, popover, sheet, tooltip, buttonGroup, navItem, sidebarNav, heroComposite, navbarBlock, pricingCardBlock, testimonialBlock, footerBlock, activityBlock, eventsBlock, profileBlock, agentBlock, teamBlock, timeRangeBlock, fileBlock, commentBlock, richTextBlock, mediaBlock, hero

## Widget prop structures (critical)
- toggleGroup: props.options = [{value:"left",label:"Left"},{value:"center",label:"Center"}] — NOT child toggle nodes
- select: props.options = "Option 1,Option 2,Option 3" — comma-separated string
- tabs: props.tabs = "Tab 1,Tab 2,Tab 3" — comma-separated string
- carousel: props.items = "Slide 1,Slide 2" — comma-separated string
- breadcrumb: props.items = "Home,Products,Item" — comma-separated string

## Block prop structures (CRITICAL — AI always guesses these wrong)
- metricCardBlock: { title: string, value: string, description?: string, trend?: { value: number, direction: "up"|"down"|"neutral" } }
  NEVER: change prop, trend:"up" as string, label prop (use title)
  CORRECT: { title: "Revenue", value: "$45,231", description: "vs last month", trend: { value: 12.5, direction: "up" } }
- chartBlock: { title: string, chartType: "bar"|"line"|"area"|"pie", height: "320px", showLegend: boolean, showGrid: boolean }
  NEVER: type prop instead of chartType
- statsBlock: { title: string }
- tableBlock: { title: string, columns: string[] }
- formBlock: { title: string, fields: string[] }
- listBlock: { title: string, maxItems?: number }
- kanbanBlock: { title: string, columns?: string[] }

## Visual design rules (for attractive, professional UI)
- text/heading color: use color prop — NEVER backgroundColor on text nodes
  WRONG: { type: "text", props: { backgroundColor: "#111827" } }
  CORRECT: { type: "text", props: { color: "#111827" } }
- Page wrapper: className="min-h-screen bg-gray-50" on outermost section/div
- Main container: className="max-w-7xl mx-auto px-6 py-8"
- Card/panel: className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
- Section heading: fontSize:"1.5rem", fontWeight:"700", color:"#111827"
- Subheading / card title: fontSize:"1rem", fontWeight:"600", color:"#374151"
- Body / label text: fontSize:"0.875rem", color:"#6B7280"
- Primary button: className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
- Secondary button: className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium"
- Spacing: gap:"1.5rem" between major sections, gap:"1rem" between cards, gap:"0.5rem" for inline rows
- Always add borderRadius:"0.75rem" to cards and panels when using inline style props
- For page backgrounds use className not backgroundColor: className="bg-gray-50" or className="bg-white"

## Layout rules — CRITICAL
1. NEVER use display:"block" on layout containers. It causes layout collapse.
2. All div, section, flex nodes MUST have display explicitly set in props OR flex/grid in className.
3. Default for main containers: display:"flex", flexDirection:"column", gap:"1rem"
4. Default for action rows (button groups): display:"flex", flexDirection:"row", flexWrap:"wrap", gap:"0.5rem"
5. Default for card/block collections: use grid widget with columns and gap — NOT flex
6. gap, width, maxWidth, padding, margin MUST include a CSS unit (rem, px, %) or be "0" or "auto"
   - INVALID: "gap":"4", "gap":"md"
   - VALID: "gap":"1rem", "gap":"16px"
7. Block widgets (kanbanBlock, tableBlock, etc.) show EMPTY STATE without real database data.
   For static/mockup layouts, prefer text + div containers to represent content visually.

## Prop names — canonical only
- flexDirection (NOT direction)
- alignItems (NOT align)
- justifyContent (NOT justify)
- flexWrap (NOT wrap)
- backgroundColor (NOT background, NOT bg)

## Placeholder rules
- Placeholders must be contextual and descriptive
- NEVER emit: "Enter here", "Type something", "Input", "Placeholder"
- Use context-specific text, e.g.: "Masukkan nama agent", "nama@perusahaan.com"

## Graph rules
- root[] lists ALL top-level node IDs (nodes with no parent)
- Every ID in root must exist in nodes
- Every ID in children must exist in nodes
- children: [] for leaf nodes (button, text, input, image, all Block types)
- No cycles. No orphan nodes.
- Each node ID appears in AT MOST ONE parent's children array

## Responsive design
- Use className with Tailwind for responsive: "sm:grid-cols-2 lg:grid-cols-3"
- Add max-width to page containers: "max-w-6xl mx-auto"
- Use flexWrap:"wrap" on action rows

## Content payload rules — EVERY content node MUST be filled
These are the most common AI generation failures. Nodes without content render empty.

### text / heading nodes
- REQUIRED: content prop — ALWAYS set a meaningful text value
  WRONG: { "type": "text", "props": { "fontSize": "1rem" } }
  CORRECT: { "type": "text", "props": { "content": "Home", "fontSize": "1rem" } }

### button nodes
- REQUIRED: text prop — ALWAYS set button label
  WRONG: { "type": "button", "props": { "className": "..." } }
  CORRECT: { "type": "button", "props": { "text": "Post", "variant": "default" } }

### iconButton nodes
- iconButton renders EMPTY without an icon — ALWAYS set icon from this list:
  home, search, bell, mail, user, settings, heart, repeat2, message-circle,
  share, upload, camera, image, smile, bar-chart-2, hashtag, compass, more-horizontal
  CORRECT: { "type": "iconButton", "props": { "icon": "heart", "className": "..." } }
  WRONG: { "type": "iconButton", "props": { "className": "text-gray-500 p-2 rounded-full" } }

### image nodes
- REQUIRED: src (use picsum or unsplash), alt

### avatar nodes
- REQUIRED: fallback OR src
  fallback="JD" (initials) or src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1"

### input / textarea nodes
- REQUIRED: placeholder — use context-aware text, never "Enter here"

### tabs nodes
- REQUIRED: tabs="Tab 1,Tab 2" — comma-separated string

## Do NOT
- Use props not defined for the widget type
- Use alias prop names (direction, align, justify, wrap, background)
- Nest smart blocks inside each other
- Emit version "0.4" — always use "0.5"
- Wrap output in markdown code fences
- Generate ANY text, button, or iconButton node without its content prop filled`

function detectArchetype(
  prompt: string,
): "streaming" | "kanban" | "landing" | "social" | "commerce" | "portfolio" | "dashboard" {
  const p = prompt.toLowerCase()
  if (/netflix|streaming|video|movie|film|tv show|series|watch/i.test(p)) return "streaming"
  if (/kanban|board|sprint|task board|project board/i.test(p)) return "kanban"
  if (/landing|hero section|marketing page|launch page/i.test(p)) return "landing"
  if (/social|feed|timeline|post|tweet|follow/i.test(p)) return "social"
  if (/shop|store|product|cart|checkout|e-commerce|marketplace/i.test(p)) return "commerce"
  if (/portfolio|personal site|my work|resume page/i.test(p)) return "portfolio"
  return "dashboard"
}

const ARCHETYPE_GUIDANCE: Record<string, string> = {
  streaming: `
## ARCHETYPE: STREAMING / MEDIA PLATFORM
This is a rich, immersive media interface. MANDATORY rules:
- Root MUST use className="bg-black text-white min-h-screen"
- All text nodes MUST have color:"#ffffff" or color:"#d1d5db"
- HERO SECTION is required: position:relative, minHeight:70vh, with:
  (a) background image node with position:absolute, inset:0, objectFit:cover
  (b) gradient overlay div with position:absolute and bg-gradient-to-r from-black/90
  (c) content div with position:relative, zIndex:10, padding, title/meta/buttons
- MINIMUM 2 content rows each with a horizontal-scroll card list (div flex gap-3 overflowX:auto)
  Each card MUST have an image + text elements (NOT metricCardBlock or chartBlock)
- MINIMUM 40 NODES TOTAL
- NEVER use smartBlocks (metricCardBlock, chartBlock, etc.) — use primitive composition`,

  kanban: `
## ARCHETYPE: KANBAN / TASK BOARD
IMPORTANT: Always use kanbanBlock — NEVER build a board from manual div/text nodes.

### Default output structure
- Root: min-h-screen bg-gray-50 flex flex-col
- Header: bg-white border-b, title text + meta text + filter + add-task buttons (all filled)
- Content: padding wrapper containing ONE kanbanBlock node

### kanbanBlock is the ONLY correct way to render kanban
CORRECT:
{
  "type": "kanbanBlock",
  "props": {
    "title": "Project Board",
    "columns": [
      {
        "id": "todo", "title": "To Do",
        "items": [
          { "id": "t1", "title": "Design onboarding", "priority": "high", "tags": ["design"], "assignee": { "fallback": "AK" }, "dueDate": "Apr 8" },
          { "id": "t2", "title": "Write docs", "priority": "medium" }
        ]
      },
      {
        "id": "in-progress", "title": "In Progress",
        "items": [
          { "id": "t3", "title": "Auth middleware", "priority": "high", "assignee": { "fallback": "RA" }, "dueDate": "Apr 7" }
        ]
      },
      { "id": "done", "title": "Done", "items": [{ "id": "t4", "title": "CI/CD setup", "priority": "low", "dueDate": "✓ Apr 3" }] }
    ]
  },
  "children": []
}

NEVER: generate col-1, col-2, task-card-1, task-card-2 divs for kanban — they are NOT draggable

### KanbanItem fields (all optional except id + title)
- id: string (unique, kebab-case)
- title: string (task description)
- priority: "high" | "medium" | "low"
- tags: string[] (optional label tags)
- assignee: { fallback: "XX" } (initials) or { src: "url" }
- dueDate: string (e.g. "Apr 8" or "✓ Apr 3" for done items)

### Columns: include 3–5 columns, each with 2–4 items minimum
- MINIMUM 4 NODES total (header section + kanbanBlock is enough)`,

  landing: `
## ARCHETYPE: LANDING / MARKETING PAGE
Hero-first marketing page. MANDATORY rules:
- Hero: large centred section, gradient background, h1 title (3rem+), subtitle, 2 CTA buttons
- Features section: 3-column responsive grid with icon+title+description cards
- At least 1 social proof section (logos, testimonials, or stats row)
- CTA footer section with contrasting background
- MINIMUM 25 NODES`,

  social: `
## ARCHETYPE: SOCIAL / FEED
Content feed interface. MANDATORY rules:

### Layout structure (required)
- Root: bg-white min-h-screen, flex row (sidebar + center + right)
- Left sidebar (lg:w-64): logo text + nav items + post button
- Center feed (flex-1 max-w-2xl): sticky header + tabs + composer + 3+ post cards
- Right sidebar (xl:w-80): search input + trending section + who-to-follow section
- MINIMUM 40 NODES

### Content filling — ALL nodes MUST have content (critical)
- Logo text node: content="YourApp" (platform name)
- Feed title text node: content="Home"
- Nav buttons: text="Home", text="Explore", text="Notifications", text="Messages", text="Profile"
- Post/tweet buttons: text="Post" or text="Tweet"
- Composer textarea: placeholder="What is happening?!"
- Post card name: content="Jane Smith"
- Post card handle: content="@janesmith"
- Post card time: content="2h"
- Post card body: content="This is the post content with meaningful text relevant to the app context."
- Trending titles: content="What's happening", content="Trending"
- Trending items: content="#SuperSpace", content="#BuildInPublic"

### iconButton usage (social actions) — MUST include icon prop
- Reply action: { "type": "iconButton", "props": { "icon": "message-circle", "className": "text-gray-500 hover:text-blue-500 p-2 rounded-full" } }
- Repost action: { "type": "iconButton", "props": { "icon": "repeat2", "className": "text-gray-500 hover:text-green-500 p-2 rounded-full" } }
- Like action:   { "type": "iconButton", "props": { "icon": "heart", "className": "text-gray-500 hover:text-red-500 p-2 rounded-full" } }
- Share action:  { "type": "iconButton", "props": { "icon": "upload", "className": "text-gray-500 hover:text-blue-500 p-2 rounded-full" } }
- Media action:  { "type": "iconButton", "props": { "icon": "image", "className": "text-blue-500 p-2 rounded-full" } }
- Emoji action:  { "type": "iconButton", "props": { "icon": "smile", "className": "text-blue-500 p-2 rounded-full" } }

### Post card structure (each card must have all of these)
avatar (src with dicebear seed) + name text (content filled) + handle text (content filled) + time text (content filled) + body text (content filled) + image (optional, picsum URL) + action row (4 iconButtons ALL with icon prop)

### Avatar sources (use these, not empty avatars)
- { "type": "avatar", "props": { "src": "https://api.dicebear.com/7.x/avataaars/svg?seed=user1", "className": "w-10 h-10 rounded-full" } }
- Seeds: user1, user2, user3, user4, alice, bob, carol`,

  commerce: `
## ARCHETYPE: E-COMMERCE / MARKETPLACE
Product browsing interface. MANDATORY rules:
- Top nav with search input + cart button
- Filter sidebar or top filter row
- Product grid: responsive grid (sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- Each product card: image (tall, object-cover) + title + price + button
- MINIMUM 30 NODES`,

  portfolio: `
## ARCHETYPE: PORTFOLIO / PERSONAL
Personal showcase. MANDATORY rules:
- Hero with avatar/photo, name, role, tagline, contact buttons
- Work/project section: responsive grid of project cards (image + title + desc + tags)
- Skills or experience section
- Contact section at bottom
- MINIMUM 20 NODES`,

  dashboard: `
## ARCHETYPE: ANALYTICS DASHBOARD
SaaS data interface. Standard rules apply:
- Header with title + action buttons
- Metrics row: 3–4 metricCardBlock in responsive grid (sm:grid-cols-2 lg:grid-cols-4)
- At least 1 chartBlock (area or bar)
- Table or list section
- MINIMUM 14 NODES`,
}

function getArchetypeGuidance(archetype: string): string {
  return ARCHETYPE_GUIDANCE[archetype] ?? ARCHETYPE_GUIDANCE.dashboard
}

const EXAMPLES = [
  "Dashboard with 4 metric cards (Revenue, Users, Orders, Growth) and a revenue chart",
  "Login form with email, password fields, and sign in button",
  "Project kanban board with header, filters, and status columns",
  "Landing page hero with heading, subtitle, and two CTA buttons",
  "Settings page with sidebar navigation and form panel",
]

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  onUndo?: () => void
}

export function StudioAIGenerateDialog({ open, onOpenChange, onUndo }: Props) {
  const [prompt, setPrompt] = useState("")
  const { generate, isLoading, error, resolvedConfig } = useStudioAI()
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  const shortcutHint = isMac ? "⌘↵ to generate" : "Ctrl+Enter to generate"

  const extractJSON = (raw: string): { json: string; truncated: boolean } | null => {
    // Strip markdown fences (all case variants, with or without language tag)
    let s = raw.replace(/^```(?:json)?\s*/im, "").replace(/```\s*$/im, "").trim()

    // Find the first opening brace
    const start = s.indexOf("{")
    if (start === -1) return null

    // Walk forward tracking brace depth to find the matching closing brace
    let depth = 0
    for (let i = start; i < s.length; i++) {
      if (s[i] === "{") depth++
      else if (s[i] === "}") {
        depth--
        if (depth === 0) return { json: s.slice(start, i + 1), truncated: false }
      }
    }

    // Reached end without closing — JSON was truncated (maxTokens hit)
    return { json: "", truncated: true }
  }

  const parseAndValidate = (raw: string): Record<string, unknown> | null => {
    try {
      const extracted = extractJSON(raw)
      if (!extracted) {
        toast.error("Invalid JSON from AI", {
          description: "The model returned no JSON object. Try rephrasing your prompt.",
        })
        return null
      }
      if (extracted.truncated) {
        toast.error("AI response was cut off", {
          description: "The layout was too large to generate in one pass. Try a simpler prompt or reduce the scope.",
        })
        return null
      }
      const schema = JSON.parse(extracted.json)
      const validation = validateStudioUISchema(schema, { validateProps: true, lintLayout: true, checkOrphans: true })
      if (!validation.valid) {
        const errorMessages = validation.issues
          .filter(i => i.severity === "error")
          .slice(0, 3)
          .map(i => `[${i.scope}] ${i.message}`)
          .join("\n")
        toast.error("Generated JSON failed validation", {
          description: `${validation.counts.errors} error(s). First: ${errorMessages}`,
        })
        return null
      }
      for (const [id, node] of Object.entries(schema.nodes) as [string, any][]) {
        schema.nodes[id] = {
          ...node,
          props: applyLayoutDefaults(node.type, resolveAliasProps(node.props ?? {})),
        }
      }
      return schema
    } catch {
      toast.error("Invalid JSON from AI", {
        description: "The model returned malformed JSON. Try rephrasing your prompt.",
      })
      return null
    }
  }

  const importToCanvas = async (schema: Record<string, unknown>) => {
    const result = await studioCanvasBridge.importSchema(schema)
    if (result.success) {
      toast.success("Layout generated!", {
        description: "Canvas updated with AI-generated layout.",
        action: onUndo ? { label: "Undo", onClick: onUndo } : undefined,
      })
      onOpenChange(false)
      setPrompt("")
    } else {
      toast.error("Import failed", { description: result.error })
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    const archetype = detectArchetype(prompt)
    const isRich = ["streaming", "kanban", "landing", "social", "commerce"].includes(archetype)
    const systemPrompt = SYSTEM_PROMPT + "\n" + getArchetypeGuidance(archetype)
    const maxTokens = isRich ? 8192 : 4096

    const json = await generate({
      prompt: `Generate a Studio JSON layout for: ${prompt}`,
      systemPrompt,
      maxTokens,
    })

    if (!json) {
      toast.error("Generation failed", { description: "Check Studio Settings → AI Builder for configuration." })
      return
    }

    const schema = parseAndValidate(json)
    if (!schema) return

    // Richness gate — auto-retry once if layout is too sparse
    const richness = validateLayoutRichness(schema, archetype)
    if (!richness.pass) {
      const retryPrompt = `${prompt}\n\nIMPORTANT: Your previous response only had ${richness.nodeCount} nodes — too sparse for this layout type.\n${richness.suggestion}\nGenerate the full, rich layout now.`
      const retryJson = await generate({
        prompt: `Generate a Studio JSON layout for: ${retryPrompt}`,
        systemPrompt,
        maxTokens,
      })
      if (retryJson) {
        const retrySchema = parseAndValidate(retryJson)
        if (retrySchema) {
          await importToCanvas(retrySchema)
          return
        }
      }
      // Retry failed or produced invalid JSON — import original rather than nothing
    }

    await importToCanvas(schema)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Generate UI with AI
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Describe what you want to build. AI will generate a complete layout and load it on the canvas.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium">Model</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {resolvedConfig.provider}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {resolvedConfig.model}
                  </span>
                </div>
              </div>
              <div className="w-[220px] max-w-full">
                <StudioAIModelPicker />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Uses shared AI feature settings from <span className="font-mono">/dashboard/ai</span>. Studio only adds the schema prompt and canvas import flow.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">What do you want to build?</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A dashboard with metric cards and a sales chart"
              rows={3}
              className="text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate()
              }}
            />
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Examples:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-[11px] px-2 py-1 rounded-md bg-muted hover:bg-accent border border-border transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30 px-3 py-2 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-400">
              This will <strong>replace your current canvas content</strong>. Make sure to export or save a template first if needed.
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Layout
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            {shortcutHint}
          </p>
        </div>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  )
}
