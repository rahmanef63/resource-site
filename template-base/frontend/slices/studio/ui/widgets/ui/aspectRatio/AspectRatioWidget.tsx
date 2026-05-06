import React from 'react';
import { AspectRatio } from '@/components/ui';

interface AspectRatioWidgetProps {
  ratio?: number;
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
}

export const AspectRatioWidget: React.FC<AspectRatioWidgetProps> = ({
  ratio = 16 / 9,
  children,
  className,
  backgroundColor,
}) => {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <div 
        className="w-full h-full flex items-center justify-center rounded-md bg-muted"
        style={backgroundColor ? { backgroundColor } : undefined}
      >
        {children || (
          <div className="text-muted-foreground text-sm">
            {ratio === 16/9 ? '16:9' : ratio === 4/3 ? '4:3' : ratio === 1 ? '1:1' : `${ratio.toFixed(2)}:1`} Aspect Ratio
          </div>
        )}
      </div>
    </AspectRatio>
  );
};
