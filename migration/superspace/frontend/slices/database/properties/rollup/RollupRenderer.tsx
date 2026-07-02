'use client';

import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Calculator, AlertCircle } from 'lucide-react';

export const RollupRenderer: React.FC<PropertyRendererProps> = ({ value, property }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  // Check if rollup has an error
  const error = property.options && 'error' in property.options ? String(property.options.error) : null;

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-3 w-3" />
        <span className="text-xs font-mono">Error: {error}</span>
      </div>
    );
  }

  // Format based on aggregation type
  const formatValue = (val: any): string => {
    if (typeof val === 'number') {
      const aggregation = property.options && 'aggregation' in property.options 
        ? String(property.options.aggregation) 
        : 'COUNT';
      
      if (aggregation === 'COUNT') {
        return `${val} items`;
      }
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);
    }
    if (Array.isArray(val)) {
      return `${val.length} items`;
    }
    return String(val);
  };

  return (
    <div className="flex items-center gap-2">
      <Calculator className="h-3 w-3 text-muted-foreground" />
      <span className="font-mono text-sm">{formatValue(value)}</span>
    </div>
  );
};
