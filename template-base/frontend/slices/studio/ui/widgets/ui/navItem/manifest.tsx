/**
 * Nav Item Widget
 *
 * A single navigation item for sidebars and nav menus.
 * Supports icon, label, badge, active state, and indent level.
 *
 * Used inside sidebarNav or any navigation container.
 */
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { ListCollapse } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

// Dynamic icon rendering via lucide-icons string name
const NavItemRender = (p: Record<string, any>, children?: React.ReactNode) => {
  const indent = Number(p.indent || 0);
  const isActive = p.active === true || p.active === 'true';
  const isDark = p.theme === 'dark';

  const base = cn(
    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors w-full',
    indent > 0 && `ml-${Math.min(indent * 4, 12)}`,
    isActive
      ? isDark
        ? 'bg-white/10 text-white'
        : 'bg-blue-50 text-blue-700'
      : isDark
        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    p.className || '',
  );

  const inner = (
    <>
      {p.icon && (
        <span className="text-current opacity-70 w-4 h-4 flex-shrink-0 text-[16px] leading-none">
          {p.icon}
        </span>
      )}
      <span className="flex-1 truncate">{p.label || 'Nav Item'}</span>
      {p.badge && (
        <span className={cn(
          'ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium',
          isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600',
        )}>
          {p.badge}
        </span>
      )}
    </>
  );

  if (p.href) {
    return (
      <a href={p.href} className={base}>
        {inner}
      </a>
    );
  }

  return (
    <div className={base} role="button">
      {inner}
      {children}
    </div>
  );
};

export const navItemManifest: WidgetConfig = {
  label: 'Nav Item',
  category: 'Navigation',
  description: 'A single navigation menu item with optional icon, badge, and active state.',
  icon: ListCollapse,
  tags: ['nav', 'menu', 'item', 'sidebar', 'link'],
  defaults: {
    label: 'Menu Item',
    href: '',
    icon: '',
    badge: '',
    active: false,
    indent: 0,
    theme: 'light',
    className: '',
  },
  render: NavItemRender,
  inspector: {
    fields: [
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Menu Item' },
      { key: 'href', label: 'Link URL', type: 'text', placeholder: '/dashboard' },
      { key: 'icon', label: 'Icon (emoji or text)', type: 'text', placeholder: '🏠' },
      { key: 'badge', label: 'Badge', type: 'text', placeholder: '3' },
      { key: 'active', label: 'Active State', type: 'switch' },
      {
        key: 'indent', label: 'Indent Level', type: 'select',
        options: ['0', '1', '2', '3'],
      },
      {
        key: 'theme', label: 'Theme', type: 'select',
        options: ['light', 'dark'],
      },
      { key: 'className', label: 'CSS Classes', type: 'text', placeholder: '' },
    ],
  },
};
