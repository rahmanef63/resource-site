# ResponsiveDialog

Single source of truth for all dialog/drawer overlays. Renders a centered `Dialog`, side `Sheet`, or `AlertDialog` on desktop and automatically switches to a `Drawer` (bottom or right) on mobile (`<768px`).

## Usage

```tsx
import { ResponsiveDialog } from "@/frontend/shared/ui"

<ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
  <ResponsiveDialog.Header>
    <ResponsiveDialog.Title>Create Workspace</ResponsiveDialog.Title>
    <ResponsiveDialog.Description>Choose a template or start from scratch.</ResponsiveDialog.Description>
  </ResponsiveDialog.Header>
  <ResponsiveDialog.Body>
    {/* form / tabs / whatever */}
  </ResponsiveDialog.Body>
  <ResponsiveDialog.Footer>
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={submit}>Create</Button>
  </ResponsiveDialog.Footer>
</ResponsiveDialog>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open state setter |
| `variant` | `"modal" \| "panel" \| "alert"` | `"modal"` | Desktop rendering: centered `Dialog`, side `Sheet`, or `AlertDialog` |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Desktop width/height preset |
| `mobileVariant` | `"drawer-bottom" \| "drawer-right"` | `"drawer-bottom"` | Mobile drawer direction |
| `sheetSide` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Side for `variant="panel"` |
| `showCloseButton` | `boolean` | `true` | Desktop-only X button (modal variant) |
| `dismissible` | `boolean` | `true` | Allow backdrop/swipe close |
| `contentClassName` | `string` | — | Extra classes on the content shell |

### Size map

| `size` | Desktop max-width | Desktop height |
|--------|-------------------|----------------|
| `sm`   | `sm:max-w-sm`     | `max-h-[60vh]` |
| `md`   | `sm:max-w-lg`     | `max-h-[70vh]` |
| `lg`   | `sm:max-w-2xl`    | `max-h-[80vh]` |
| `xl`   | `sm:max-w-4xl`    | `h-[80vh]`     |
| `full` | `sm:max-w-[95vw]` | `h-[90vh]`     |

Mobile drawer is always `h-[90dvh]` for bottom drawers.

## Subcomponents

- `ResponsiveDialog.Header` — Container with bottom border + padding. Houses Title + Description.
- `ResponsiveDialog.Title` — Required for a11y. Maps to the underlying primitive's Title.
- `ResponsiveDialog.Description` — Required for a11y. Keep children inline or use `<span className="block">` (underlying element is `<p>`, so avoid `<div>`).
- `ResponsiveDialog.Body` — Scrollable main area. Default: `flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6`. Pass `overflow-hidden` via `className` when the body has its own internal scroll regions (e.g. tab layouts). Pass `p-0` when rendering a media-fill block that should bleed to the container edges.
- `ResponsiveDialog.Footer` — Top-bordered action row with padding. Pass `flex-col-reverse sm:flex-row` for stacked-on-mobile, inline-on-desktop actions.

## Migration cheatsheet (from raw shadcn primitives)

| Before | After |
|--------|-------|
| `<Dialog>` / `<DialogContent className="sm:max-w-md">` | `<ResponsiveDialog variant="modal" size="md">` |
| `<DialogContent className="max-w-4xl h-[80vh]">` | `<ResponsiveDialog variant="modal" size="xl">` |
| `<Sheet>` / `<SheetContent side="right">` | `<ResponsiveDialog variant="panel" sheetSide="right">` |
| `<AlertDialog>` | `<ResponsiveDialog variant="alert">` |
| `<DialogHeader>` | `<ResponsiveDialog.Header>` |
| `<DialogTitle>` | `<ResponsiveDialog.Title>` |
| `<DialogDescription>` | `<ResponsiveDialog.Description>` |
| inline `<div className="py-4">body</div>` | `<ResponsiveDialog.Body>` |
| `<DialogFooter>` | `<ResponsiveDialog.Footer>` |
| `<AlertDialogCancel>`/`<AlertDialogAction>` | Plain `<Button>` with `onOpenChange(false)` — these primitives need AlertDialog context which doesn't exist when mobile renders as Drawer. |

## Patterns

### Form with footer that lives outside the scrolling body

Two valid layouts. Pick either — both keep Body scrollable and Footer pinned.

**(A) form inside Body** (preferred — cleanest wiring):

```tsx
<ResponsiveDialog variant="modal" size="md">
  <ResponsiveDialog.Header>...</ResponsiveDialog.Header>
  <ResponsiveDialog.Body>
    <form id="my-form" onSubmit={handleSubmit}>...</form>
  </ResponsiveDialog.Body>
  <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button type="submit" form="my-form">Save</Button>
  </ResponsiveDialog.Footer>
</ResponsiveDialog>
```

**(B) form wrapping Body + Footer** (submit button doesn't need `form="..."`):

The form must participate in the flex chain, or Body loses its constrained
height and never scrolls. Add `className="flex min-h-0 flex-1 flex-col"`:

```tsx
<ResponsiveDialog variant="modal" size="md">
  <ResponsiveDialog.Header>...</ResponsiveDialog.Header>
  <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
    <ResponsiveDialog.Body>...</ResponsiveDialog.Body>
    <ResponsiveDialog.Footer>
      <Button type="submit">Save</Button>
    </ResponsiveDialog.Footer>
  </form>
</ResponsiveDialog>
```

### Tabs with internal scroll regions

```tsx
<ResponsiveDialog variant="modal" size="xl">
  <ResponsiveDialog.Header>...</ResponsiveDialog.Header>
  <ResponsiveDialog.Body className="flex flex-col overflow-hidden">
    <Tabs className="flex-1 flex flex-col min-h-0">
      <TabsList>...</TabsList>
      <div className="flex-1 min-h-0 relative mt-4">
        <TabsContent className="absolute inset-0 overflow-hidden">...</TabsContent>
      </div>
    </Tabs>
  </ResponsiveDialog.Body>
</ResponsiveDialog>
```

### Destructive confirmation (alert variant)

```tsx
<ResponsiveDialog variant="alert" size="md">
  <ResponsiveDialog.Header>
    <ResponsiveDialog.Title>Delete workspace?</ResponsiveDialog.Title>
    <ResponsiveDialog.Description>This cannot be undone.</ResponsiveDialog.Description>
  </ResponsiveDialog.Header>
  <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="destructive" onClick={confirm}>Delete</Button>
  </ResponsiveDialog.Footer>
</ResponsiveDialog>
```

## Optional state hook

```tsx
import { useResponsiveDialog } from "@/hooks/use-responsive-dialog"

const { open, onOpenChange, openDialog, closeDialog, isMobile } = useResponsiveDialog()
```

Use this when a dialog is opened from a menu/trigger and you don't want to write boilerplate `useState`.
