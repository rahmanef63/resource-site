import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MemberInfoHeader } from "./MemberInfoHeader";
import { MemberInfoContent } from "./MemberInfoContent";
import { MEMBER_INFO_SECTIONS, DEFAULT_MEMBER_INFO_SECTION } from "./constants";
import type { MemberInfoContact, MemberInfoSection } from "./types";

export type MemberInfoModalProps = {
  contact: MemberInfoContact;
  isOpen: boolean;
  onClose: () => void;
};

export function MemberInfoModal({
  contact,
  isOpen,
  onClose,
}: MemberInfoModalProps) {
  const [activeSection, setActiveSection] =
    useState<MemberInfoSection>(DEFAULT_MEMBER_INFO_SECTION);
  const isMobile = useIsMobile();

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={[
          "p-0 bg-background border border-border",
          isMobile
            ? "max-w-full w-full h-full m-0 rounded-none"
            : "max-w-5xl w-full h-[90vh] rounded-lg",
        ].join(" ")}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {contact.name} Member Information
        </DialogTitle>
        <DialogDescription className="sr-only">
          Review contact details, shared items, and member activity for {contact.name}.
        </DialogDescription>

        <SidebarProvider defaultOpen={!isMobile}>
          <div className="flex h-full w-full">
            <Sidebar
              variant="sidebar"
              collapsible={isMobile ? "offcanvas" : "none"}
              className="w-80 border-r border-sidebar-border"
            >
              <SidebarHeader className="p-0">
                <MemberInfoHeader onClose={onClose} />
              </SidebarHeader>

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {MEMBER_INFO_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                          <SidebarMenuItem key={section.id}>
                            <SidebarMenuButton
                              isActive={activeSection === section.id}
                              onClick={() => setActiveSection(section.id)}
                              className="w-full justify-start"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{section.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <main className="flex-1 bg-background">
              <MemberInfoContent
                activeSection={activeSection}
                contact={contact}
                isMobile={isMobile}
              />
            </main>
          </div>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
