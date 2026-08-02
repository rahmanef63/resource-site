import React from 'react';
import { ScrollArea } from '@/components/ui';

interface ScrollAreaWidgetProps {
  children?: React.ReactNode;
  className?: string;
  type?: 'auto' | 'always' | 'scroll' | 'hover';
  height?: string;
}

export const ScrollAreaWidget: React.FC<ScrollAreaWidgetProps> = ({
  children,
  className,
  type = 'auto',
  height = '200px',
}) => {
  const defaultContent = (
    <div className="p-4 space-y-4">
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="text-sm">
          This is scrollable content item {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </div>
      ))}
    </div>
  );

  return (
    <ScrollArea className={className} type={type} style={{ height }}>
      {children || defaultContent}
    </ScrollArea>
  );
};
