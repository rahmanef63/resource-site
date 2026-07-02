"use client"

import * as React from "react"
import * as Icons from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ADMIN_CONSOLE_SECTIONS,
  type AdminAccess,
  type AdminConsoleSection,
  type AdminTier,
} from "../lib/sections"
import { canSeeAdmin, filterSections } from "../lib/access"
import { useAdminSection } from "../hooks/useAdminSection"
import { AnalyticsDashboard } from "./sections/AnalyticsDashboard"
import { AuditLogViewer } from "./sections/AuditLogViewer"
import { NavConfigManager } from "./sections/NavConfigManager"
import { LeadsInbox } from "./sections/LeadsInbox"
import { SeoHealthPanel } from "./sections/SeoHealthPanel"

/** The 5 gap sections this slice owns, wired with mock defaults. */
const OWNED: Record<string, React.ReactNode> = {
  analytics: <AnalyticsDashboard />,
  "audit-log": <AuditLogViewer />,
  "nav-config": <NavConfigManager />,
  "seo-health": <SeoHealthPanel />,
  leads: <LeadsInbox />,
}

export interface AdminConsoleProps {
  /** Injected access — consumer's useAdminAccess result or a mock. */
  access: AdminAccess
  tier?: AdminTier
  /** Section catalog. Defaults to the harvested ADMIN_CONSOLE_SECTIONS. */
  sections?: readonly AdminConsoleSection[]
  /**
   * Consumer-supplied nodes for reuse sections (id → element), e.g.
   * `{ users: <UsersPanel/> }` from the installed user-management slice.
   * Also overrides an owned section when you want to pass real data.
   */
  components?: Record<string, React.ReactNode>
  /** Controlled active section id (omit for internal URL-synced state). */
  activeId?: string
  onNavigate?: (id: string) => void
  /** Optional node in the section header row — e.g. a notifications bell. */
  headerSlot?: React.ReactNode
}

function icon(name: string) {
  const I = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  return I ?? Icons.Square
}

/**
 * Admin Console — the composed admin panel. Left: gated section nav grouped by
 * area. Right: the active section — an owned gap component, a consumer-mounted
 * reuse component, or a "not installed" hint naming the slice that supplies it.
 *
 * Renders no app chrome of its own; mount inside your dashboard shell.
 */
export function AdminConsole({
  access,
  tier = "org",
  sections = ADMIN_CONSOLE_SECTIONS,
  components,
  activeId,
  onNavigate,
  headerSlot,
}: AdminConsoleProps) {
  const visible = React.useMemo(() => filterSections(sections, access, tier), [sections, access, tier])
  const internal = useAdminSection(visible)
  const active = activeId ?? internal.activeId
  const go = (id: string) => {
    onNavigate?.(id)
    if (!activeId) internal.navigate(id)
  }

  if (access.isLoading) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
  }
  if (!canSeeAdmin(access)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">Admin console unavailable</p>
        <p className="max-w-md text-xs text-muted-foreground">
          You don&apos;t have admin access. Ask an owner to grant a permission, or set{" "}
          <code>PLATFORM_ADMIN_EMAILS</code> on the backend.
        </p>
      </div>
    )
  }

  const section = visible.find((s) => s.id === active)
  const groups = Array.from(new Set(visible.map((s) => s.group)))

  return (
    <div className="grid h-full w-full grid-cols-[220px_1fr]">
      <nav className="border-r bg-muted/30">
        <ScrollArea className="h-full p-2">
          {groups.map((g) => (
            <div key={g} className="mb-3">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{g}</p>
              {visible
                .filter((s) => s.group === g)
                .map((s) => {
                  const Ic = icon(s.icon)
                  return (
                    <Button
                      key={s.id}
                      variant="ghost"
                      onClick={() => go(s.id)}
                      className={cn(
                        "h-auto w-full justify-start gap-2 px-2 py-1.5 font-normal",
                        s.id === active && "bg-accent font-medium",
                      )}
                    >
                      <Ic className="size-4 shrink-0" />
                      <span className="flex-1 text-left">{s.label}</span>
                      {s.provider === "self" && (
                        <Badge variant="secondary" className="px-1 py-0 text-[9px]">
                          new
                        </Badge>
                      )}
                    </Button>
                  )
                })}
            </div>
          ))}
        </ScrollArea>
      </nav>

      <main className="overflow-y-auto p-4">
        {(section || headerSlot) && (
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{section?.label}</h2>
            {headerSlot}
          </div>
        )}
        <SectionBody section={section} components={components} />
      </main>
    </div>
  )
}

function SectionBody({
  section,
  components,
}: {
  section?: AdminConsoleSection
  components?: Record<string, React.ReactNode>
}) {
  if (!section) return <p className="text-sm text-muted-foreground">Select a section.</p>
  const override = components?.[section.id]
  if (override !== undefined) return <>{override}</>
  if (section.provider === "self") return <>{OWNED[section.id]}</>
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-sm font-medium">{section.label} not mounted</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Install the <code>{section.provider}</code> slice and pass its panel via{" "}
        <code>components={`{{ "${section.id}": <Panel/> }}`}</code>.
      </p>
    </div>
  )
}
