import React from 'react';
import { Progress } from '@/components/ui';

interface ProgressWidgetProps {
  value?: number;
  max?: number;
  showValue?: boolean;
  className?: string;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  value = 50,
  max = 100,
  showValue = false,
  className,
}) => {
  return (
    <Progress
      value={value}
      max={max}
      showValue={showValue}
      className={className}
    />
  );
};
