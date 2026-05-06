import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"
import { studioCanvasBridge } from "@/frontend/slices/studio/canvas/studioCanvasBridge"

// Widget and node type lists (static, safe to import at module level)
const WIDGET_CATEGORIES = [
    "Layout", "Typography", "Media", "Form", "Data", "Navigation", "Blocks", "Charts"
]

const WORKFLOW_NODE_CATEGORIES = [
    "Triggers", "Actions", "Conditions", "Transforms", "Outputs", "Integrations",
    "Features", "Utilities"
]

export function registerStudioAgent() {
    const agent: SubAgent = {
        id: "studio-agent",
        name: "Studio Agent",
        description: "Helps create and manage UI layouts, automation workflows, widgets, and canvas operations in Studio.",
        featureId: "studio",
        tools: [
            {
                name: "getStudioHelp",
                description: "Get an overview of Studio features, modes, and how to use the visual builder.",
                parameters: {
                    topic: {
                        type: "string",
                        description: "Optional topic: 'ui', 'workflow', 'widgets', 'groups', 'inspector', 'preview', 'export', 'import'",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const topic = (params.topic as string | undefined) ?? ""
                    const help: Record<string, string> = {
                        ui: "UI Builder mode: drag widgets from the Library panel onto the canvas. Select a node to edit its properties in the Inspector (right panel). Use Pin to preview a specific node. Use Groups to compose components.",
                        workflow: "Workflow mode: build automation flows by connecting trigger nodes to action/condition nodes. Use the Execution Panel to run and debug flows. Export to n8n JSON format for deployment.",
                        widgets: "Widgets are reusable UI components. Categories: Layout, Typography, Media, Form, Data, Navigation, Blocks, Charts. Each widget has configurable props in the Inspector's Content tab.",
                        groups: "Groups (SketchUp-style): select 2+ nodes → click Group in header. Enter a group to focus-edit it. Save a group as a Block for reuse. Ungroup dissolves the group.",
                        inspector: "Inspector (right panel) has 3 tabs: Properties (styling + widget-specific fields), Layers (children order), AI (chat). Style changes are applied live to the preview.",
                        preview: "Preview panel shows the rendered UI from the canvas JSON schema. Toggle between Design and Interactive modes. Pin a node to preview just that subtree.",
                        export: "Export: Studio JSON (UI schema v0.4), Studio Document (unified), or n8n JSON (workflow). Import: paste JSON or upload a file. Auto-detects format.",
                        import: "Import: accepts Studio UI JSON (root+nodes), Studio Document (studioVersion), n8n workflow (connections array), or legacy flow format.",
                    }
                    const content = topic && help[topic]
                        ? help[topic]
                        : `Studio is a unified visual builder combining UI design and workflow automation.\n\nModes: UI Builder, Workflow, Unified (split canvas).\n\nTopics: ${Object.keys(help).join(", ")}.\n\nAsk about a specific topic for more details.`
                    return { success: true, data: { topic: topic || "overview", content }, message: content }
                },
            },
            {
                name: "listAvailableWidgets",
                description: "List all available UI widget types that can be added to the Studio canvas.",
                parameters: {
                    category: {
                        type: "string",
                        description: `Optional category filter: ${WIDGET_CATEGORIES.join(", ")}`,
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    // Dynamically import registry to avoid circular deps at module init
                    const { cmsWidgetRegistry } = await import(
                        "@/frontend/slices/studio/ui/widgets/registry"
                    )
                    const registry = cmsWidgetRegistry
                    const widgets = Object.entries(registry).map(([key, config]: [string, any]) => ({
                        key,
                        label: config.label,
                        category: config.category,
                        description: config.description ?? null,
                    }))
                    const filtered = params.category
                        ? widgets.filter(w => w.category?.toLowerCase() === (params.category as string).toLowerCase())
                        : widgets
                    const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, w) => {
                        const cat = w.category ?? "Other"
                        acc[cat] = acc[cat] ?? []
                        acc[cat].push(w)
                        return acc
                    }, {})
                    return {
                        success: true,
                        data: { byCategory, total: filtered.length },
                        message: `Found ${filtered.length} widget${filtered.length !== 1 ? "s" : ""}${params.category ? ` in category "${params.category}"` : ""}.`,
                    }
                },
            },
            {
                name: "listWorkflowNodes",
                description: "List all available workflow automation node types for building flows in Studio.",
                parameters: {
                    category: {
                        type: "string",
                        description: `Optional category filter: ${WORKFLOW_NODE_CATEGORIES.join(", ")}`,
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const { allNodeManifests } = await import(
                        "@/frontend/slices/studio/workflow/nodes/registry"
                    )
                    const nodes = allNodeManifests.map((m: any) => ({
                        type: m.type,
                        label: m.label,
                        category: m.category,
                        description: m.description ?? null,
                    }))
                    const filtered = params.category
                        ? nodes.filter((n: any) => n.category?.toLowerCase() === (params.category as string).toLowerCase())
                        : nodes
                    const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, n: any) => {
                        const cat = n.category ?? "Other"
                        acc[cat] = acc[cat] ?? []
                        acc[cat].push(n)
                        return acc
                    }, {})
                    return {
                        success: true,
                        data: { byCategory, total: filtered.length },
                        message: `Found ${filtered.length} workflow node type${filtered.length !== 1 ? "s" : ""}${params.category ? ` in category "${params.category}"` : ""}.`,
                    }
                },
            },
            {
                name: "getSchemaHelp",
                description: "Get the Studio JSON schema format for programmatically creating UI layouts. Includes sidebar, form, block, and element examples.",
                parameters: {
                    example: {
                        type: "string",
                        description: "Optional example type: 'basic', 'sidebar-layout', 'form', 'blocks', 'elements'",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const exampleType = (params.example as string | undefined) ?? "basic"

                    const examples: Record<string, object> = {
                        basic: {
                            version: "0.5",
                            root: ["page-root"],
                            nodes: {
                                "page-root": {
                                    type: "div",
                                    props: { display: "flex", flexDirection: "column", className: "gap-6 p-6" },
                                    children: ["page-title", "page-content"],
                                },
                                "page-title": {
                                    type: "text",
                                    props: { tag: "h1", content: "Hello Studio", fontSize: "2xl", fontWeight: "bold" },
                                    children: [],
                                },
                                "page-content": {
                                    type: "text",
                                    props: { tag: "p", content: "Welcome to SuperSpace Studio.", color: "muted-foreground" },
                                    children: [],
                                },
                            },
                        },
                        "sidebar-layout": {
                            version: "0.5",
                            root: ["app-shell"],
                            nodes: {
                                "app-shell": {
                                    type: "div",
                                    props: { className: "flex h-screen overflow-hidden" },
                                    children: ["sidebar", "main-area"],
                                },
                                sidebar: {
                                    type: "sidebarNav",
                                    props: { header: "My App", width: "default", border: true, background: "white" },
                                    children: ["nav-home", "nav-dashboard", "nav-settings"],
                                },
                                "nav-home": {
                                    type: "navItem",
                                    props: { label: "Home", href: "/", icon: "🏠", active: true },
                                    children: [],
                                },
                                "nav-dashboard": {
                                    type: "navItem",
                                    props: { label: "Dashboard", href: "/dashboard", icon: "📊" },
                                    children: [],
                                },
                                "nav-settings": {
                                    type: "navItem",
                                    props: { label: "Settings", href: "/settings", icon: "⚙️" },
                                    children: [],
                                },
                                "main-area": {
                                    type: "div",
                                    props: { className: "flex-1 flex flex-col min-w-0 overflow-hidden" },
                                    children: ["main-header", "main-content"],
                                },
                                "main-header": {
                                    type: "div",
                                    props: { className: "h-16 border-b border-slate-200 bg-white flex items-center px-6" },
                                    children: ["header-title"],
                                },
                                "header-title": {
                                    type: "text",
                                    props: { tag: "h2", content: "Dashboard", fontSize: "lg", fontWeight: "semibold" },
                                    children: [],
                                },
                                "main-content": {
                                    type: "div",
                                    props: { className: "flex-1 overflow-y-auto p-6" },
                                    children: ["content-stats"],
                                },
                                "content-stats": {
                                    type: "statsBlock",
                                    props: { title: "Overview" },
                                    children: [],
                                },
                            },
                        },
                        form: {
                            version: "0.5",
                            root: ["form-page"],
                            nodes: {
                                "form-page": {
                                    type: "div",
                                    props: { className: "max-w-lg mx-auto p-8 flex flex-col gap-6" },
                                    children: ["form-title", "form-body", "form-actions"],
                                },
                                "form-title": {
                                    type: "text",
                                    props: { tag: "h1", content: "Contact Us", fontSize: "2xl", fontWeight: "bold" },
                                    children: [],
                                },
                                "form-body": {
                                    type: "div",
                                    props: { className: "flex flex-col gap-4" },
                                    children: ["field-name", "field-email", "field-subject", "field-message", "field-subscribe"],
                                },
                                "field-name": {
                                    type: "formGroup",
                                    props: { label: "Full Name", required: true },
                                    children: ["input-name"],
                                },
                                "input-name": {
                                    type: "input",
                                    props: { placeholder: "John Doe", type: "text" },
                                    children: [],
                                },
                                "field-email": {
                                    type: "formGroup",
                                    props: { label: "Email", required: true, description: "We'll never share your email." },
                                    children: ["input-email"],
                                },
                                "input-email": {
                                    type: "input",
                                    props: { placeholder: "you@example.com", type: "email" },
                                    children: [],
                                },
                                "field-subject": {
                                    type: "formGroup",
                                    props: { label: "Subject" },
                                    children: ["select-subject"],
                                },
                                "select-subject": {
                                    type: "select",
                                    props: { placeholder: "Choose a subject...", options: ["General", "Support", "Billing", "Other"] },
                                    children: [],
                                },
                                "field-message": {
                                    type: "formGroup",
                                    props: { label: "Message", required: true },
                                    children: ["textarea-msg"],
                                },
                                "textarea-msg": {
                                    type: "textarea",
                                    props: { placeholder: "Your message here...", rows: 4 },
                                    children: [],
                                },
                                "field-subscribe": {
                                    type: "formGroup",
                                    props: { label: "" },
                                    children: ["check-subscribe"],
                                },
                                "check-subscribe": {
                                    type: "checkbox",
                                    props: { label: "Subscribe to newsletter" },
                                    children: [],
                                },
                                "form-actions": {
                                    type: "div",
                                    props: { className: "flex gap-3" },
                                    children: ["btn-submit", "btn-cancel"],
                                },
                                "btn-submit": {
                                    type: "button",
                                    props: { text: "Send Message", variant: "default" },
                                    children: [],
                                },
                                "btn-cancel": {
                                    type: "button",
                                    props: { text: "Cancel", variant: "outline" },
                                    children: [],
                                },
                            },
                        },
                        blocks: {
                            version: "0.5",
                            root: ["blocks-page"],
                            nodes: {
                                "blocks-page": {
                                    type: "div",
                                    props: { className: "p-6 flex flex-col gap-8" },
                                    children: ["stats-row", "charts-row", "table-section"],
                                },
                                "stats-row": {
                                    type: "div",
                                    props: { className: "grid grid-cols-2 lg:grid-cols-4 gap-4" },
                                    children: ["metric-1", "metric-2", "metric-3", "metric-4"],
                                },
                                "metric-1": { type: "metricCardBlock", props: { title: "Total Revenue", value: "$45,231", description: "vs last month", trend: { value: 20.1, direction: "up" } }, children: [] },
                                "metric-2": { type: "metricCardBlock", props: { title: "Active Users", value: "2,350", description: "daily active", trend: { value: 15.3, direction: "up" } }, children: [] },
                                "metric-3": { type: "metricCardBlock", props: { title: "New Signups", value: "1,247", description: "this week", trend: { value: 7.2, direction: "up" } }, children: [] },
                                "metric-4": { type: "metricCardBlock", props: { title: "Churn Rate", value: "2.4%", description: "monthly churn", trend: { value: 0.3, direction: "down" } }, children: [] },
                                "charts-row": {
                                    type: "div",
                                    props: { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                                    children: ["chart-revenue", "stats-summary"],
                                },
                                "chart-revenue": {
                                    type: "chartBlock",
                                    props: { title: "Revenue Over Time", chartType: "area", height: "320px", showLegend: true, showGrid: true },
                                    children: [],
                                },
                                "stats-summary": {
                                    type: "statsBlock",
                                    props: { title: "Quick Stats" },
                                    children: [],
                                },
                                "table-section": {
                                    type: "tableBlock",
                                    props: { title: "Recent Transactions", columns: ["Date", "Customer", "Amount", "Status"] },
                                    children: [],
                                },
                            },
                        },
                        elements: {
                            version: "0.5",
                            root: ["elements-demo"],
                            nodes: {
                                "elements-demo": {
                                    type: "div",
                                    props: { className: "p-8 flex flex-col gap-8 max-w-2xl mx-auto" },
                                    children: ["section-typography", "section-ui", "section-media"],
                                },
                                "section-typography": {
                                    type: "div",
                                    props: { className: "flex flex-col gap-3" },
                                    children: ["h1-demo", "h2-demo", "p-demo", "badge-demo"],
                                },
                                "h1-demo": { type: "text", props: { tag: "h1", content: "Heading 1", fontSize: "3xl", fontWeight: "bold" }, children: [] },
                                "h2-demo": { type: "text", props: { tag: "h2", content: "Heading 2", fontSize: "xl", fontWeight: "semibold" }, children: [] },
                                "p-demo": { type: "text", props: { tag: "p", content: "Body text paragraph. Lorem ipsum dolor sit amet consectetur.", color: "muted-foreground" }, children: [] },
                                "badge-demo": {
                                    type: "div",
                                    props: { className: "flex gap-2" },
                                    children: ["badge-1", "badge-2", "badge-3"],
                                },
                                "badge-1": { type: "badge", props: { label: "Default", variant: "default" }, children: [] },
                                "badge-2": { type: "badge", props: { label: "Secondary", variant: "secondary" }, children: [] },
                                "badge-3": { type: "badge", props: { label: "Outline", variant: "outline" }, children: [] },
                                "section-ui": {
                                    type: "div",
                                    props: { className: "flex flex-col gap-3" },
                                    children: ["btn-row", "alert-demo", "progress-demo"],
                                },
                                "btn-row": {
                                    type: "div",
                                    props: { className: "flex gap-3 flex-wrap" },
                                    children: ["btn-primary", "btn-secondary", "btn-outline", "btn-ghost"],
                                },
                                "btn-primary": { type: "button", props: { text: "Primary", variant: "default" }, children: [] },
                                "btn-secondary": { type: "button", props: { text: "Secondary", variant: "secondary" }, children: [] },
                                "btn-outline": { type: "button", props: { text: "Outline", variant: "outline" }, children: [] },
                                "btn-ghost": { type: "button", props: { text: "Ghost", variant: "ghost" }, children: [] },
                                "alert-demo": { type: "alert", props: { title: "Alert", description: "This is an informational alert.", variant: "default" }, children: [] },
                                "progress-demo": { type: "progress", props: { value: 65, label: "Progress" }, children: [] },
                                "section-media": {
                                    type: "div",
                                    props: { className: "flex flex-col gap-3" },
                                    children: ["avatar-row", "img-demo"],
                                },
                                "avatar-row": {
                                    type: "div",
                                    props: { className: "flex gap-2" },
                                    children: ["avatar-1", "avatar-2", "avatar-3"],
                                },
                                "avatar-1": { type: "avatar", props: { fallback: "JD" }, children: [] },
                                "avatar-2": { type: "avatar", props: { fallback: "AB" }, children: [] },
                                "avatar-3": { type: "avatar", props: { fallback: "CD" }, children: [] },
                                "img-demo": { type: "image", props: { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800", alt: "Demo image", className: "rounded-xl w-full h-48 object-cover" }, children: [] },
                            },
                        },
                    }

                    const schema = examples[exampleType] ?? examples.basic
                    const desc = {
                        basic: "Simple page with heading and text nodes.",
                        "sidebar-layout": "Full app shell with sidebarNav, navItem, header, and content blocks.",
                        form: "Contact form using formGroup, input, select, textarea, checkbox, and buttons.",
                        blocks: "Dashboard with metricCardBlock, chartBlock, activityBlock, and tableBlock.",
                        elements: "Typography, buttons, badges, alert, progress, avatar, and image elements.",
                    }[exampleType] ?? "Studio UI JSON schema v0.5 example."

                    return {
                        success: true,
                        data: { schema, description: desc, exampleType },
                        message: `Schema example '${exampleType}' retrieved. Use widget keys from listAvailableWidgets. Import via Studio's Import button.`,
                    }
                },
            },
            {
                name: "getLayoutHelp",
                description: "Get specific help on Studio layout patterns: sidebar, grid, form, full-page app shell.",
                parameters: {
                    pattern: {
                        type: "string",
                        description: "Pattern: 'sidebar', 'grid', 'form', 'stack', 'card-grid', 'tabs'",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const pattern = (params.pattern as string | undefined) ?? "overview"
                    const patterns: Record<string, string> = {
                        overview: "Available layout patterns: sidebar (app shell with fixed sidebar + scrollable main), grid (responsive card grid), form (fieldgroup + inputs), stack (vertical content), card-grid (equal-width cards), tabs (tabbed panels).",
                        sidebar: "Sidebar pattern: use type='div' (className='flex h-screen overflow-hidden') → sidebarNav widget + div (className='flex-1 flex flex-col min-w-0 overflow-hidden'). sidebarNav has built-in scrollable area. Fill with navItem widgets. CRITICAL: root[0] must be the outermost flex div so the renderer renders it without needing a path property.",
                        grid: "Grid pattern: div (className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6') → metricCardBlock or card children. For charts: grid-cols-3 with chartBlock spanning 2 cols (className='col-span-2').",
                        form: "Form pattern: formGroup → input/select/textarea/checkbox inside. formGroup provides label + description + error. Stack formGroups in a div (flex-col gap-4). End with button row (flex gap-3).",
                        stack: "Stack pattern: div (display='flex', flexDirection='column', gap='1.5rem') → text + content blocks vertically.",
                        "card-grid": "Card grid: div (className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6') → card or div children with bg-white rounded-xl shadow-sm p-6.",
                        tabs: "Tabs: use the tabs widget. Set items=[{label:'Tab 1',value:'tab1'},{label:'Tab 2',value:'tab2'}]. Place content inside each tab panel.",
                    }
                    const content = patterns[pattern] ?? patterns.overview
                    return { success: true, data: { pattern, content }, message: content }
                },
            },
            {
                name: "listCanvasNodes",
                description: "List all nodes currently on the Studio canvas.",
                parameters: {},
                handler: async (_params, _ctx) => {
                    const result = await studioCanvasBridge.getNodes()
                    if (!result.success) return { success: false, error: result.error, message: result.error ?? "Canvas not mounted" }
                    return {
                        success: true,
                        data: { nodes: result.nodes, count: result.nodes?.length ?? 0 },
                        message: `Canvas has ${result.nodes?.length ?? 0} nodes.`,
                    }
                },
            },
            {
                name: "addCanvasNode",
                description: "Add a new UI widget or automation node to the Studio canvas. Use widget type keys from listAvailableWidgets.",
                parameters: {
                    type: {
                        type: "string",
                        description: "Widget/node type key, e.g. 'text', 'button', 'card', 'section', 'metricCardBlock'",
                        required: true,
                    },
                    props: {
                        type: "object",
                        description: "Widget props (label, content, className, variant, etc.)",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const result = await studioCanvasBridge.addNode({
                        type: params.type as string,
                        props: (params.props as Record<string, any>) ?? {},
                    })
                    if (!result.success) return { success: false, error: result.error, message: result.error ?? "Failed to add node" }
                    return {
                        success: true,
                        data: { id: result.id, type: params.type },
                        message: `Added ${params.type} node (id: ${result.id}) to canvas.`,
                    }
                },
            },
            {
                name: "updateCanvasNode",
                description: "Update props of an existing node on the Studio canvas by its ID.",
                parameters: {
                    id: { type: "string", description: "Node ID to update", required: true },
                    props: { type: "object", description: "New props to merge into the node", required: true },
                },
                handler: async (params, _ctx) => {
                    const result = await studioCanvasBridge.updateNode(params.id as string, params.props as Record<string, any>)
                    if (!result.success) return { success: false, error: result.error, message: result.error ?? "Failed to update node" }
                    return { success: true, data: {}, message: `Updated node ${params.id}.` }
                },
            },
            {
                name: "deleteCanvasNode",
                description: "Delete a node from the Studio canvas by its ID.",
                parameters: {
                    id: { type: "string", description: "Node ID to delete", required: true },
                },
                handler: async (params, _ctx) => {
                    const result = await studioCanvasBridge.deleteNode(params.id as string)
                    if (!result.success) return { success: false, error: result.error, message: result.error ?? "Failed to delete node" }
                    return { success: true, data: {}, message: `Deleted node ${params.id}.` }
                },
            },
            {
                name: "generateAndImportLayout",
                description: "Generate a complete Studio UI layout or workflow from a description and import it to the canvas. This replaces the current canvas content.",
                parameters: {
                    description: {
                        type: "string",
                        description: "What to build, e.g. 'a dashboard with 4 metric cards and a chart', 'a login form', 'a kanban board header'",
                        required: true,
                    },
                    schema: {
                        type: "object",
                        description: "Pre-built Studio JSON schema (v0.5 format) to import directly. If provided, skips AI generation.",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    // If a schema is provided directly, import it
                    if (params.schema) {
                        const result = await studioCanvasBridge.importSchema(params.schema as object)
                        if (!result.success) return { success: false, error: result.error, message: result.error ?? "Import failed" }
                        return { success: true, data: {}, message: "Layout imported to canvas successfully." }
                    }
                    // Auto-detect pattern from description and route to the right tool
                    const desc = (params.description as string).toLowerCase()
                    const KNOWN_PATTERNS: Record<string, string[]> = {
                        dashboard:            ["dashboard", "analytics", "metrics", "kpi"],
                        settings:             ["settings", "preferences", "account", "profile settings"],
                        landing:              ["landing", "hero section", "marketing page"],
                        "data-table":         ["table", "list view", "data management", "customers", "orders"],
                        profile:              ["profile", "user page", "bio"],
                        // "kanban" routes to the kanbanBlock-based pattern (DnD-ready)
                        kanban:               ["kanban", "board", "sprint", "task board", "project board", "drag and drop board", "draggable board", "task management"],
                        "social-feed":        ["twitter", "x clone", "x.com", "social feed", "tweet", "timeline", "social media", "feed clone"],
                        "streaming-platform": ["streaming", "netflix", "video", "movies", "media"],
                        // "kanban-workspace" is ONLY for explicit advanced manual board requests
                        "kanban-workspace":   ["manual kanban", "custom kanban layout", "kanban from scratch"],
                    }
                    let matchedPattern: string | null = null
                    for (const [pattern, keywords] of Object.entries(KNOWN_PATTERNS)) {
                        if (keywords.some(kw => desc.includes(kw))) { matchedPattern = pattern; break }
                    }
                    if (matchedPattern) {
                        return {
                            success: true,
                            data: { hint: `Detected pattern: "${matchedPattern}". Call getDesignPatterns({ pattern: "${matchedPattern}" }) to get the full schema, then call generateAndImportLayout with that schema.`, detectedPattern: matchedPattern },
                            message: `For "${params.description}", use getDesignPatterns("${matchedPattern}") → then generateAndImportLayout(schema). This gives a production-ready layout immediately.`,
                        }
                    }
                    return {
                        success: true,
                        data: { hint: "No matching design pattern found. Try: (1) listBuiltinTemplates → findClosestTemplate → getBuiltinTemplate → generateAndImportLayout, or (2) getSchemaHelp → craft schema → generateAndImportLayout." },
                        message: `For "${params.description}": call findClosestTemplate to find a matching built-in template, or use getDesignPatterns for a generated pattern.`,
                    }
                },
            },
            {
                name: "getBlockPropsHelp",
                description: "Get the exact TypeScript prop interface and a correct example for any Studio block widget. Always call this before generating a schema that uses blocks to avoid prop structure mistakes.",
                parameters: {
                    block: {
                        type: "string",
                        description: "Block type: metricCardBlock, chartBlock, statsBlock, tableBlock, formBlock, listBlock, kanbanBlock, calendarBlock, filterBlock. Omit to list all.",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const block = (params.block as string | undefined) ?? ""
                    const blockInterfaces: Record<string, { interface: string; example: object; neverUse: string[] }> = {
                        metricCardBlock: {
                            interface: "{ title: string; value: string | number; description?: string; trend?: { value: number; direction: 'up' | 'down' | 'neutral'; label?: string } }",
                            example: { type: "metricCardBlock", props: { title: "Monthly Revenue", value: "$45,231", description: "vs last month", trend: { value: 12.5, direction: "up" } }, children: [] },
                            neverUse: ["change prop (use trend.value)", "trend: 'up' as string (must be object with value+direction)", "label prop (use title)"],
                        },
                        chartBlock: {
                            interface: "{ title: string; chartType: 'bar' | 'line' | 'area' | 'pie'; height?: string; showLegend?: boolean; showGrid?: boolean }",
                            example: { type: "chartBlock", props: { title: "Revenue Trend", chartType: "area", height: "320px", showLegend: true, showGrid: true }, children: [] },
                            neverUse: ["type prop (use chartType)", "data prop (blocks show empty state only)"],
                        },
                        statsBlock: {
                            interface: "{ title: string }",
                            example: { type: "statsBlock", props: { title: "Overview" }, children: [] },
                            neverUse: [],
                        },
                        tableBlock: {
                            interface: "{ title: string; columns?: string[] }",
                            example: { type: "tableBlock", props: { title: "Recent Orders", columns: ["Date", "Customer", "Amount", "Status"] }, children: [] },
                            neverUse: [],
                        },
                        formBlock: {
                            interface: "{ title: string; fields?: string[] }",
                            example: { type: "formBlock", props: { title: "Contact Form", fields: ["Name", "Email", "Message"] }, children: [] },
                            neverUse: [],
                        },
                        listBlock: {
                            interface: "{ title: string; maxItems?: number }",
                            example: { type: "listBlock", props: { title: "Recent Items", maxItems: 10 }, children: [] },
                            neverUse: [],
                        },
                        kanbanBlock: {
                            interface: "{ title: string; columns?: string[] }",
                            example: { type: "kanbanBlock", props: { title: "Project Board", columns: ["Todo", "In Progress", "Done"] }, children: [] },
                            neverUse: [],
                        },
                        calendarBlock: {
                            interface: "{ title: string }",
                            example: { type: "calendarBlock", props: { title: "Calendar" }, children: [] },
                            neverUse: [],
                        },
                        filterBlock: {
                            interface: "{ title: string }",
                            example: { type: "filterBlock", props: { title: "Filters" }, children: [] },
                            neverUse: [],
                        },
                    }

                    if (block && blockInterfaces[block]) {
                        const info = blockInterfaces[block]
                        return {
                            success: true,
                            data: info,
                            message: `Props for ${block}: ${info.interface}. Never use: ${info.neverUse.join(", ") || "none"}.`,
                        }
                    }
                    const all = Object.entries(blockInterfaces).map(([key, val]) => ({ type: key, interface: val.interface }))
                    return {
                        success: true,
                        data: { blocks: all },
                        message: "Block prop interfaces. Call with a specific block type for a ready-to-use example.",
                    }
                },
            },
            {
                name: "listBuiltinTemplates",
                description: "List all built-in Studio templates by name. Use findClosestTemplate to match a user description to one, then getBuiltinTemplate to load it.",
                parameters: {},
                handler: async (_params, _ctx) => {
                    const { getBuiltinTemplateKeys } = await import("@/frontend/slices/studio/ui/state/templateStore")
                    const keys = getBuiltinTemplateKeys()
                    const descriptions: Record<string, string> = {
                        "SaaS Product Landing": "Dark-mode SaaS landing with proof metrics, pricing tiers, hero section",
                        "Agency Studio": "Editorial agency launch page with case studies and process blocks",
                        "Personal Portfolio": "Portfolio with projects, experience timeline, client proof sections",
                        "Startup Pitch": "Investor narrative: problem, solution, traction, raise ask",
                        "Mobile App Landing": "Mobile-first launch with app-store CTAs and feature showcase",
                        "Local Business": "Business service/retail page with contact, hours, services",
                        "Event Conference": "Event showcase with schedule, speakers, and registration",
                        "Waitlist Coming Soon": "Launch landing with email waitlist signup",
                        "Streaming Platform (Netflix Clone)": "Full streaming UI: dark nav, hero, 5 content rows, poster cards, categories (~350 nodes)",
                    }
                    const list = keys.map((k: string) => ({ name: k, description: descriptions[k] ?? "Built-in template" }))
                    return {
                        success: true,
                        data: { templates: list, count: list.length },
                        message: `${list.length} built-in templates available. Call getBuiltinTemplate(name) to load any of them.`,
                    }
                },
            },
            {
                name: "getBuiltinTemplate",
                description: "Load a built-in template schema by exact name. Returns a valid Studio v0.5 schema ready to pass to generateAndImportLayout. WARNING: the Streaming Platform template has 350+ nodes — it will replace your entire canvas.",
                parameters: {
                    name: {
                        type: "string",
                        description: "Exact template name from listBuiltinTemplates",
                        required: true,
                    },
                },
                handler: async (params, _ctx) => {
                    const { instantiateDefaultTemplate } = await import("@/frontend/slices/studio/ui/state/templateStore")
                    const schema = await instantiateDefaultTemplate(params.name as string)
                    if (!schema) {
                        return {
                            success: false,
                            error: `Template "${params.name}" not found. Call listBuiltinTemplates to see valid names.`,
                            message: "Template not found.",
                        }
                    }
                    const nodeCount = schema.nodes ? Object.keys(schema.nodes).length : 0
                    return {
                        success: true,
                        data: { schema, nodeCount },
                        message: `Loaded "${params.name}" (${nodeCount} nodes). Pass schema to generateAndImportLayout to import.`,
                    }
                },
            },
            {
                name: "findClosestTemplate",
                description: "Find the closest built-in template matching a user description. Returns the template name and a match score. Use this before getBuiltinTemplate.",
                parameters: {
                    description: {
                        type: "string",
                        description: "User intent or prompt",
                        required: true,
                    },
                },
                handler: async (params, _ctx) => {
                    const TEMPLATE_KEYWORDS: Record<string, string[]> = {
                        "SaaS Product Landing":                  ["saas", "product", "launch", "beta", "startup", "marketing"],
                        "Agency Studio":                         ["agency", "creative", "studio", "case stud"],
                        "Personal Portfolio":                    ["portfolio", "personal", "resume", "developer", "designer"],
                        "Startup Pitch":                         ["pitch", "investor", "fundrais", "traction", "raise"],
                        "Mobile App Landing":                    ["mobile app", "ios", "android", "app store", "download app"],
                        "Local Business":                        ["local", "restaurant", "café", "retail", "service", "shop"],
                        "Event Conference":                      ["event", "conference", "summit", "tickets", "schedule", "speaker"],
                        "Waitlist Coming Soon":                  ["waitlist", "coming soon", "signup", "notify"],
                        "Streaming Platform (Netflix Clone)":    ["streaming", "netflix", "video", "movies", "tv shows", "media platform", "watch", "film"],
                    }
                    const q = (params.description as string).toLowerCase()
                    let bestName = "SaaS Product Landing"
                    let bestScore = 0
                    for (const [name, keywords] of Object.entries(TEMPLATE_KEYWORDS)) {
                        const score = keywords.filter(kw => q.includes(kw)).length
                        if (score > bestScore) { bestScore = score; bestName = name }
                    }
                    return {
                        success: true,
                        data: { templateName: bestName, score: bestScore, confident: bestScore >= 2 },
                        message: bestScore >= 2
                            ? `Best match: "${bestName}" (score ${bestScore}). Call getBuiltinTemplate("${bestName}") then generateAndImportLayout with the schema.`
                            : `Low-confidence match: "${bestName}" (score ${bestScore}). Consider getDesignPatterns for a custom generated schema instead.`,
                    }
                },
            },
            {
                name: "getDesignPatterns",
                description: "Get a curated, visually polished Studio JSON schema (v0.5) for a common UI pattern. Ready to import directly. Uses correct block props, design tokens, and responsive Tailwind classes. ALL content nodes are pre-filled.",
                parameters: {
                    pattern: {
                        type: "string",
                        description: "Pattern: 'dashboard' (SaaS analytics), 'settings' (sidebar + form panels), 'landing' (hero + features + CTA), 'data-table' (filter + table), 'profile' (user profile + stats), 'kanban' (PREFERRED for all kanban/board prompts — uses kanbanBlock with real DnD, 5 columns, 10 items with priorities/assignees), 'social-feed' (Twitter/X-style social feed — 3 columns, composer, 3 tweet cards with content + icons all filled), 'streaming-platform' (dark media UI with hero + content rows), 'kanban-workspace' (ADVANCED: manual div-based board layout for custom designs). Omit to list all.",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const pattern = (params.pattern as string | undefined) ?? ""

                    const patterns: Record<string, { description: string; schema: object }> = {
                        dashboard: {
                            description: "SaaS analytics dashboard: header, 4 metric cards, area chart, and data table. Uses correct metricCardBlock/chartBlock props.",
                            schema: {
                                version: "0.5",
                                root: ["dash-root"],
                                nodes: {
                                    "dash-root": { type: "div", props: { className: "min-h-screen bg-gray-50" }, children: ["dash-container"] },
                                    "dash-container": { type: "div", props: { className: "max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8" }, children: ["dash-header", "metrics-row", "charts-row", "dash-table"] },
                                    "dash-header": { type: "div", props: { className: "flex items-center justify-between" }, children: ["dash-title", "dash-actions"] },
                                    "dash-title": { type: "text", props: { tag: "h1", content: "Analytics Dashboard", fontSize: "1.5rem", fontWeight: "700", color: "#111827" }, children: [] },
                                    "dash-actions": { type: "div", props: { className: "flex gap-3" }, children: ["btn-export", "btn-filter"] },
                                    "btn-export": { type: "button", props: { text: "Export", variant: "outline" }, children: [] },
                                    "btn-filter": { type: "button", props: { text: "Filter", variant: "default" }, children: [] },
                                    "metrics-row": { type: "div", props: { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, children: ["m-revenue", "m-users", "m-orders", "m-growth"] },
                                    "m-revenue": { type: "metricCardBlock", props: { title: "Total Revenue", value: "$124,500", description: "vs last month", trend: { value: 12.5, direction: "up" } }, children: [] },
                                    "m-users": { type: "metricCardBlock", props: { title: "Active Users", value: "8,420", description: "daily active", trend: { value: 5.2, direction: "up" } }, children: [] },
                                    "m-orders": { type: "metricCardBlock", props: { title: "Orders", value: "1,240", description: "processed today", trend: { value: 2.1, direction: "down" } }, children: [] },
                                    "m-growth": { type: "metricCardBlock", props: { title: "MoM Growth", value: "24%", description: "month over month", trend: { value: 8.4, direction: "up" } }, children: [] },
                                    "charts-row": { type: "div", props: { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" }, children: ["revenue-chart", "stats-panel"] },
                                    "revenue-chart": { type: "chartBlock", props: { title: "Revenue Trend", chartType: "area", height: "320px", showLegend: true, showGrid: true }, children: [] },
                                    "stats-panel": { type: "statsBlock", props: { title: "Key Metrics" }, children: [] },
                                    "dash-table": { type: "tableBlock", props: { title: "Recent Transactions", columns: ["Date", "Customer", "Amount", "Status"] }, children: [] },
                                },
                            },
                        },
                        settings: {
                            description: "Settings page: sidebar navigation + tabbed form panels. Uses correct layout props.",
                            schema: {
                                version: "0.5",
                                root: ["settings-root"],
                                nodes: {
                                    "settings-root": { type: "div", props: { className: "min-h-screen bg-gray-50" }, children: ["settings-container"] },
                                    "settings-container": { type: "div", props: { className: "max-w-5xl mx-auto px-6 py-8" }, children: ["settings-title", "settings-layout"] },
                                    "settings-title": { type: "text", props: { tag: "h1", content: "Settings", fontSize: "1.5rem", fontWeight: "700", color: "#111827" }, children: [] },
                                    "settings-layout": { type: "div", props: { className: "mt-6 flex gap-8" }, children: ["settings-nav", "settings-content"] },
                                    "settings-nav": { type: "div", props: { className: "w-48 flex-shrink-0 flex flex-col gap-1" }, children: ["nav-profile", "nav-account", "nav-notifications", "nav-security", "nav-billing"] },
                                    "nav-profile": { type: "button", props: { text: "Profile", variant: "ghost", className: "justify-start w-full bg-blue-50 text-blue-700 font-medium" }, children: [] },
                                    "nav-account": { type: "button", props: { text: "Account", variant: "ghost", className: "justify-start w-full text-gray-600" }, children: [] },
                                    "nav-notifications": { type: "button", props: { text: "Notifications", variant: "ghost", className: "justify-start w-full text-gray-600" }, children: [] },
                                    "nav-security": { type: "button", props: { text: "Security", variant: "ghost", className: "justify-start w-full text-gray-600" }, children: [] },
                                    "nav-billing": { type: "button", props: { text: "Billing", variant: "ghost", className: "justify-start w-full text-gray-600" }, children: [] },
                                    "settings-content": { type: "div", props: { className: "flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6" }, children: ["form-section-title", "form-fields", "form-save"] },
                                    "form-section-title": { type: "text", props: { tag: "h2", content: "Profile Information", fontSize: "1rem", fontWeight: "600", color: "#111827" }, children: [] },
                                    "form-fields": { type: "div", props: { className: "flex flex-col gap-4" }, children: ["field-name", "field-email", "field-bio"] },
                                    "field-name": { type: "input", props: { placeholder: "Full name", label: "Full Name", type: "text" }, children: [] },
                                    "field-email": { type: "input", props: { placeholder: "you@company.com", label: "Email Address", type: "email" }, children: [] },
                                    "field-bio": { type: "textarea", props: { placeholder: "Brief bio or description...", label: "Bio", rows: 3 }, children: [] },
                                    "form-save": { type: "div", props: { className: "flex justify-end gap-3 pt-4 border-t border-gray-100" }, children: ["btn-cancel", "btn-save"] },
                                    "btn-cancel": { type: "button", props: { text: "Cancel", variant: "outline" }, children: [] },
                                    "btn-save": { type: "button", props: { text: "Save Changes", variant: "default" }, children: [] },
                                },
                            },
                        },
                        landing: {
                            description: "Landing page: hero section, feature cards, and CTA. Responsive.",
                            schema: {
                                version: "0.5",
                                root: ["landing-root"],
                                nodes: {
                                    "landing-root": { type: "div", props: { className: "min-h-screen bg-white flex flex-col" }, children: ["hero", "features", "cta-section"] },
                                    "hero": { type: "div", props: { className: "flex flex-col items-center gap-6 py-24 px-6 text-center bg-gradient-to-b from-blue-50 to-white" }, children: ["hero-badge", "hero-title", "hero-sub", "hero-buttons"] },
                                    "hero-badge": { type: "badge", props: { label: "Now in Beta", variant: "secondary" }, children: [] },
                                    "hero-title": { type: "text", props: { tag: "h1", content: "Build faster with SuperSpace", fontSize: "3rem", fontWeight: "800", color: "#111827", className: "max-w-2xl" }, children: [] },
                                    "hero-sub": { type: "text", props: { tag: "p", content: "The all-in-one platform for modern teams. Ship products, automate workflows, and collaborate seamlessly.", fontSize: "1.125rem", color: "#6B7280", className: "max-w-xl" }, children: [] },
                                    "hero-buttons": { type: "div", props: { className: "flex gap-3 flex-wrap justify-center" }, children: ["btn-cta", "btn-demo"] },
                                    "btn-cta": { type: "button", props: { text: "Start for free", variant: "default", className: "bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg text-base font-semibold" }, children: [] },
                                    "btn-demo": { type: "button", props: { text: "Watch demo →", variant: "ghost", className: "text-gray-700 px-6 py-3 text-base" }, children: [] },
                                    "features": { type: "div", props: { className: "px-6 py-20 max-w-5xl mx-auto w-full" }, children: ["feat-title", "feat-grid"] },
                                    "feat-title": { type: "text", props: { tag: "h2", content: "Everything you need", fontSize: "2rem", fontWeight: "700", color: "#111827", className: "text-center mb-12" }, children: [] },
                                    "feat-grid": { type: "div", props: { className: "grid grid-cols-1 md:grid-cols-3 gap-8" }, children: ["feat-1", "feat-2", "feat-3"] },
                                    "feat-1": { type: "div", props: { className: "flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100 shadow-sm" }, children: ["feat-1-title", "feat-1-desc"] },
                                    "feat-1-title": { type: "text", props: { tag: "h3", content: "Visual Builder", fontSize: "1rem", fontWeight: "600", color: "#111827" }, children: [] },
                                    "feat-1-desc": { type: "text", props: { tag: "p", content: "Drag-and-drop UI builder with 50+ components. No code required.", fontSize: "0.875rem", color: "#6B7280" }, children: [] },
                                    "feat-2": { type: "div", props: { className: "flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100 shadow-sm" }, children: ["feat-2-title", "feat-2-desc"] },
                                    "feat-2-title": { type: "text", props: { tag: "h3", content: "Automation", fontSize: "1rem", fontWeight: "600", color: "#111827" }, children: [] },
                                    "feat-2-desc": { type: "text", props: { tag: "p", content: "Build powerful workflows with our visual automation engine.", fontSize: "0.875rem", color: "#6B7280" }, children: [] },
                                    "feat-3": { type: "div", props: { className: "flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100 shadow-sm" }, children: ["feat-3-title", "feat-3-desc"] },
                                    "feat-3-title": { type: "text", props: { tag: "h3", content: "Collaboration", fontSize: "1rem", fontWeight: "600", color: "#111827" }, children: [] },
                                    "feat-3-desc": { type: "text", props: { tag: "p", content: "Work together in real-time with your entire team.", fontSize: "0.875rem", color: "#6B7280" }, children: [] },
                                    "cta-section": { type: "div", props: { className: "py-20 px-6 bg-blue-600 flex flex-col items-center gap-4 text-center" }, children: ["cta-title", "cta-sub", "cta-btn"] },
                                    "cta-title": { type: "text", props: { tag: "h2", content: "Ready to get started?", fontSize: "2rem", fontWeight: "700", color: "#ffffff" }, children: [] },
                                    "cta-sub": { type: "text", props: { tag: "p", content: "Join thousands of teams already using SuperSpace.", color: "#bfdbfe" }, children: [] },
                                    "cta-btn": { type: "button", props: { text: "Get started free", variant: "default", className: "bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-base" }, children: [] },
                                },
                            },
                        },
                        "data-table": {
                            description: "Data management page: search + filter bar, stats row, and data table.",
                            schema: {
                                version: "0.5",
                                root: ["dt-root"],
                                nodes: {
                                    "dt-root": { type: "div", props: { className: "min-h-screen bg-gray-50" }, children: ["dt-container"] },
                                    "dt-container": { type: "div", props: { className: "max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6" }, children: ["dt-header", "dt-search-row", "dt-metrics", "dt-table"] },
                                    "dt-header": { type: "div", props: { className: "flex items-center justify-between" }, children: ["dt-title", "btn-new"] },
                                    "dt-title": { type: "text", props: { tag: "h1", content: "Customers", fontSize: "1.5rem", fontWeight: "700", color: "#111827" }, children: [] },
                                    "btn-new": { type: "button", props: { text: "+ Add customer", variant: "default" }, children: [] },
                                    "dt-search-row": { type: "div", props: { className: "flex gap-3 items-center" }, children: ["search-input", "dt-filter"] },
                                    "search-input": { type: "input", props: { placeholder: "Search customers...", type: "search", className: "flex-1" }, children: [] },
                                    "dt-filter": { type: "filterBlock", props: { title: "Filters" }, children: [] },
                                    "dt-metrics": { type: "div", props: { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, children: ["dt-m1", "dt-m2", "dt-m3"] },
                                    "dt-m1": { type: "metricCardBlock", props: { title: "Total Customers", value: "12,847", trend: { value: 8.1, direction: "up" } }, children: [] },
                                    "dt-m2": { type: "metricCardBlock", props: { title: "New This Month", value: "342", trend: { value: 12.3, direction: "up" } }, children: [] },
                                    "dt-m3": { type: "metricCardBlock", props: { title: "Avg. LTV", value: "$892", trend: { value: 3.2, direction: "up" } }, children: [] },
                                    "dt-table": { type: "tableBlock", props: { title: "All Customers", columns: ["Name", "Email", "Plan", "MRR", "Status", "Joined"] }, children: [] },
                                },
                            },
                        },
                        profile: {
                            description: "User profile page: avatar, bio, stats row, and activity feed.",
                            schema: {
                                version: "0.5",
                                root: ["profile-root"],
                                nodes: {
                                    "profile-root": { type: "div", props: { className: "min-h-screen bg-gray-50" }, children: ["profile-container"] },
                                    "profile-container": { type: "div", props: { className: "max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6" }, children: ["profile-card", "profile-stats", "profile-activity"] },
                                    "profile-card": { type: "div", props: { className: "bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-6" }, children: ["profile-avatar", "profile-info", "profile-actions"] },
                                    "profile-avatar": { type: "avatar", props: { fallback: "JD", className: "h-20 w-20 text-2xl" }, children: [] },
                                    "profile-info": { type: "div", props: { className: "flex-1 flex flex-col gap-1" }, children: ["profile-name", "profile-role", "profile-email"] },
                                    "profile-name": { type: "text", props: { tag: "h1", content: "Jane Doe", fontSize: "1.25rem", fontWeight: "700", color: "#111827" }, children: [] },
                                    "profile-role": { type: "text", props: { tag: "p", content: "Senior Product Designer", fontSize: "0.875rem", color: "#6B7280" }, children: [] },
                                    "profile-email": { type: "text", props: { tag: "p", content: "jane@company.com", fontSize: "0.875rem", color: "#6B7280" }, children: [] },
                                    "profile-actions": { type: "div", props: { className: "flex gap-2" }, children: ["btn-edit", "btn-msg"] },
                                    "btn-edit": { type: "button", props: { text: "Edit Profile", variant: "outline" }, children: [] },
                                    "btn-msg": { type: "button", props: { text: "Message", variant: "default" }, children: [] },
                                    "profile-stats": { type: "div", props: { className: "grid grid-cols-3 gap-4" }, children: ["ps-1", "ps-2", "ps-3"] },
                                    "ps-1": { type: "metricCardBlock", props: { title: "Projects", value: "24", trend: { value: 4.0, direction: "up" } }, children: [] },
                                    "ps-2": { type: "metricCardBlock", props: { title: "Contributions", value: "1,842", trend: { value: 18.2, direction: "up" } }, children: [] },
                                    "ps-3": { type: "metricCardBlock", props: { title: "Reviews", value: "156", trend: { value: 2.3, direction: "neutral" } }, children: [] },
                                    "profile-activity": { type: "listBlock", props: { title: "Recent Activity", maxItems: 8 }, children: [] },
                                },
                            },
                        },
                        "streaming-platform": {
                            description: "Streaming / media platform UI: dark nav, immersive hero with gradient overlay, horizontal-scroll content rows, poster cards, category pills. Primitive composition only — no smartBlocks.",
                            schema: {
                                version: "0.5",
                                root: ["stream-root"],
                                nodes: {
                                    "stream-root":      { type: "div",     props: { className: "bg-black text-white min-h-screen flex flex-col" }, children: ["stream-nav", "stream-hero", "stream-featured", "stream-trending", "stream-categories"] },
                                    // ─── Nav ───
                                    "stream-nav":       { type: "section", props: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "1rem 4rem", backgroundColor: "rgba(0,0,0,0.85)" }, children: ["nav-logo", "nav-links", "nav-right"] },
                                    "nav-logo":         { type: "text",    props: { content: "STREAMSPACE", fontSize: "1.375rem", fontWeight: "800", color: "#ef4444", letterSpacing: "0.04em" }, children: [] },
                                    "nav-links":        { type: "div",     props: { display: "flex", flexDirection: "row", gap: "1.5rem", alignItems: "center" }, children: ["nav-link-1", "nav-link-2", "nav-link-3", "nav-link-4"] },
                                    "nav-link-1":       { type: "text",    props: { content: "Home",     color: "#ffffff", fontSize: "0.875rem", fontWeight: "500" }, children: [] },
                                    "nav-link-2":       { type: "text",    props: { content: "Movies",   color: "#9ca3af", fontSize: "0.875rem" }, children: [] },
                                    "nav-link-3":       { type: "text",    props: { content: "TV Shows", color: "#9ca3af", fontSize: "0.875rem" }, children: [] },
                                    "nav-link-4":       { type: "text",    props: { content: "My List",  color: "#9ca3af", fontSize: "0.875rem" }, children: [] },
                                    "nav-right":        { type: "div",     props: { display: "flex", flexDirection: "row", gap: "0.75rem", alignItems: "center" }, children: ["nav-search-btn", "nav-avatar"] },
                                    "nav-search-btn":   { type: "button",  props: { text: "Search", variant: "ghost", className: "text-white" }, children: [] },
                                    "nav-avatar":       { type: "avatar",  props: { fallback: "U", className: "h-8 w-8 cursor-pointer" }, children: [] },
                                    // ─── Hero ───
                                    "stream-hero":      { type: "section", props: { style: { position: "relative", minHeight: "70vh", overflow: "hidden" } }, children: ["hero-bg", "hero-overlay", "hero-content"] },
                                    "hero-bg":          { type: "image",   props: { src: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80", alt: "Featured title", style: { position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" } }, children: [] },
                                    "hero-overlay":     { type: "div",     props: { style: { position: "absolute", inset: "0", background: "linear-gradient(to right, rgba(0,0,0,0.9) 40%, transparent 100%)" } }, children: [] },
                                    "hero-content":     { type: "div",     props: { display: "flex", flexDirection: "column", gap: "1rem", style: { position: "relative", zIndex: "10", padding: "4rem" } }, children: ["hero-badge", "hero-title", "hero-meta", "hero-desc", "hero-actions"] },
                                    "hero-badge":       { type: "badge",   props: { label: "#1 in Movies Today", variant: "secondary", className: "bg-red-600 text-white w-fit" }, children: [] },
                                    "hero-title":       { type: "text",    props: { tag: "h1", content: "The Last Horizon", fontSize: "3.5rem", fontWeight: "800", color: "#ffffff", style: { maxWidth: "600px", lineHeight: "1.1" } }, children: [] },
                                    "hero-meta":        { type: "div",     props: { display: "flex", flexDirection: "row", gap: "1rem", alignItems: "center" }, children: ["hero-year", "hero-rating", "hero-duration"] },
                                    "hero-year":        { type: "text",    props: { content: "2024", color: "#10b981", fontWeight: "600", fontSize: "0.875rem" }, children: [] },
                                    "hero-rating":      { type: "badge",   props: { label: "TV-MA", variant: "outline", className: "text-gray-300 border-gray-500" }, children: [] },
                                    "hero-duration":    { type: "text",    props: { content: "2h 18m", color: "#9ca3af", fontSize: "0.875rem" }, children: [] },
                                    "hero-desc":        { type: "text",    props: { tag: "p", content: "A gripping sci-fi epic about humanity's last voyage beyond the edge of the known universe.", color: "#d1d5db", fontSize: "1rem", style: { maxWidth: "500px" } }, children: [] },
                                    "hero-actions":     { type: "div",     props: { display: "flex", flexDirection: "row", gap: "0.75rem" }, children: ["hero-play", "hero-info"] },
                                    "hero-play":        { type: "button",  props: { text: "▶ Play", className: "bg-white text-black hover:bg-gray-200 font-bold px-8 py-3 rounded-lg text-base" }, children: [] },
                                    "hero-info":        { type: "button",  props: { text: "ⓘ More Info", variant: "ghost", className: "bg-gray-600/60 text-white hover:bg-gray-500/60 font-semibold px-6 py-3 rounded-lg text-base" }, children: [] },
                                    // ─── Featured row ───
                                    "stream-featured":  { type: "section", props: { padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }, children: ["feat-header", "feat-row"] },
                                    "feat-header":      { type: "div",     props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["feat-title", "feat-more"] },
                                    "feat-title":       { type: "text",    props: { tag: "h2", content: "Continue Watching", fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }, children: [] },
                                    "feat-more":        { type: "text",    props: { content: "See all →", color: "#3b82f6", fontSize: "0.875rem" }, children: [] },
                                    "feat-row":         { type: "div",     props: { display: "flex", flexDirection: "row", gap: "0.75rem", style: { overflowX: "auto", paddingBottom: "0.5rem" } }, children: ["cw-1", "cw-2", "cw-3", "cw-4"] },
                                    "cw-1":             { type: "div",     props: { style: { minWidth: "180px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["cw-1-img", "cw-1-label"] },
                                    "cw-1-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=360&q=70", alt: "Show 1", style: { width: "100%", height: "100px", objectFit: "cover" } }, children: [] },
                                    "cw-1-label":       { type: "text",    props: { content: "Dark Orbit", color: "#e5e7eb", fontSize: "0.75rem", fontWeight: "500", style: { padding: "0.375rem 0.5rem" } }, children: [] },
                                    "cw-2":             { type: "div",     props: { style: { minWidth: "180px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["cw-2-img", "cw-2-label"] },
                                    "cw-2-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=360&q=70", alt: "Show 2", style: { width: "100%", height: "100px", objectFit: "cover" } }, children: [] },
                                    "cw-2-label":       { type: "text",    props: { content: "Neon Requiem", color: "#e5e7eb", fontSize: "0.75rem", fontWeight: "500", style: { padding: "0.375rem 0.5rem" } }, children: [] },
                                    "cw-3":             { type: "div",     props: { style: { minWidth: "180px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["cw-3-img", "cw-3-label"] },
                                    "cw-3-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=360&q=70", alt: "Show 3", style: { width: "100%", height: "100px", objectFit: "cover" } }, children: [] },
                                    "cw-3-label":       { type: "text",    props: { content: "Solar Wolves", color: "#e5e7eb", fontSize: "0.75rem", fontWeight: "500", style: { padding: "0.375rem 0.5rem" } }, children: [] },
                                    "cw-4":             { type: "div",     props: { style: { minWidth: "180px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["cw-4-img", "cw-4-label"] },
                                    "cw-4-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=360&q=70", alt: "Show 4", style: { width: "100%", height: "100px", objectFit: "cover" } }, children: [] },
                                    "cw-4-label":       { type: "text",    props: { content: "The Expanse", color: "#e5e7eb", fontSize: "0.75rem", fontWeight: "500", style: { padding: "0.375rem 0.5rem" } }, children: [] },
                                    // ─── Trending row ───
                                    "stream-trending":  { type: "section", props: { padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }, children: ["trend-header", "trend-row"] },
                                    "trend-header":     { type: "div",     props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["trend-title", "trend-more"] },
                                    "trend-title":      { type: "text",    props: { tag: "h2", content: "Trending Now", fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }, children: [] },
                                    "trend-more":       { type: "text",    props: { content: "See all →", color: "#3b82f6", fontSize: "0.875rem" }, children: [] },
                                    "trend-row":        { type: "div",     props: { display: "flex", flexDirection: "row", gap: "0.75rem", style: { overflowX: "auto", paddingBottom: "0.5rem" } }, children: ["tr-1", "tr-2", "tr-3", "tr-4"] },
                                    "tr-1":             { type: "div",     props: { style: { minWidth: "150px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["tr-1-img", "tr-1-info"] },
                                    "tr-1-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1554743576-9c8e2f63edd2?w=300&q=70", alt: "Trending 1", style: { width: "100%", height: "220px", objectFit: "cover" } }, children: [] },
                                    "tr-1-info":        { type: "div",     props: { display: "flex", flexDirection: "column", gap: "0.125rem", style: { padding: "0.375rem 0.5rem" } }, children: ["tr-1-title", "tr-1-genre"] },
                                    "tr-1-title":       { type: "text",    props: { content: "Ghost Protocol", color: "#f3f4f6", fontSize: "0.75rem", fontWeight: "600" }, children: [] },
                                    "tr-1-genre":       { type: "text",    props: { content: "Action • Thriller", color: "#6b7280", fontSize: "0.625rem" }, children: [] },
                                    "tr-2":             { type: "div",     props: { style: { minWidth: "150px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["tr-2-img", "tr-2-info"] },
                                    "tr-2-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&q=70", alt: "Trending 2", style: { width: "100%", height: "220px", objectFit: "cover" } }, children: [] },
                                    "tr-2-info":        { type: "div",     props: { display: "flex", flexDirection: "column", gap: "0.125rem", style: { padding: "0.375rem 0.5rem" } }, children: ["tr-2-title", "tr-2-genre"] },
                                    "tr-2-title":       { type: "text",    props: { content: "Crimson Tide", color: "#f3f4f6", fontSize: "0.75rem", fontWeight: "600" }, children: [] },
                                    "tr-2-genre":       { type: "text",    props: { content: "Drama • Crime", color: "#6b7280", fontSize: "0.625rem" }, children: [] },
                                    "tr-3":             { type: "div",     props: { style: { minWidth: "150px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["tr-3-img", "tr-3-info"] },
                                    "tr-3-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1580130544977-6f2d51dfa51a?w=300&q=70", alt: "Trending 3", style: { width: "100%", height: "220px", objectFit: "cover" } }, children: [] },
                                    "tr-3-info":        { type: "div",     props: { display: "flex", flexDirection: "column", gap: "0.125rem", style: { padding: "0.375rem 0.5rem" } }, children: ["tr-3-title", "tr-3-genre"] },
                                    "tr-3-title":       { type: "text",    props: { content: "Zero Hour", color: "#f3f4f6", fontSize: "0.75rem", fontWeight: "600" }, children: [] },
                                    "tr-3-genre":       { type: "text",    props: { content: "Sci-Fi • Adventure", color: "#6b7280", fontSize: "0.625rem" }, children: [] },
                                    "tr-4":             { type: "div",     props: { style: { minWidth: "150px", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" } }, children: ["tr-4-img", "tr-4-info"] },
                                    "tr-4-img":         { type: "image",   props: { src: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&q=70", alt: "Trending 4", style: { width: "100%", height: "220px", objectFit: "cover" } }, children: [] },
                                    "tr-4-info":        { type: "div",     props: { display: "flex", flexDirection: "column", gap: "0.125rem", style: { padding: "0.375rem 0.5rem" } }, children: ["tr-4-title", "tr-4-genre"] },
                                    "tr-4-title":       { type: "text",    props: { content: "Midnight Run", color: "#f3f4f6", fontSize: "0.75rem", fontWeight: "600" }, children: [] },
                                    "tr-4-genre":       { type: "text",    props: { content: "Comedy • Romance", color: "#6b7280", fontSize: "0.625rem" }, children: [] },
                                    // ─── Categories ───
                                    "stream-categories": { type: "section", props: { padding: "1.5rem 2rem 3rem", display: "flex", flexDirection: "column", gap: "0.75rem" }, children: ["cat-header", "cat-pills"] },
                                    "cat-header":        { type: "div",     props: { display: "flex", flexDirection: "row", alignItems: "center" }, children: ["cat-title"] },
                                    "cat-title":         { type: "text",    props: { tag: "h2", content: "Browse by Genre", fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }, children: [] },
                                    "cat-pills":         { type: "div",     props: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.625rem" }, children: ["pill-1", "pill-2", "pill-3", "pill-4", "pill-5", "pill-6", "pill-7", "pill-8"] },
                                    "pill-1":  { type: "button", props: { text: "Action",     variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                    "pill-2":  { type: "button", props: { text: "Comedy",     variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                    "pill-3":  { type: "button", props: { text: "Drama",      variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                    "pill-4":  { type: "button", props: { text: "Sci-Fi",     variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                    "pill-5":  { type: "button", props: { text: "Thriller",   variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                    "pill-6":  { type: "button", props: { text: "Horror",     variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                    "pill-7":  { type: "button", props: { text: "Romance",    variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                    "pill-8":  { type: "button", props: { text: "Documentary", variant: "outline", className: "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full" }, children: [] },
                                },
                            },
                        },
                        "kanban": {
                            description: "Kanban board using kanbanBlock with structured columns + items. DnD-ready, supports priority badges, assignee avatars, due dates. Use this for all kanban/board prompts.",
                            schema: {
                                version: "0.5",
                                root: ["kb-root"],
                                nodes: {
                                    "kb-root": { type: "div", props: { className: "min-h-screen bg-gray-50 flex flex-col" }, children: ["kb-header", "kb-content"] },
                                    "kb-header": { type: "div", props: { className: "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between" }, children: ["kb-header-left", "kb-actions"] },
                                    "kb-header-left": { type: "div", props: { className: "flex flex-col gap-0.5" }, children: ["kb-title", "kb-meta"] },
                                    "kb-title": { type: "text", props: { tag: "h1", content: "Project Board", fontSize: "1.25rem", fontWeight: "700", color: "#111827" }, children: [] },
                                    "kb-meta": { type: "text", props: { content: "Sprint 12 · Apr 1 – Apr 14", fontSize: "0.75rem", color: "#6b7280" }, children: [] },
                                    "kb-actions": { type: "div", props: { className: "flex gap-2" }, children: ["kb-filter-btn", "kb-add-btn"] },
                                    "kb-filter-btn": { type: "button", props: { text: "Filter", variant: "outline" }, children: [] },
                                    "kb-add-btn": { type: "button", props: { text: "+ Add Task", variant: "default" }, children: [] },
                                    "kb-content": { type: "div", props: { className: "flex-1 p-6" }, children: ["kb-board"] },
                                    "kb-board": {
                                        type: "kanbanBlock",
                                        props: {
                                            title: "Project Board",
                                            columns: [
                                                {
                                                    id: "backlog", title: "Backlog", items: [
                                                        { id: "t1", title: "User research interviews", priority: "medium", tags: ["research"] },
                                                        { id: "t2", title: "Competitor analysis", priority: "low" },
                                                    ],
                                                },
                                                {
                                                    id: "todo", title: "To Do", items: [
                                                        { id: "t3", title: "Redesign onboarding flow", priority: "high", tags: ["design"], assignee: { fallback: "AK" }, dueDate: "Apr 8" },
                                                        { id: "t4", title: "Write API documentation", priority: "medium", assignee: { fallback: "BL" } },
                                                        { id: "t5", title: "Setup analytics dashboard", priority: "low", dueDate: "Apr 12" },
                                                    ],
                                                },
                                                {
                                                    id: "in-progress", title: "In Progress", items: [
                                                        { id: "t6", title: "API rate limiting middleware", priority: "high", assignee: { fallback: "RA" }, dueDate: "Apr 7" },
                                                        { id: "t7", title: "User permissions UI", priority: "medium", assignee: { fallback: "JD" }, dueDate: "Apr 9" },
                                                    ],
                                                },
                                                {
                                                    id: "review", title: "In Review", items: [
                                                        { id: "t8", title: "Dark mode toggle", priority: "medium", tags: ["ui"], assignee: { fallback: "CM" } },
                                                    ],
                                                },
                                                {
                                                    id: "done", title: "Done", items: [
                                                        { id: "t9", title: "Auth token refresh logic", priority: "high", assignee: { fallback: "MN" }, dueDate: "✓ Apr 3" },
                                                        { id: "t10", title: "Write API documentation", priority: "low", dueDate: "✓ Apr 5" },
                                                    ],
                                                },
                                            ],
                                        },
                                        children: [],
                                    },
                                },
                            },
                        },
                        "social-feed": {
                            description: "Twitter/X-style social feed: 3-column layout (nav sidebar + center timeline + discovery rail), composer, 3 tweet cards fully filled with content, trending section, who-to-follow. All content nodes have payload filled.",
                            schema: {
                                version: "0.5",
                                root: ["social-root"],
                                nodes: {
                                    // ─── Shell ───
                                    "social-root":       { type: "section",   props: { display: "flex", flexDirection: "row", className: "min-h-screen bg-white text-gray-900" }, children: ["left-sidebar", "center-feed", "right-sidebar"] },
                                    // ─── Left Sidebar ───
                                    "left-sidebar":      { type: "div",       props: { className: "hidden lg:flex lg:w-64 xl:w-72 flex-col h-screen sticky top-0 px-4 py-4 border-r border-gray-200 gap-2" }, children: ["nav-logo", "nav-home", "nav-explore", "nav-notifications", "nav-messages", "nav-profile", "nav-spacer", "post-btn"] },
                                    "nav-logo":          { type: "text",      props: { content: "SuperSpace", fontSize: "1.5rem", fontWeight: "800", color: "#000000", className: "px-4 py-2 mb-2" }, children: [] },
                                    "nav-home":          { type: "button",    props: { text: "Home",          variant: "ghost", className: "flex items-center gap-3 px-4 py-3 text-lg font-semibold rounded-full hover:bg-gray-100 w-full justify-start" }, children: [] },
                                    "nav-explore":       { type: "button",    props: { text: "Explore",       variant: "ghost", className: "flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-full hover:bg-gray-100 w-full justify-start text-gray-700" }, children: [] },
                                    "nav-notifications": { type: "button",    props: { text: "Notifications", variant: "ghost", className: "flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-full hover:bg-gray-100 w-full justify-start text-gray-700" }, children: [] },
                                    "nav-messages":      { type: "button",    props: { text: "Messages",      variant: "ghost", className: "flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-full hover:bg-gray-100 w-full justify-start text-gray-700" }, children: [] },
                                    "nav-profile":       { type: "button",    props: { text: "Profile",       variant: "ghost", className: "flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-full hover:bg-gray-100 w-full justify-start text-gray-700" }, children: [] },
                                    "nav-spacer":        { type: "spacer",    props: { height: "1rem" }, children: [] },
                                    "post-btn":          { type: "button",    props: { text: "Post",          variant: "default", className: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full w-full text-base" }, children: [] },
                                    // ─── Center Feed ───
                                    "center-feed":       { type: "div",       props: { className: "flex-1 max-w-2xl border-x border-gray-200 min-h-screen flex flex-col" }, children: ["feed-header", "feed-tabs", "composer", "tweet-1", "tweet-2", "tweet-3"] },
                                    "feed-header":       { type: "div",       props: { className: "sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10" }, children: ["feed-title"] },
                                    "feed-title":        { type: "text",      props: { content: "Home", fontSize: "1.25rem", fontWeight: "700", color: "#000000" }, children: [] },
                                    "feed-tabs":         { type: "tabs",      props: { tabs: "For you,Following", className: "border-b border-gray-200" }, children: [] },
                                    // ─── Composer ───
                                    "composer":          { type: "div",       props: { className: "border-b border-gray-200 p-4 flex gap-3" }, children: ["composer-avatar", "composer-right"] },
                                    "composer-avatar":   { type: "avatar",    props: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=me", className: "w-10 h-10 rounded-full flex-shrink-0" }, children: [] },
                                    "composer-right":    { type: "div",       props: { className: "flex-1 flex flex-col gap-3" }, children: ["composer-input", "composer-actions"] },
                                    "composer-input":    { type: "textarea",  props: { placeholder: "What is happening?!", className: "w-full text-xl border-none focus:ring-0 resize-none bg-transparent placeholder-gray-500 min-h-[80px]" }, children: [] },
                                    "composer-actions":  { type: "div",       props: { className: "flex items-center justify-between" }, children: ["composer-icons", "composer-submit"] },
                                    "composer-icons":    { type: "div",       props: { className: "flex gap-1" }, children: ["icon-media", "icon-emoji"] },
                                    "icon-media":        { type: "iconButton", props: { icon: "image",  className: "text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    "icon-emoji":        { type: "iconButton", props: { icon: "smile",  className: "text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    "composer-submit":   { type: "button",    props: { text: "Post",   className: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-5 rounded-full" }, children: [] },
                                    // ─── Tweet 1 (with image) ───
                                    "tweet-1":           { type: "div",       props: { className: "border-b border-gray-200 p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer" }, children: ["t1-avatar", "t1-body"] },
                                    "t1-avatar":         { type: "avatar",    props: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice", className: "w-10 h-10 rounded-full flex-shrink-0" }, children: [] },
                                    "t1-body":           { type: "div",       props: { className: "flex-1 flex flex-col gap-1.5" }, children: ["t1-header", "t1-text", "t1-image", "t1-actions"] },
                                    "t1-header":         { type: "div",       props: { className: "flex items-center gap-1.5 flex-wrap" }, children: ["t1-name", "t1-handle", "t1-dot", "t1-time"] },
                                    "t1-name":           { type: "text",      props: { content: "Alice Johnson",  fontWeight: "700", color: "#000000", fontSize: "0.9375rem" }, children: [] },
                                    "t1-handle":         { type: "text",      props: { content: "@alicejohnson", color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t1-dot":            { type: "text",      props: { content: "·",              color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t1-time":           { type: "text",      props: { content: "2h",             color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t1-text":           { type: "text",      props: { content: "Just shipped the new dashboard feature! The team did an amazing job this sprint. Really proud of what we built together. 🚀", color: "#000000", fontSize: "0.9375rem", className: "leading-relaxed" }, children: [] },
                                    "t1-image":          { type: "image",     props: { src: "https://picsum.photos/seed/post1/600/400", alt: "Post image", className: "rounded-2xl w-full max-h-72 object-cover border border-gray-200 mt-2" }, children: [] },
                                    "t1-actions":        { type: "div",       props: { className: "flex justify-between max-w-xs mt-1" }, children: ["t1-reply", "t1-repost", "t1-like", "t1-share"] },
                                    "t1-reply":          { type: "iconButton", props: { icon: "message-circle", className: "text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    "t1-repost":         { type: "iconButton", props: { icon: "repeat2",        className: "text-gray-500 hover:text-green-500 hover:bg-green-50 p-2 rounded-full" }, children: [] },
                                    "t1-like":           { type: "iconButton", props: { icon: "heart",          className: "text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-full" }, children: [] },
                                    "t1-share":          { type: "iconButton", props: { icon: "upload",         className: "text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    // ─── Tweet 2 (text only) ───
                                    "tweet-2":           { type: "div",       props: { className: "border-b border-gray-200 p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer" }, children: ["t2-avatar", "t2-body"] },
                                    "t2-avatar":         { type: "avatar",    props: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob", className: "w-10 h-10 rounded-full flex-shrink-0" }, children: [] },
                                    "t2-body":           { type: "div",       props: { className: "flex-1 flex flex-col gap-1.5" }, children: ["t2-header", "t2-text", "t2-actions"] },
                                    "t2-header":         { type: "div",       props: { className: "flex items-center gap-1.5 flex-wrap" }, children: ["t2-name", "t2-handle", "t2-dot", "t2-time"] },
                                    "t2-name":           { type: "text",      props: { content: "Bob Chen",     fontWeight: "700", color: "#000000", fontSize: "0.9375rem" }, children: [] },
                                    "t2-handle":         { type: "text",      props: { content: "@bobchen_dev", color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t2-dot":            { type: "text",      props: { content: "·",            color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t2-time":           { type: "text",      props: { content: "5h",           color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t2-text":           { type: "text",      props: { content: "Hot take: the best UI is one your users never have to think about. If they notice the interface, you've already lost.", color: "#000000", fontSize: "0.9375rem", className: "leading-relaxed" }, children: [] },
                                    "t2-actions":        { type: "div",       props: { className: "flex justify-between max-w-xs mt-1" }, children: ["t2-reply", "t2-repost", "t2-like", "t2-share"] },
                                    "t2-reply":          { type: "iconButton", props: { icon: "message-circle", className: "text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    "t2-repost":         { type: "iconButton", props: { icon: "repeat2",        className: "text-gray-500 hover:text-green-500 hover:bg-green-50 p-2 rounded-full" }, children: [] },
                                    "t2-like":           { type: "iconButton", props: { icon: "heart",          className: "text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-full" }, children: [] },
                                    "t2-share":          { type: "iconButton", props: { icon: "upload",         className: "text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    // ─── Tweet 3 ───
                                    "tweet-3":           { type: "div",       props: { className: "border-b border-gray-200 p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer" }, children: ["t3-avatar", "t3-body"] },
                                    "t3-avatar":         { type: "avatar",    props: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol", className: "w-10 h-10 rounded-full flex-shrink-0" }, children: [] },
                                    "t3-body":           { type: "div",       props: { className: "flex-1 flex flex-col gap-1.5" }, children: ["t3-header", "t3-text", "t3-actions"] },
                                    "t3-header":         { type: "div",       props: { className: "flex items-center gap-1.5 flex-wrap" }, children: ["t3-name", "t3-handle", "t3-dot", "t3-time"] },
                                    "t3-name":           { type: "text",      props: { content: "Carol Patel",  fontWeight: "700", color: "#000000", fontSize: "0.9375rem" }, children: [] },
                                    "t3-handle":         { type: "text",      props: { content: "@carolpatel",  color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t3-dot":            { type: "text",      props: { content: "·",            color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t3-time":           { type: "text",      props: { content: "8h",           color: "#6B7280", fontSize: "0.9375rem" }, children: [] },
                                    "t3-text":           { type: "text",      props: { content: "TIL that Tailwind v4 uses CSS variables for theming by default. Migration from v3 is smoother than I expected. Here are the 3 things to watch out for 🧵", color: "#000000", fontSize: "0.9375rem", className: "leading-relaxed" }, children: [] },
                                    "t3-actions":        { type: "div",       props: { className: "flex justify-between max-w-xs mt-1" }, children: ["t3-reply", "t3-repost", "t3-like", "t3-share"] },
                                    "t3-reply":          { type: "iconButton", props: { icon: "message-circle", className: "text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    "t3-repost":         { type: "iconButton", props: { icon: "repeat2",        className: "text-gray-500 hover:text-green-500 hover:bg-green-50 p-2 rounded-full" }, children: [] },
                                    "t3-like":           { type: "iconButton", props: { icon: "heart",          className: "text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-full" }, children: [] },
                                    "t3-share":          { type: "iconButton", props: { icon: "upload",         className: "text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-full" }, children: [] },
                                    // ─── Right Sidebar ───
                                    "right-sidebar":     { type: "div",       props: { className: "hidden xl:flex xl:w-80 flex-col sticky top-0 h-screen p-4 gap-4" }, children: ["search-box", "trending-box", "follow-box"] },
                                    "search-box":        { type: "input",     props: { placeholder: "Search", type: "search", className: "w-full bg-gray-100 border-none rounded-full py-2.5 px-5 focus:ring-2 focus:ring-blue-500 focus:bg-white" }, children: [] },
                                    // ─── Trending ───
                                    "trending-box":      { type: "div",       props: { className: "bg-gray-50 rounded-2xl p-4 flex flex-col gap-3" }, children: ["trending-title", "trend-1", "trend-2", "trend-3"] },
                                    "trending-title":    { type: "text",      props: { content: "What's happening", fontSize: "1.125rem", fontWeight: "700", color: "#000000" }, children: [] },
                                    "trend-1":           { type: "div",       props: { className: "flex flex-col gap-0.5 hover:bg-gray-100 p-2 -mx-2 rounded-lg cursor-pointer" }, children: ["trend-1-cat", "trend-1-tag", "trend-1-count"] },
                                    "trend-1-cat":       { type: "text",      props: { content: "Technology · Trending",  color: "#6B7280", fontSize: "0.75rem" }, children: [] },
                                    "trend-1-tag":       { type: "text",      props: { content: "#SuperSpace",            color: "#000000", fontWeight: "600", fontSize: "0.875rem" }, children: [] },
                                    "trend-1-count":     { type: "text",      props: { content: "14.2K posts",            color: "#6B7280", fontSize: "0.75rem" }, children: [] },
                                    "trend-2":           { type: "div",       props: { className: "flex flex-col gap-0.5 hover:bg-gray-100 p-2 -mx-2 rounded-lg cursor-pointer" }, children: ["trend-2-cat", "trend-2-tag", "trend-2-count"] },
                                    "trend-2-cat":       { type: "text",      props: { content: "Design · Trending",      color: "#6B7280", fontSize: "0.75rem" }, children: [] },
                                    "trend-2-tag":       { type: "text",      props: { content: "#BuildInPublic",          color: "#000000", fontWeight: "600", fontSize: "0.875rem" }, children: [] },
                                    "trend-2-count":     { type: "text",      props: { content: "8.7K posts",             color: "#6B7280", fontSize: "0.75rem" }, children: [] },
                                    "trend-3":           { type: "div",       props: { className: "flex flex-col gap-0.5 hover:bg-gray-100 p-2 -mx-2 rounded-lg cursor-pointer" }, children: ["trend-3-cat", "trend-3-tag", "trend-3-count"] },
                                    "trend-3-cat":       { type: "text",      props: { content: "Developer · Trending",   color: "#6B7280", fontSize: "0.75rem" }, children: [] },
                                    "trend-3-tag":       { type: "text",      props: { content: "#TailwindCSS",           color: "#000000", fontWeight: "600", fontSize: "0.875rem" }, children: [] },
                                    "trend-3-count":     { type: "text",      props: { content: "5.1K posts",             color: "#6B7280", fontSize: "0.75rem" }, children: [] },
                                    // ─── Who to follow ───
                                    "follow-box":        { type: "div",       props: { className: "bg-gray-50 rounded-2xl p-4 flex flex-col gap-3" }, children: ["follow-title", "follow-1", "follow-2"] },
                                    "follow-title":      { type: "text",      props: { content: "Who to follow", fontSize: "1.125rem", fontWeight: "700", color: "#000000" }, children: [] },
                                    "follow-1":          { type: "div",       props: { className: "flex items-center gap-3" }, children: ["follow-1-avatar", "follow-1-info", "follow-1-btn"] },
                                    "follow-1-avatar":   { type: "avatar",    props: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=devuser1", className: "w-10 h-10 rounded-full" }, children: [] },
                                    "follow-1-info":     { type: "div",       props: { className: "flex-1 flex flex-col" }, children: ["follow-1-name", "follow-1-handle"] },
                                    "follow-1-name":     { type: "text",      props: { content: "Dev Community",    fontWeight: "700", color: "#000000", fontSize: "0.875rem" }, children: [] },
                                    "follow-1-handle":   { type: "text",      props: { content: "@dev_community",   color: "#6B7280", fontSize: "0.8125rem" }, children: [] },
                                    "follow-1-btn":      { type: "button",    props: { text: "Follow", variant: "default", className: "rounded-full font-semibold px-4 py-1.5 text-sm" }, children: [] },
                                    "follow-2":          { type: "div",       props: { className: "flex items-center gap-3" }, children: ["follow-2-avatar", "follow-2-info", "follow-2-btn"] },
                                    "follow-2-avatar":   { type: "avatar",    props: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=techinsider", className: "w-10 h-10 rounded-full" }, children: [] },
                                    "follow-2-info":     { type: "div",       props: { className: "flex-1 flex flex-col" }, children: ["follow-2-name", "follow-2-handle"] },
                                    "follow-2-name":     { type: "text",      props: { content: "Tech Insider",      fontWeight: "700", color: "#000000", fontSize: "0.875rem" }, children: [] },
                                    "follow-2-handle":   { type: "text",      props: { content: "@techinsider",      color: "#6B7280", fontSize: "0.8125rem" }, children: [] },
                                    "follow-2-btn":      { type: "button",    props: { text: "Follow", variant: "default", className: "rounded-full font-semibold px-4 py-1.5 text-sm" }, children: [] },
                                },
                            },
                        },
                        "kanban-workspace": {
                            description: "Kanban project board: header with sprint info, 3 columns (To Do / In Progress / Done) each with task cards. Primitive composition only.",
                            schema: {
                                version: "0.5",
                                root: ["kanban-root"],
                                nodes: {
                                    "kanban-root":        { type: "div",    props: { className: "min-h-screen bg-gray-50 flex flex-col" }, children: ["kb-header", "kb-board"] },
                                    // ─── Header ───
                                    "kb-header":          { type: "div",    props: { className: "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between" }, children: ["kb-header-left", "kb-actions"] },
                                    "kb-header-left":     { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.125rem" }, children: ["kb-title", "kb-meta"] },
                                    "kb-title":           { type: "text",   props: { tag: "h1", content: "Project Board", fontSize: "1.25rem", fontWeight: "700", color: "#111827" }, children: [] },
                                    "kb-meta":            { type: "text",   props: { content: "Sprint 12 · Apr 1 – Apr 14", fontSize: "0.75rem", color: "#6b7280" }, children: [] },
                                    "kb-actions":         { type: "div",    props: { display: "flex", flexDirection: "row", gap: "0.5rem" }, children: ["kb-filter-btn", "kb-add-btn"] },
                                    "kb-filter-btn":      { type: "button", props: { text: "⊞ Filter", variant: "outline" }, children: [] },
                                    "kb-add-btn":         { type: "button", props: { text: "+ Add Task", variant: "default" }, children: [] },
                                    // ─── Board ───
                                    "kb-board":           { type: "div",    props: { display: "flex", flexDirection: "row", gap: "1.5rem", style: { padding: "1.5rem", overflowX: "auto", flex: "1" } }, children: ["col-todo", "col-progress", "col-done"] },
                                    // ─── To Do column ───
                                    "col-todo":           { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", style: { minWidth: "17rem", flexShrink: "0" } }, children: ["col-todo-header", "task-1", "task-2", "task-3"] },
                                    "col-todo-header":    { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["col-todo-title", "col-todo-count"] },
                                    "col-todo-title":     { type: "text",   props: { content: "To Do", fontWeight: "600", color: "#374151" }, children: [] },
                                    "col-todo-count":     { type: "badge",  props: { label: "3", variant: "secondary" }, children: [] },
                                    "task-1":             { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", className: "bg-white rounded-xl p-4 border border-gray-200 shadow-sm" }, children: ["task-1-title", "task-1-meta"] },
                                    "task-1-title":       { type: "text",   props: { content: "Redesign onboarding flow", fontWeight: "500", color: "#111827", fontSize: "0.875rem" }, children: [] },
                                    "task-1-meta":        { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["task-1-avatar", "task-1-due"] },
                                    "task-1-avatar":      { type: "avatar", props: { fallback: "AK", className: "h-6 w-6 text-[10px]" }, children: [] },
                                    "task-1-due":         { type: "text",   props: { content: "Apr 8", fontSize: "0.75rem", color: "#9ca3af" }, children: [] },
                                    "task-2":             { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", className: "bg-white rounded-xl p-4 border border-gray-200 shadow-sm" }, children: ["task-2-title", "task-2-meta"] },
                                    "task-2-title":       { type: "text",   props: { content: "Implement dark mode toggle", fontWeight: "500", color: "#111827", fontSize: "0.875rem" }, children: [] },
                                    "task-2-meta":        { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["task-2-avatar", "task-2-due"] },
                                    "task-2-avatar":      { type: "avatar", props: { fallback: "BL", className: "h-6 w-6 text-[10px]" }, children: [] },
                                    "task-2-due":         { type: "text",   props: { content: "Apr 10", fontSize: "0.75rem", color: "#9ca3af" }, children: [] },
                                    "task-3":             { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", className: "bg-white rounded-xl p-4 border border-gray-200 shadow-sm" }, children: ["task-3-title", "task-3-meta"] },
                                    "task-3-title":       { type: "text",   props: { content: "Set up analytics dashboard", fontWeight: "500", color: "#111827", fontSize: "0.875rem" }, children: [] },
                                    "task-3-meta":        { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["task-3-avatar", "task-3-due"] },
                                    "task-3-avatar":      { type: "avatar", props: { fallback: "CM", className: "h-6 w-6 text-[10px]" }, children: [] },
                                    "task-3-due":         { type: "text",   props: { content: "Apr 12", fontSize: "0.75rem", color: "#9ca3af" }, children: [] },
                                    // ─── In Progress column ───
                                    "col-progress":       { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", style: { minWidth: "17rem", flexShrink: "0" } }, children: ["col-prog-header", "task-4", "task-5"] },
                                    "col-prog-header":    { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["col-prog-title", "col-prog-count"] },
                                    "col-prog-title":     { type: "text",   props: { content: "In Progress", fontWeight: "600", color: "#374151" }, children: [] },
                                    "col-prog-count":     { type: "badge",  props: { label: "2", variant: "secondary", className: "bg-blue-100 text-blue-700" }, children: [] },
                                    "task-4":             { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", className: "bg-white rounded-xl p-4 border border-blue-200 shadow-sm" }, children: ["task-4-title", "task-4-meta"] },
                                    "task-4-title":       { type: "text",   props: { content: "API rate limiting middleware", fontWeight: "500", color: "#111827", fontSize: "0.875rem" }, children: [] },
                                    "task-4-meta":        { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["task-4-avatar", "task-4-due"] },
                                    "task-4-avatar":      { type: "avatar", props: { fallback: "RA", className: "h-6 w-6 text-[10px]" }, children: [] },
                                    "task-4-due":         { type: "text",   props: { content: "Apr 7", fontSize: "0.75rem", color: "#3b82f6" }, children: [] },
                                    "task-5":             { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", className: "bg-white rounded-xl p-4 border border-blue-200 shadow-sm" }, children: ["task-5-title", "task-5-meta"] },
                                    "task-5-title":       { type: "text",   props: { content: "User permissions UI", fontWeight: "500", color: "#111827", fontSize: "0.875rem" }, children: [] },
                                    "task-5-meta":        { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["task-5-avatar", "task-5-due"] },
                                    "task-5-avatar":      { type: "avatar", props: { fallback: "JD", className: "h-6 w-6 text-[10px]" }, children: [] },
                                    "task-5-due":         { type: "text",   props: { content: "Apr 9", fontSize: "0.75rem", color: "#3b82f6" }, children: [] },
                                    // ─── Done column ───
                                    "col-done":           { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", style: { minWidth: "17rem", flexShrink: "0" } }, children: ["col-done-header", "task-6", "task-7"] },
                                    "col-done-header":    { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["col-done-title", "col-done-count"] },
                                    "col-done-title":     { type: "text",   props: { content: "Done", fontWeight: "600", color: "#374151" }, children: [] },
                                    "col-done-count":     { type: "badge",  props: { label: "2", variant: "secondary", className: "bg-green-100 text-green-700" }, children: [] },
                                    "task-6":             { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", className: "bg-white rounded-xl p-4 border border-gray-100 shadow-sm opacity-75" }, children: ["task-6-title", "task-6-meta"] },
                                    "task-6-title":       { type: "text",   props: { content: "Auth token refresh logic", fontWeight: "500", color: "#6b7280", fontSize: "0.875rem", textDecoration: "line-through" }, children: [] },
                                    "task-6-meta":        { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["task-6-avatar", "task-6-due"] },
                                    "task-6-avatar":      { type: "avatar", props: { fallback: "MN", className: "h-6 w-6 text-[10px]" }, children: [] },
                                    "task-6-due":         { type: "text",   props: { content: "✓ Apr 3", fontSize: "0.75rem", color: "#10b981" }, children: [] },
                                    "task-7":             { type: "div",    props: { display: "flex", flexDirection: "column", gap: "0.75rem", className: "bg-white rounded-xl p-4 border border-gray-100 shadow-sm opacity-75" }, children: ["task-7-title", "task-7-meta"] },
                                    "task-7-title":       { type: "text",   props: { content: "Write API documentation", fontWeight: "500", color: "#6b7280", fontSize: "0.875rem", textDecoration: "line-through" }, children: [] },
                                    "task-7-meta":        { type: "div",    props: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: ["task-7-avatar", "task-7-due"] },
                                    "task-7-avatar":      { type: "avatar", props: { fallback: "SP", className: "h-6 w-6 text-[10px]" }, children: [] },
                                    "task-7-due":         { type: "text",   props: { content: "✓ Apr 5", fontSize: "0.75rem", color: "#10b981" }, children: [] },
                                },
                            },
                        },
                    }

                    if (pattern && patterns[pattern]) {
                        const p = patterns[pattern]
                        return { success: true, data: { schema: p.schema, description: p.description }, message: `Pattern '${pattern}': ${p.description}. Call generateAndImportLayout with this schema to import.` }
                    }
                    const list = Object.entries(patterns).map(([key, p]) => ({ pattern: key, description: p.description }))
                    return { success: true, data: { patterns: list }, message: "Available design patterns. Call with a pattern name to get the full importable schema." }
                },
            },
            {
                name: "clearCanvas",
                description: "Clear all nodes and edges from the Studio canvas.",
                parameters: {},
                handler: async (_params, _ctx) => {
                    const result = await studioCanvasBridge.clearCanvas()
                    if (!result.success) return { success: false, error: result.error, message: result.error ?? "Failed to clear canvas" }
                    return { success: true, data: {}, message: "Canvas cleared." }
                },
            },
        ],
        canHandle: (query) => {
            const q = query.toLowerCase()
            if (
                q.includes("studio") || q.includes("builder") || q.includes("automation") ||
                q.includes("workflow") || q.includes("trigger") || q.includes("widget") ||
                q.includes("canvas") || q.includes("inspector") || q.includes("template") ||
                q.includes("group") || q.includes("block") || q.includes("json schema") ||
                q.includes("pin") || q.includes("preview") || q.includes("renderer") ||
                q.includes("node type") || q.includes("flow node") || q.includes("ui layout") ||
                q.includes("sidebar") || q.includes("nav item") || q.includes("navitem") ||
                q.includes("form group") || q.includes("formgroup") || q.includes("layout pattern") ||
                q.includes("sidebar nav") || q.includes("sidebarnav") ||
                q.includes("add node") || q.includes("create node") || q.includes("delete node") ||
                q.includes("generate layout") || q.includes("generate ui") || q.includes("generate flow") ||
                q.includes("import schema") || q.includes("clear canvas") || q.includes("list nodes")
            ) return 0.7
            return 0
        },
    }

    subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
