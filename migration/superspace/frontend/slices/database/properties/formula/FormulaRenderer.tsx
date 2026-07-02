'use client';

import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Binary, AlertCircle } from 'lucide-react';

export const FormulaRenderer: React.FC<PropertyRendererProps> = ({ value, property }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  // Check if formula has an error
  const error = property.options && 'error' in property.options ? String(property.options.error) : null;

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-3 w-3" />
        <span className="text-xs font-mono">Error: {error}</span>
      </div>
    );
  }

  // Format based on result type
  const formatValue = (val: any): string => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);
    }
    if (typeof val === 'boolean') {
      return val ? '✓ True' : '✗ False';
    }
    if (val instanceof Date) {
      return val.toLocaleDateString();
    }
    return String(val);
  };

  return (
    <div className="flex items-center gap-2">
      <Binary className="h-3 w-3 text-muted-foreground" />
      <span className="font-mono text-sm">{formatValue(value)}</span>
    </div>
  );
};
