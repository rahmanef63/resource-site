/**
 * Form Group Widget
 *
 * A form field wrapper that provides label, description, and error message
 * around any form input widget (input, select, textarea, checkbox, etc.).
 *
 * Usage in JSON:
 *   formGroup (label="Email") → input (type="email")
 */
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { FormInput } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const formGroupRender = (p: Record<string, any>, children?: React.ReactNode) => {
  const id = p.fieldId || `field-${Math.random().toString(36).slice(2, 7)}`;
  const isHorizontal = p.layout === 'horizontal';

  return (
    <div className={cn(
      'flex gap-2',
      isHorizontal ? 'flex-row items-start' : 'flex-col',
      p.className || '',
    )}>
      {p.label && (
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium text-slate-700 flex items-center gap-1',
            isHorizontal && 'w-32 flex-shrink-0 pt-2',
          )}
        >
          {p.label}
          {p.required && <span className="text-red-500 text-xs">*</span>}
        </label>
      )}
      <div className={cn('flex flex-col gap-1', isHorizontal && 'flex-1')}>
        {children}
        {p.description && (
          <p className="text-xs text-slate-500">{p.description}</p>
        )}
        {p.error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {p.error}
          </p>
        )}
      </div>
    </div>
  );
};

export const formGroupManifest: WidgetConfig = {
  label: 'Form Group',
  category: 'Form',
  description: 'Wraps a form input with label, description, and error message. Place any form widget inside.',
  icon: FormInput,
  tags: ['form', 'label', 'field', 'group', 'input'],
  defaults: {
    label: 'Field Label',
    description: '',
    error: '',
    required: false,
    layout: 'vertical',
    fieldId: '',
    className: '',
  },
  render: formGroupRender,
  inspector: {
    fields: [
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Field Label' },
      { key: 'description', label: 'Help Text', type: 'text', placeholder: 'Describe this field...' },
      { key: 'error', label: 'Error Message', type: 'text', placeholder: 'This field is required' },
      { key: 'required', label: 'Required', type: 'switch' },
      {
        key: 'layout', label: 'Layout', type: 'select',
        options: ['vertical', 'horizontal'],
      },
      { key: 'fieldId', label: 'Field ID', type: 'text', placeholder: 'email-field' },
      { key: 'className', label: 'CSS Classes', type: 'text', placeholder: '' },
    ],
  },
};
