'use client';

import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ButtonAction = 'url' | 'email' | 'phone' | 'copy' | 'webhook';
type ButtonStyle = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

interface ButtonConfig {
  label?: string;
  action?: ButtonAction;
  style?: ButtonStyle;
  confirmMessage?: string;
}

export const ButtonEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property }) => {
  const [localValue, setLocalValue] = useState(value ? String(value) : '');

  useEffect(() => {
    setLocalValue(value ? String(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue || null);
  };

  const config: ButtonConfig = (property.options as ButtonConfig) || {};
  const buttonLabel = config.label || 'Click';
  const action = config.action || 'url';

  const getPlaceholder = () => {
    switch (action) {
      case 'url': return 'https://example.com';
      case 'email': return 'user@example.com';
      case 'phone': return '+1234567890';
      case 'copy': return 'Text to copy';
      case 'webhook': return 'https://api.example.com/webhook';
      default: return 'Enter value';
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {action === 'url' ? 'URL' : action === 'email' ? 'Email' : action === 'phone' ? 'Phone' : action === 'webhook' ? 'Webhook URL' : 'Value'}
        </Label>
        <Input
          type={action === 'url' || action === 'webhook' ? 'url' : action === 'email' ? 'email' : action === 'phone' ? 'tel' : 'text'}
          value={localValue}
          onChange={handleChange}
          placeholder={getPlaceholder()}
          className="w-full"
        />
      </div>

      <div className="pt-2 border-t">
        <div className="text-xs text-muted-foreground">
          Action: <span className="font-medium">{action}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Label: <span className="font-medium">{buttonLabel}</span>
        </div>
        {config.confirmMessage && (
          <div className="text-xs text-muted-foreground mt-1">
            ⚠️ Confirmation required
          </div>
        )}
      </div>
    </div>
  );
};
