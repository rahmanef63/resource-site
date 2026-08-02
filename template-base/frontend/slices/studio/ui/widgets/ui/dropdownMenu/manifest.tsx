import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export const dropdownMenuManifest: WidgetConfig = {
  label: 'Dropdown Menu',
  category: 'Components',
  description: 'Context dropdown menu with a trigger button.',
  icon: ChevronDown,
  defaults: {
    triggerText: 'Options',
    label: 'My Account',
    items: ['Profile', 'Settings', 'Logout'],
    className: '',
  },
  render: (props) => {
    const p = props as any;
    const items: string[] = p.items ?? ['Profile', 'Settings', 'Logout'];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={p.className}>
            {p.triggerText} <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {p.label && <DropdownMenuLabel>{p.label}</DropdownMenuLabel>}
          {p.label && <DropdownMenuSeparator />}
          {items.map((item: string, i: number) => (
            <DropdownMenuItem key={i}>{item}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'triggerText', label: 'Trigger Text', type: 'text' }),
      createCustomField({ key: 'label', label: 'Group Label', type: 'text' }),
    ],
  },
};
