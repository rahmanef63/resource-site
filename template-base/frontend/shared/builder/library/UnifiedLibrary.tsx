import React, { useState, useRef, useEffect } from 'react';
import { Input, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import type { FeatureTab, ComponentConfig } from '@/frontend/shared/foundation';
import { DraggableLibraryItem } from './DraggableLibraryItem';
import { getCategoryIcon, getFeatureIcon } from '@/frontend/shared/ui';
import type { LucideIcon } from 'lucide-react';

// Thumbnail background colours per component category (L-1)
const CATEGORY_THUMB_BG: Record<string, string> = {
  layout:     'bg-blue-500/10',
  content:    'bg-emerald-500/10',
  media:      'bg-purple-500/10',
  form:       'bg-orange-500/10',
  navigation: 'bg-cyan-500/10',
  blocks:     'bg-rose-500/10',
  templates:  'bg-amber-500/10',
  workflow:   'bg-indigo-500/10',
  ui:         'bg-teal-500/10',
};
const CATEGORY_THUMB_TEXT: Record<string, string> = {
  layout:     'text-blue-500/70',
  content:    'text-emerald-500/70',
  media:      'text-purple-500/70',
  form:       'text-orange-500/70',
  navigation: 'text-cyan-500/70',
  blocks:     'text-rose-500/70',
  templates:  'text-amber-500/70',
  workflow:   'text-indigo-500/70',
  ui:         'text-teal-500/70',
};

interface UnifiedLibraryProps {
  currentFeature: 'cms' | 'automation' | 'database' | 'studio';
  onAdd?: (componentKey: string, category: string) => void;
  /** Optional per-feature tab icon override map. Studio passes its own. */
  tabIcons?: Record<string, React.ComponentType<{ className?: string }>>;
}

export const UnifiedLibrary: React.FC<UnifiedLibraryProps> = ({ currentFeature, onAdd }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { getFeatureTabs, getComponentsForTab } = useCrossFeatureRegistry();

  // ⌘F / Ctrl+F focuses the search input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentTabs = getFeatureTabs(currentFeature);

  const getFilteredComponents = (tabId: string): ComponentConfig[] => {
    const tab = currentTabs.find((t: FeatureTab) => t.id === tabId);
    if (!tab) return [];

    const components = getComponentsForTab(tab.feature, tabId);
    return components.filter(
      (comp: ComponentConfig) =>
        comp.label.toLowerCase().includes(query.toLowerCase()) ||
        comp.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const renderComponentGrid = (components: ComponentConfig[]) => {
    if (components.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <p className="text-xs text-muted-foreground text-center">
            {query
              ? 'No components match your search.'
              : 'No components available in this category.'}
          </p>
        </div>
      );
    }
    // Flat grid - no category grouping (tabs already filter by category)
    return (
      <div className="grid grid-cols-2 gap-2">
        {components.map((component: ComponentConfig) => {
          const CatIconI = (component.icon as LucideIcon) || getCategoryIcon(component.category);
          const thumbBg = CATEGORY_THUMB_BG[component.category] ?? 'bg-muted/60';
          const thumbText = CATEGORY_THUMB_TEXT[component.category] ?? 'text-muted-foreground';
          return (
            <DraggableLibraryItem
              key={component.key}
              componentKey={component.key}
              label={component.label}
              description={component.description}
              icon={CatIconI}
              category={component.category}
              feature={component.feature}
            >
              <TooltipProvider delayDuration={600}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => onAdd?.(component.key, component.category)}
                      className="rounded-lg border border-border bg-card/50 overflow-hidden hover:border-primary/40 hover:bg-card transition-all group cursor-pointer"
                    >
                      {/* Thumbnail area */}
                      <div className={`h-10 flex items-center justify-center border-b border-border/50 ${thumbBg} transition-colors group-hover:opacity-90`}>
                        {CatIconI
                          ? <CatIconI size={18} className={`${thumbText} transition-colors group-hover:text-primary/80`} />
                          : <span className={`text-xs font-bold ${thumbText}`}>{component.label.charAt(0)}</span>
                        }
                      </div>
                      {/* Label */}
                      <div className="px-2 py-1.5">
                        <div className="text-[10px] font-medium truncate text-foreground/90 leading-tight">
                          {component.label}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {(component.description || component.key) && (
                    <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                      <p className="font-medium">{component.label}</p>
                      {component.description && (
                        <p className="text-muted-foreground mt-0.5">{component.description}</p>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </DraggableLibraryItem>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search... (⌘F / Ctrl+F)"
        />
      </div>

      <Tabs defaultValue={currentTabs[0]?.id || 'layout'} className="flex-1 flex flex-col min-h-0">
        <TabsList className="px-2 pt-2 flex flex-wrap gap-1 h-auto justify-evenly bg-transparent">
          {currentTabs.map((tab: FeatureTab, idx: number) => {
            const TabIcon = getFeatureIcon(tab.feature);
            // Add a visual separator between 'blocks' and 'workflow' tabs (N-L2)
            const prevTab = idx > 0 ? currentTabs[idx - 1] : null;
            const needsSeparator = prevTab?.id === 'blocks' && tab.id === 'workflow';
            return (
              <React.Fragment key={tab.id}>
                {needsSeparator && (
                  <div className="w-px h-4 bg-border mx-1 self-center shrink-0" />
                )}
                <TabsTrigger
                  value={tab.id}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 h-auto data-[state=active]:bg-muted"
                >
                  {TabIcon && <TabIcon size={14} />}
                  {tab.label}
                </TabsTrigger>
              </React.Fragment>
            );
          })}
        </TabsList>

        <ScrollArea className="flex-1">
          {currentTabs.map((tab: FeatureTab) => (
            <TabsContent key={tab.id} value={tab.id} className="p-3">
              {renderComponentGrid(getFilteredComponents(tab.id))}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
};
