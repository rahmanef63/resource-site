# Layout Container System

Declarative, JSON-driven layout system for flexible panel arrangements.

## Features

- **Single container**: Full-width single panel
- **Split vertical**: Left-right panel arrangement
- **Split horizontal**: Top-bottom panel arrangement  
- **Nested layouts**: Combine any layouts recursively
- **Resizable panels**: Drag handles between panels
- **Responsive support**: Different layouts per breakpoint
- **AI-Contactly**: Pure configuration, easily generated

## Usage

### Basic Layout with Config

```tsx
import { LayoutContainer, LAYOUT_SPLIT_2_VERTICAL } from "@/frontend/shared/ui/layout/container"

function MyPage() {
  return (
    <LayoutContainer
      layout={LAYOUT_SPLIT_2_VERTICAL}
      renderPanel={(ctx) => (
        <div className="p-4">
          Panel: {ctx.id}
        </div>
      )}
    />
  )
}
```

### Custom Layout Definition

```tsx
import { LayoutContainer, LayoutNode } from "@/frontend/shared/ui/layout/container"

const myLayout: LayoutNode = {
  id: "root",
  type: "split_vertical",
  mode: "custom",
  resizable: true,
  children: [
    { id: "sidebar", type: "single", size: "250px", minSize: 200, maxSize: 400 },
    { 
      id: "main",
      type: "split_horizontal",
      children: [
        { id: "content", type: "single" },
        { id: "footer", type: "single", size: "100px" }
      ]
    }
  ]
}

function MyPage() {
  return (
    <LayoutContainer
      layout={myLayout}
      renderPanel={(ctx) => {
        switch (ctx.id) {
          case "sidebar": return <Sidebar />
          case "content": return <MainContent />
          case "footer": return <Footer />
          default: return null
        }
      }}
    />
  )
}
```

### Using Convenience Components

```tsx
import { 
  ThreeColumnLayout, 
  SidebarLayout,
  SplitHorizontalLayout 
} from "@/frontend/shared/ui/layout/container"

// Three columns
<ThreeColumnLayout
  left={<LeftPanel />}
  center={<MainContent />}
  right={<RightPanel />}
  leftSize="20%"
  rightSize="30%"
/>

// Sidebar + content
<SidebarLayout
  sidebar={<Sidebar />}
  content={<Content />}
  sidebarWidth="280px"
  sidebarPosition="left"
/>

// Two rows
<SplitHorizontalLayout>
  <Header />
  <Content />
</SplitHorizontalLayout>
```

### Using Factory Functions

```tsx
import { 
  createEqualSplit, 
  createCustomSplit,
  withResponsive 
} from "@/frontend/shared/ui/layout/container"

// Equal 3-way split
const threeWay = createEqualSplit("vertical", ["left", "center", "right"])

// Custom sizes
const customSplit = createCustomSplit("vertical", [
  { id: "sidebar", size: "250px", minSize: 200 },
  { id: "content", size: 3 }
])

// With responsive overrides
const responsive = withResponsive(
  LAYOUT_SPLIT_2_VERTICAL,
  {
    mobile: { type: "single", id: "main" },
    tablet: { type: "split_vertical", children: [...] }
  }
)
```

## Layout Types

### LayoutNode

```typescript
interface LayoutNode {
  type: LayoutType               // "single" | "split_vertical" | "split_horizontal"
  id?: string                    // Unique identifier
  mode?: SplitMode               // "equal" | "custom"
  children?: LayoutNode[]        // Child nodes for splits
  size?: string | number         // "30%", "250px", "1fr", 2 (flex)
  minSize?: string | number      // Minimum constraint
  maxSize?: string | number      // Maximum constraint
  gap?: number | string          // Gap between children
  resizable?: boolean            // Enable drag-to-resize
  responsive?: {                 // Breakpoint overrides
    mobile?: LayoutNode
    tablet?: LayoutNode
    desktop?: LayoutNode
  }
  meta?: Record<string, unknown> // Custom metadata
}
```

### Size Configuration

Sizes can be specified as:
- **Percentage**: `"30%"` - Percentage of parent
- **Fixed**: `"250px"` - Fixed pixel value
- **Fr units**: `"2fr"` - Flex ratio
- **Number**: `2` - Flex grow value
- **Auto**: `"auto"` - Natural size

