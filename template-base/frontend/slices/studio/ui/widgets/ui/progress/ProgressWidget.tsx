import React from 'react';
import { Progress as UiProgress } from '@/components/ui';

interface ProgressWidgetProps {
  value?: number;
  max?: number;
  showValue?: boolean;
  className?: string;
}

/** shadcn Progress models a 0-100 percentage and has no `max`/`showValue`
 *  props. Map the widget's max into a percentage and render the label here so
 *  the widget's public props stay unchanged. */
export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  value = 50,
  max = 100,
  showValue = false,
  className,
}) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={className}>
      <UiProgress value={pct} aria-valuemax={max} aria-valuenow={value} />
      {showValue && (
        <span className="mt-1 block text-xs text-muted-foreground">
          {value} / {max}
        </span>
      )}
    </div>
  );
};
