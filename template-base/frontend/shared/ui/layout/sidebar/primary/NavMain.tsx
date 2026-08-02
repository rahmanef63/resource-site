"use client"

import React from "react"
import Link from "next/link"
import type { Id } from "@/convex/_generated/dataModel"
import type { ElementType, ReactElement } from "react"
import { ChevronRight } from "lucide-react"

import { getDefaultPages } from "@/frontend/shared/foundation/manifest"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { FeatureTag, getFeatureTagFromMetadata, type FeatureTagType } from "@/frontend/shared/ui/components/feature-tag"
import { cn } from "@/lib/utils"
import { useIsGuestMode } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"

interface NavItem {
  id: string
  title: string
  description?: string
  icon?: ElementType
  isActive?: boolean
  url?: string
  children?: NavItem[]
  metadata?: Record<string, any>
  tag?: FeatureTagType
  isGroup?: boolean  // true if type is "group" - indicates non-navigable container
}

interface NavMainProps {
  workspaceId: Id<"workspaces"> | string | null
  activeView: string
  onViewChange?: (view: string) => void
  items?: NavItem[]
  /** Workspace color for accent styling (hex color) */
  workspaceColor?: string
}

export const NavMain = React.memo(function NavMain({ workspaceId, activeView, onViewChange, items, workspaceColor }: NavMainProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const isGuestMode = useIsGuestMode()

  // Base URL for navigation - "/dashboard" for authenticated, "/mock-dashboard" for guest
  const baseUrl = isGuestMode ? "/mock-dashboard" : "/dashboard"

  const fallback = getDefaultPages().map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    icon: p.icon,
  }))
  const navItems: NavItem[] = items && items.length > 0 ? items : fallback


  // Handler to close mobile sidebar when menu is clicked
  const handleMenuClick = (viewId: string) => {
    if (isMobile) {
      setOpenMobile(false)
    }
    onViewChange?.(viewId)
  }

  // Generate CSS custom properties for workspace color
  const colorStyles = workspaceColor ? {
    "--workspace-color": workspaceColor,
    "--workspace-color-light": `${workspaceColor}20`, // 12% opacity
  } as React.CSSProperties : undefined

  // Recursive function to render nested menu items
  const renderNavItem = (item: NavItem, depth: number = 0): ReactElement => {
    const hasChildren = item.children && item.children.length > 0
    const isActive = activeView === item.id
    const featureTag = item.tag || getFeatureTagFromMetadata(item.metadata)

    // Active item styles with workspace color
    const activeStyles = isActive && workspaceColor ? {
      backgroundColor: `${workspaceColor}15`,
      borderLeft: `3px solid ${workspaceColor}`,
    } : undefined

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          asChild
          defaultOpen={item.isActive || isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.description}
                isActive={isActive}
                style={activeStyles}
                className={cn(
                  isActive && workspaceColor && "border-l-0 ml-[-3px] pl-[calc(0.5rem+3px)]"
                )}
              >
                {item.icon && <item.icon />}
                <span className="flex-1">{item.title}</span>
                {featureTag && <FeatureTag type={featureTag} compact />}
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children?.map((subItem) => {
                  const subFeatureTag = (subItem as NavItem).tag || getFeatureTagFromMetadata((subItem as NavItem).metadata)
                  const subIsActive = activeView === subItem.id
                  const subActiveStyles = subIsActive && workspaceColor ? {
                    backgroundColor: `${workspaceColor}15`,
                    borderLeft: `2px solid ${workspaceColor}`,
                  } : undefined

                  return (
                    <SidebarMenuSubItem key={subItem.id}>
                      {subItem.children && subItem.children.length > 0 ? (
                        // Nested child with more children - render as collapsible
                        <Collapsible
                          defaultOpen={subItem.isActive || activeView === subItem.id}
                          className="group/nested-collapsible"
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton style={subActiveStyles}>
                              {subItem.icon && <subItem.icon className="w-4 h-4" />}
                              <span className="flex-1">{subItem.title}</span>
                              {subFeatureTag && <FeatureTag type={subFeatureTag} compact />}
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/nested-collapsible:rotate-90" />
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="pl-4">
                              {subItem.children?.map((nestedItem) => {
                                const nestedFeatureTag = (nestedItem as NavItem).tag || getFeatureTagFromMetadata((nestedItem as NavItem).metadata)
                                const nestedIsActive = activeView === nestedItem.id
                                const nestedActiveStyles = nestedIsActive && workspaceColor ? {
                                  backgroundColor: `${workspaceColor}15`,
                                  borderLeft: `2px solid ${workspaceColor}`,
                                } : undefined

                                return (
                                  <SidebarMenuSubButton key={nestedItem.id} asChild>
                                    <Link
                                      href={nestedItem.url || `${baseUrl}/${item.id}/${subItem.id}/${nestedItem.id}`}
                                      onClick={() => handleMenuClick(nestedItem.id)}
                                      className={nestedIsActive && !workspaceColor ? "bg-accent" : ""}
                                      style={nestedActiveStyles}
                                    >
                                      {nestedItem.icon && <nestedItem.icon className="w-4 h-4" />}
                                      <span className="flex-1">{nestedItem.title}</span>
                                      {nestedFeatureTag && <FeatureTag type={nestedFeatureTag} compact />}
                                    </Link>
                                  </SidebarMenuSubButton>
                                )
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        // Leaf node - render as link
                        <SidebarMenuSubButton asChild>
                          <Link
                            href={subItem.url || `${baseUrl}/${item.id}/${subItem.id}`}
                            onClick={() => handleMenuClick(subItem.id)}
                            className={subIsActive && !workspaceColor ? "bg-accent" : ""}
                            style={subActiveStyles}
                          >
                            {subItem.icon && <subItem.icon className="w-4 h-4" />}
                            <span className="flex-1">{subItem.title}</span>
                            {subFeatureTag && <FeatureTag type={subFeatureTag} compact />}
                          </Link>
                        </SidebarMenuSubButton>
                      )}
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          tooltip={item.description}
          isActive={isActive}
          style={activeStyles}
          className={cn(
            isActive && workspaceColor && "border-l-0 ml-[-3px] pl-[calc(0.5rem+3px)]"
          )}
        >
          <Link
            href={item.url || `${baseUrl}/${item.id}`}
            onClick={() => handleMenuClick(item.id)}
          >
            {item.icon && <item.icon />}
            <span className="flex-1">{item.title}</span>
            {featureTag && <FeatureTag type={featureTag} compact />}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarGroup style={colorStyles}>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => renderNavItem(item))}
      </SidebarMenu>
    </SidebarGroup>
  )
})
