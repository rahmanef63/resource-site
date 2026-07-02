'use client';

import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, AlertCircle, CheckCircle2 } from 'lucide-react';

// Simple formula evaluator
const evaluateFormula = (formula: string, context: Record<string, any> = {}): { result: any; error: string | null } => {
  try {
    // Remove any leading '=' sign
    const cleanFormula = formula.trim().replace(/^=/, '');
    
    // Available functions
    const functions = {
      SUM: (...args: number[]) => args.reduce((a, b) => a + b, 0),
      AVG: (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
      MIN: (...args: number[]) => Math.min(...args),
      MAX: (...args: number[]) => Math.max(...args),
      IF: (condition: boolean, ifTrue: any, ifFalse: any) => condition ? ifTrue : ifFalse,
      AND: (...args: boolean[]) => args.every(Boolean),
      OR: (...args: boolean[]) => args.some(Boolean),
      NOT: (value: boolean) => !value,
      CONCAT: (...args: any[]) => args.join(''),
      UPPER: (text: string) => text.toUpperCase(),
      LOWER: (text: string) => text.toLowerCase(),
      LENGTH: (text: string) => text.length,
      ROUND: (num: number, decimals: number = 0) => Number(num.toFixed(decimals)),
    };

    // Create evaluation context
    const evalContext = {
      ...context,
      ...functions,
    };

    // Simple evaluation (in production, use a proper formula parser)
    const func = new Function(...Object.keys(evalContext), `return ${cleanFormula}`);
    const result = func(...Object.values(evalContext));

    return { result, error: null };
  } catch (error) {
    return { result: null, error: error instanceof Error ? error.message : 'Invalid formula' };
  }
};

export const FormulaEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property }) => {
  const [formula, setFormula] = useState('');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    // Load formula from property options
    if (property.options && 'formula' in property.options) {
      setFormula(String(property.options.formula));
    }
  }, [property.options]);

  const handleFormulaChange = (newFormula: string) => {
    setFormula(newFormula);
    
    // Auto-preview
    if (newFormula.trim()) {
      const { result, error } = evaluateFormula(newFormula);
      setPreviewResult(result);
      setPreviewError(error);
    } else {
      setPreviewResult(null);
      setPreviewError(null);
    }
  };

  const handleApply = () => {
    const { result, error } = evaluateFormula(formula);
    if (!error) {
      onChange(result);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Formula Expression</Label>
        <Textarea
          value={formula}
          onChange={(e) => handleFormulaChange(e.target.value)}
          placeholder="= SUM(1, 2, 3) or = IF(true, 'Yes', 'No')"
          className="font-mono text-xs min-h-[80px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Start with = and use functions: SUM, AVG, MIN, MAX, IF, AND, OR, CONCAT, etc.
        </p>
      </div>

      {(previewResult !== null || previewError) && (
        <div className="p-2 rounded border bg-muted/50">
          <Label className="text-xs text-muted-foreground">Preview</Label>
          {previewError ? (
            <div className="flex items-start gap-2 text-destructive mt-1">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="text-xs font-mono">{previewError}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span className="text-sm font-mono">{String(previewResult)}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Available Functions</Label>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div>• Math: SUM, AVG, MIN, MAX, ROUND</div>
          <div>• Logic: IF, AND, OR, NOT</div>
          <div>• Text: CONCAT, UPPER, LOWER, LENGTH</div>
        </div>
      </div>

      <Button 
        type="button"
        size="sm" 
        onClick={handleApply} 
        className="w-full"
        disabled={!formula.trim() || !!previewError}
      >
        <Play className="h-3 w-3 mr-1" />
        Calculate
      </Button>

      <div className="text-[10px] text-muted-foreground pt-1 border-t">
        Formulas are read-only and automatically calculated
      </div>
    </div>
  );
};
