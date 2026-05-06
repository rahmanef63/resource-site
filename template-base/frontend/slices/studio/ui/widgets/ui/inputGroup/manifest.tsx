import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { InputGroup, InputGroupText, InputGroupAddon } from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import { TextCursorInput } from 'lucide-react';

export const inputGroupManifest: WidgetConfig = {
  label: 'Input Group',
  category: 'Components',
  description: 'Input with prefix/suffix addon text.',
  icon: TextCursorInput,
  defaults: {
    placeholder: 'Search...',
    prefix: 'https://',
    suffix: '',
    className: '',
  },
  render: (props) => {
    const p = props as any;
    return (
      <InputGroup className={p.className}>
        {p.prefix && (
          <InputGroupAddon align="inline-start">
            <InputGroupText>{p.prefix}</InputGroupText>
          </InputGroupAddon>
        )}
        <Input placeholder={p.placeholder} />
        {p.suffix && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{p.suffix}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'placeholder', label: 'Placeholder', type: 'text' }),
      createCustomField({ key: 'prefix', label: 'Prefix', type: 'text' }),
      createCustomField({ key: 'suffix', label: 'Suffix', type: 'text' }),
    ],
  },
};
