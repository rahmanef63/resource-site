/**
 * Sidebar Nav Widget
 *
 * A fixed-width sidebar container with built-in scroll area for navigation.
 * Use className for Tailwind styling. Children are rendered in a scrollable area.
 *
 * For full-page layouts:
 *   div (flex h-screen) → sidebarNav + main content
 */
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const sidebarNavRender = (p: Record<string, any>, children?: React.ReactNode) => {
  const widthClass = p.width === 'narrow' ? 'w-48' : p.width === 'wide' ? 'w-80' : 'w-64';
  return (
    <aside
      className={cn(
        'flex flex-col flex-shrink-0 h-full',
        widthClass,
        p.border !== false && 'border-r border-slate-200',
        p.background && p.background !== 'none' ? `bg-${p.background}` : 'bg-white',
        p.className || '',
      )}
    >
      {p.header && (
        <div className="flex items-center h-16 px-4 border-b border-slate-200 flex-shrink-0">
          <span className="font-semibold text-sm text-slate-900">{p.header}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-2">
        {children}
      </div>
      {p.footer && (
        <div className="border-t border-slate-200 p-4 flex-shrink-0 text-xs text-slate-500">
          {p.footer}
        </div>
      )}
    </aside>
  );
};

export const sidebarNavManifest: WidgetConfig = {
  label: 'Sidebar Nav',
  category: 'Navigation',
  description: 'Fixed-width sidebar container with built-in scroll area. Use for app sidebars with nav items.',
  icon: PanelLeft,
  tags: ['sidebar', 'nav', 'navigation', 'layout', 'aside'],
  defaults: {
    width: 'default',
    border: true,
    background: 'white',
    header: '',
    footer: '',
    className: '',
  },
  render: sidebarNavRender,
  inspector: {
    fields: [
      { key: 'header', label: 'Header Label', type: 'text', placeholder: 'My App' },
      { key: 'footer', label: 'Footer Text', type: 'text', placeholder: '' },
      {
        key: 'width', label: 'Width', type: 'select',
        options: ['narrow', 'default', 'wide'],
      },
      {
        key: 'background', label: 'Background', type: 'select',
        options: ['white', 'gray-50', 'gray-900', 'slate-800', 'none'],
      },
      { key: 'border', label: 'Show Border', type: 'switch' },
      { key: 'className', label: 'CSS Classes', type: 'text', placeholder: 'extra-class ...' },
    ],
  },
};
