import React from 'react';

interface ColumnProps {
  className?: string;
}

export const ColumnWidget: React.FC<ColumnProps & { children?: React.ReactNode }> = ({ 
  className = "col-span-12 md:col-span-6", 
  children 
}) => (
  <div className={className}>
    {children}
  </div>
);
