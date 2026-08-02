import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { Terminal } from 'lucide-react';

export const commandManifest: WidgetConfig = {
  label: 'Command',
  category: 'Components',
  description: 'Command palette with search and grouped items.',
  icon: Terminal,
  defaults: {
    placeholder: 'Search commands...',
    emptyText: 'No results found.',
    groups: [
      { label: 'Suggestions', items: ['Calendar', 'Search Emoji', 'Calculator'] },
      { label: 'Settings', items: ['Profile', 'Billing', 'Settings'] },
    ],
    className: '',
  },
  render: (props) => {
    const p = props as any;
    const groups = p.groups ?? [];
    return (
      <Command className={`rounded-lg border shadow-md ${p.className ?? ''}`}>
        <CommandInput placeholder={p.placeholder} />
        <CommandList>
          <CommandEmpty>{p.emptyText}</CommandEmpty>
          {groups.map((group: any, gi: number) => (
            <React.Fragment key={gi}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={group.label}>
                {(group.items ?? []).map((item: string, ii: number) => (
                  <CommandItem key={ii}>{item}</CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'placeholder', label: 'Placeholder', type: 'text' }),
      createCustomField({ key: 'emptyText', label: 'Empty State Text', type: 'text' }),
    ],
  },
};