### Responsive Layouts

```typescript
const layout: LayoutNode = {
  id: "responsive-layout",
  type: "split_vertical",
  children: [
    { id: "sidebar", type: "single" },
    { id: "content", type: "single" }
  ],
  responsive: {
    mobile: {
      type: "single",
      id: "content" // Stack on mobile
    },
    tablet: {
      type: "split_vertical",
      children: [
        { id: "sidebar", type: "single", size: "200px" }
      ]
    }
  }
}
```

## Presets

| Preset | Description |
|--------|-------------|
| `LAYOUT_FULL` | Single full-width panel |
| `LAYOUT_SPLIT_2_VERTICAL` | Two equal columns |
| `LAYOUT_SPLIT_2_HORIZONTAL` | Two equal rows |
| `LAYOUT_SPLIT_3_VERTICAL` | Three equal columns |
| `LAYOUT_SPLIT_3_HORIZONTAL` | Three equal rows |
| `LAYOUT_SIDEBAR_CONTENT` | Sidebar (30%) + content |
| `LAYOUT_IDE` | Explorer + editor + inspector |
| `LAYOUT_MASTER_DETAIL` | Header + master/detail |
| `LAYOUT_DASHBOARD` | Header + sidebar + main + panel |
| `LAYOUT_RESPONSIVE_SIDEBAR` | Responsive sidebar layout |
| `LAYOUT_RESPONSIVE_3_COLUMN` | Responsive 3-column layout |

## Resize Handles

Panels can be resized by dragging the divider line between them:

- **Hover**: Line becomes bold with shadow
- **Drag**: Cursor changes to resize cursor
- **Keyboard**: Arrow keys adjust size (Shift for larger steps)

To disable resizing:

```tsx
// Per-node
const layout: LayoutNode = {
  type: "split_vertical",
  resizable: false,
  children: [...]
}

// Or via convenience component
<SplitVerticalLayout resizable={false}>
  ...
</SplitVerticalLayout>
```

## PanelRenderContext

The `renderPanel` callback receives context about the current panel:

```typescript
interface PanelRenderContext {
  id: string | undefined     // Panel's unique ID
  node: LayoutNode          // The current panel node
  depth: number             // Nesting depth (0 = root)
  path: string[]            // Path from root like ["0", "1"]
}
```

## Using Slots

You can also pass content via the `slots` prop instead of `renderPanel`:

```tsx
<LayoutContainer
  layout={myLayout}
  renderPanel={() => null}
  slots={{
    sidebar: <Sidebar />,
    content: <MainContent />,
    footer: <Footer />
  }}
/>
```

## File Structure

```
container/
├── index.ts                  # Exports
├── types.ts                  # Type definitions
├── utils.ts                  # Utility functions
├── presets.ts                # Pre-built layouts
├── LayoutContainer.tsx       # Main component
├── ResizeHandle.tsx          # Resize handle component
├── CollapsiblePanel.tsx      # Collapsible panel component
├── ThreeColumnLayout.tsx     # Advanced three-column layout
└── README.md                 # This file
```

## ThreeColumnLayoutAdvanced

The most complete three-column layout component with:

### Features
- ✅ **Collapsible panels** - Left and right panels can be collapsed/expanded
- ✅ **Resizable panels** - Drag handles between panels
- ✅ **Responsive breakpoints** - Auto-collapse at specified widths
- ✅ **Stacked mobile layout** - Vertical stacking on small screens
- ✅ **Keyboard shortcuts** - Cmd/Ctrl+B for left, Cmd/Ctrl+Shift+B for right
- ✅ **Persist state** - Optional localStorage persistence
- ✅ **Smooth animations** - 200ms transitions
- ✅ **Accessibility** - ARIA labels, focus management, tooltips

### Basic Usage

```tsx
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container"

<ThreeColumnLayoutAdvanced
  left={<Sidebar />}
  center={<MainContent />}
  right={<Inspector />}
  leftLabel="Sidebar"
  rightLabel="Inspector"
/>
```

### With Responsive Behavior

