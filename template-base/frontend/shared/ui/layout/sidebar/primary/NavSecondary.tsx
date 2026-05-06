"use client"

import * as React from "react"
import { IconBrightness } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import {
  SecondarySidebarLayout,
} from "../secondary"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type SecondaryItem = {
  title: string
  url: string
  icon?: React.ElementType
}

export function NavSecondary({
  items = [],
  ...props
}: {
  items?: SecondaryItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { isMobile, setOpenMobile } = useSidebar();

  // Handler to close mobile sidebar when menu is clicked
  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const secondaryMenu = (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link href={item.url} onClick={handleMenuClick}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent className="p-0">
        <SecondarySidebarLayout.Sidebar
          variant="minimal"
          sections={[
            {
              id: "secondary-nav",
              content: secondaryMenu,
            },
          ]}
          className="bg-transparent"
          contentClassName="space-y-2 overflow-visible px-0 py-0"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
