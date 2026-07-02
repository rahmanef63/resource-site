/**
 * Right Panel Tabs Component
 * Tabbed interface for Preview and SEO Score with auto-switching
 */

import { cn } from "@/lib/utils";
import { Eye, TrendingUp } from "lucide-react";
import type { RightPanelTab } from "../types";

interface RightPanelTabsProps {
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  previewContent: React.ReactNode;
  seoContent: React.ReactNode;
}

export function RightPanelTabs({
  activeTab,
  onTabChange,
  previewContent,
  seoContent,
}: RightPanelTabsProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50 mb-4">
        <button
          onClick={() => onTabChange('preview')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-300",
            "text-sm font-medium",
            activeTab === 'preview'
              ? "bg-background dark:bg-background/80 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20 dark:hover:bg-muted/10"
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
        
        <button
          onClick={() => onTabChange('seo')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-300",
            "text-sm font-medium",
            activeTab === 'seo'
              ? "bg-background dark:bg-background/80 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20 dark:hover:bg-muted/10"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>SEO Score</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            "transition-all duration-300",
            activeTab === 'preview' ? "block" : "hidden"
          )}
        >
          {previewContent}
        </div>
        
        <div
          className={cn(
            "transition-all duration-300",
            activeTab === 'seo' ? "block" : "hidden"
          )}
        >
          {seoContent}
        </div>
      </div>
    </div>
  );
}