```tsx
<ThreeColumnLayoutAdvanced
  left={<Sidebar />}
  center={<MainContent />}
  right={<Inspector />}
  // Auto-collapse left panel when screen < 1024px
  collapseLeftAt={1024}
  // Auto-collapse right panel when screen < 1280px
  collapseRightAt={1280}
  // Stack vertically when screen < 768px
  stackAt={768}
/>
```

### Controlled Collapse State

```tsx
const [leftCollapsed, setLeftCollapsed] = useState(false)
const [rightCollapsed, setRightCollapsed] = useState(false)

<ThreeColumnLayoutAdvanced
  left={<Sidebar />}
  center={<MainContent />}
  right={<Inspector />}
  leftCollapsed={leftCollapsed}
  rightCollapsed={rightCollapsed}
  onLeftCollapsedChange={setLeftCollapsed}
  onRightCollapsedChange={setRightCollapsed}
/>
```

### With Persistence

```tsx
<ThreeColumnLayoutAdvanced
  left={<Sidebar />}
  center={<MainContent />}
  right={<Inspector />}
  persistState={true}
  storageKey="my-layout-state"
/>
```

### All Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `"feature" \| "store" \| "admin" \| "ide"` atau config | - | Preset width + responsive default (boleh di-override). |
| `left` | ReactNode | optional | Left panel content (auto hidden jika `null/undefined`) |
| `center` | ReactNode | required | Center panel content |
| `right` | ReactNode | optional | Right panel content (auto hidden jika `null/undefined`) |
| `leftWidth` | number | 280 | Left panel width (px) |
| `rightWidth` | number | 400 | Right panel width (px) |
| `centerMinWidth` | number | 280 | Minimum center width (px) |
| `minSideWidth` | number | 200 | Minimum side panel width |
| `maxSideWidth` | number | 600 | Maximum side panel width |
| `collapsedWidth` | number | 40 | Width when collapsed |
| `leftHidden` / `rightHidden` | boolean | false | Force hide left/right panel |
| `leftHeader` / `centerHeader` / `rightHeader` | ReactNode | - | Custom header per panel |
| `leftCollapsed` | boolean | - | Controlled left collapse |
| `rightCollapsed` | boolean | - | Controlled right collapse |
| `onLeftCollapsedChange` | function | - | Left collapse callback |
| `onRightCollapsedChange` | function | - | Right collapse callback |
| `defaultLeftCollapsed` | boolean | false | Initial left state |
| `defaultRightCollapsed` | boolean | false | Initial right state |
| `resizable` | boolean | true | Enable resize handles |
| `showCollapseButtons` | boolean | true | Show collapse buttons (global) |
| `showLeftCollapseButton` / `showRightCollapseButton` | boolean | - | Override per-panel collapse button |
| `persistState` | boolean | false | Persist to localStorage |
| `storageKey` | string | "three-column-layout" | Storage key |
| `leftLabel` | string | "Left Panel" | Left panel label |
| `rightLabel` | string | "Right Panel" | Right panel label |
| `collapseLeftAt` | number | - | Auto-collapse left at width |
| `collapseRightAt` | number | - | Auto-collapse right at width |
| `stackAt` | number | - | Stack vertically at width |

## CollapsiblePanel

A standalone collapsible panel component.

```tsx
import { CollapsiblePanel } from "@/frontend/shared/ui/layout/container"

<CollapsiblePanel
  direction="left"
  size="280px"
  label="Sidebar"
  defaultCollapsed={false}
  onCollapsedChange={(collapsed) => console.log(collapsed)}
>
  <SidebarContent />
</CollapsiblePanel>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | "left" \| "right" \| "top" \| "bottom" | required | Collapse direction |
| `size` | string \| number | - | Expanded size |
| `collapsedSize` | number | 32 | Collapsed size (px) |
| `collapsed` | boolean | - | Controlled state |
| `onCollapsedChange` | function | - | State change callback |
| `defaultCollapsed` | boolean | false | Initial state |
| `label` | string | - | Panel label for tooltip |
| `showCollapseButton` | boolean | true | Show collapse button |
| `collapseButtonPosition` | "start" \| "center" \| "end" | "center" | Button position |
