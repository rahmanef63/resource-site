import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./NavigationItem";
import { MEMBER_INFO_SECTIONS } from "./constants";
import type { MemberInfoSection } from "./types";

export type MemberInfoSidebarProps = {
  activeSection: MemberInfoSection;
  onSectionChange: (section: MemberInfoSection) => void;
  isMobile: boolean;
};

export function MemberInfoSidebar({
  activeSection,
  onSectionChange,
  isMobile,
}: MemberInfoSidebarProps) {
  if (isMobile) {
    return (
      <div className="border-b border-wa-border bg-wa-surface p-2">
        <div className="flex gap-1 overflow-x-auto">
          {MEMBER_INFO_SECTIONS.map((item) => (
            <NavigationItem
              key={item.id}
              {...item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              isMobile
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 border-r border-wa-border bg-wa-surface">
      <ScrollArea className="h-full wa-scrollbar">
        <div className="p-2">
          {MEMBER_INFO_SECTIONS.map((item) => (
            <NavigationItem
              key={item.id}
              {...item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              isMobile={false}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
