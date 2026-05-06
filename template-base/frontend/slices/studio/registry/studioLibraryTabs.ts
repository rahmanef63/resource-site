/**
 * Studio Library Tabs
 *
 * THREE-TAB SYSTEM:
 *   Elements   — semantic HTML primitives (box, text, image, form controls)
 *   Components — shadcn/ui + custom UI building blocks
 *   Blocks     — composite section-level components (hero, navbar, chart, etc.)
 */

import type { FeatureTab } from '@/frontend/shared/foundation';
import {
  Box,
  Component,
  Boxes,
  Workflow,
  LayoutGrid,
} from 'lucide-react';

// Icons for UnifiedLibrary tab headers
export const STUDIO_TAB_ICONS = {
  elements: Box,
  components: Component,
  blocks: Boxes,
  workflow: Workflow,
  all: LayoutGrid,
} as const;

export function registerStudioLibraryTabs(
  registerFeatureTabs: (feature: string, tabs: FeatureTab[]) => void
): void {
  const studioLibraryTabs: FeatureTab[] = [
    // =========================================================================
    // ELEMENTS — HTML semantic primitives
    //   Layout: div, section (Page), grid, flex, twoColumn, threeColumn
    //   Content: text, image
    //   Actions: button, link
    //   Form controls: input, textarea, select, checkbox, radioGroup,
    //                  switch, label, slider, toggle
    //   Utility: spacer, separator
    // =========================================================================
    {
      id: 'elements',
      label: 'Elements',
      feature: 'studio',
      categories: ['Elements'],
    },

    // =========================================================================
    // COMPONENTS — shadcn/ui + custom UI building blocks
    //   accordion, alert, alertDialog, aspectRatio, avatar, badge, breadcrumb
    //   buttonGroup, card, carousel, collapsible, command, contextMenu
    //   dialog, drawer, dropdownMenu, formGroup, hoverCard, iconButton
    //   inputGroup, popover, progress, resizable, scrollArea, sheet, skeleton
    //   sonner, table, tabs, toggleGroup, tooltip
    //   navGroup, navItem, sidebarNav
    // =========================================================================
    {
      id: 'components',
      label: 'Components',
      feature: 'studio',
      categories: ['Components'],
    },

    // =========================================================================
    // BLOCKS — composite section-level components
    //   UI: hero, heroComposite, navbarBlock, footerBlock,
    //       pricingCardBlock, testimonialBlock
    //   Data: chartBlock, kanbanBlock, tableBlock, calendarBlock,
    //         filterBlock, fileBlock, commentBlock, richTextBlock, formBlock,
    //         mediaBlock, profileBlock, metricCardBlock, activityBlock,
    //         listBlock, eventsBlock, statsBlock, agentBlock, teamBlock,
    //         timeRangeBlock
    // =========================================================================
    {
      id: 'blocks',
      label: 'Blocks',
      feature: 'studio',
      categories: ['Blocks'],
    },

    // =========================================================================
    // WORKFLOW — Automation and logic nodes
    // =========================================================================
    {
      id: 'workflow',
      label: 'Workflow',
      feature: 'studio',
      categories: ['Trigger', 'HTTP', 'Data', 'Logic', 'Integration', 'AI', 'LLM', 'Error'],
    },

    // =========================================================================
    // ALL — Discovery (search everything)
    // =========================================================================
    {
      id: 'all',
      label: 'All',
      feature: 'studio',
      categories: [
        'Elements',
        'Components',
        'Blocks',
        'Trigger', 'HTTP', 'Data', 'Logic', 'Integration', 'AI', 'LLM', 'Error',
      ],
    },
  ];

  registerFeatureTabs('studio', studioLibraryTabs);
}
