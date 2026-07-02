'use client';

import React, { useState } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

type AggregationType = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'MEDIAN' | 'UNIQUE';

interface RollupOptions {
  relationProperty?: string;
  targetProperty?: string;
  aggregation?: AggregationType;
}

// Mock aggregation functions
const aggregateFunctions = {
  COUNT: (values: any[]) => values.length,
  SUM: (values: number[]) => values.reduce((a, b) => a + b, 0),
  AVG: (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length,
  MIN: (values: number[]) => Math.min(...values),
  MAX: (values: number[]) => Math.max(...values),
  MEDIAN: (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },
  UNIQUE: (values: any[]) => new Set(values).size,
};

export const RollupEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property }) => {
  const options = property.options as RollupOptions || {};
  const aggregation = options.aggregation || 'COUNT';
  const [previewValue, setPreviewValue] = useState<any>(value);

  // Mock related data - in real implementation, fetch from relation
  const mockRelatedValues = [10, 20, 30, 25, 15];

  const handleCalculate = () => {
    try {
      const aggFunc = aggregateFunctions[aggregation as AggregationType];
      const result = aggFunc(mockRelatedValues);
      setPreviewValue(result);
      onChange(result);
    } catch (error) {
      console.error('Rollup calculation error:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Relation Property</Label>
        <div className="p-2 rounded border bg-muted text-sm">
          {options.relationProperty || 'Not configured'}
        </div>
        <p className="text-[10px] text-muted-foreground">
          The relation property to aggregate from
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Target Property</Label>
        <div className="p-2 rounded border bg-muted text-sm">
          {options.targetProperty || 'Not configured'}
        </div>
        <p className="text-[10px] text-muted-foreground">
          The property to aggregate in related records
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Aggregation Function</Label>
        <div className="p-2 rounded border bg-muted text-sm font-semibold">
          {aggregation}
        </div>
      </div>

      {previewValue !== null && previewValue !== undefined && (
        <div className="p-2 rounded border bg-muted/50">
          <Label className="text-xs text-muted-foreground">Current Value</Label>
          <div className="text-lg font-mono font-semibold mt-1">
            {typeof previewValue === 'number' 
              ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(previewValue)
              : String(previewValue)}
          </div>
        </div>
      )}

      <Button 
        type="button"
        size="sm" 
        onClick={handleCalculate} 
        className="w-full"
      >
        <Play className="h-3 w-3 mr-1" />
        Recalculate
      </Button>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Mock Data Preview</Label>
        <div className="text-[10px] text-muted-foreground">
          Related values: {mockRelatedValues.join(', ')}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground pt-1 border-t">
        Rollups automatically aggregate data from related records
      </div>
    </div>
  );
};
