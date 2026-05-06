import React from 'react';
import { cn, generateContainerClasses } from '@/frontend/slices/studio/ui/lib/utils';

interface ContainerProps {
  display?: string;
  direction?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  position?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ContainerWidget: React.FC<ContainerProps> = (props) => {
  const generatedClasses = generateContainerClasses({
    padding: props.padding,
    margin: props.margin,
    className: props.className,
  });
  return (
    <div className={cn(generatedClasses)}>
      {props.children}
    </div>
  );
};
