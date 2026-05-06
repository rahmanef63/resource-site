import React from 'react';

interface RowProps {
  className?: string;
}

export const RowWidget: React.FC<RowProps & { children?: React.ReactNode }> = ({ 
  className = "grid grid-cols-12 gap-6", 
  children 
}) => (
  <div className={className}>
    {children}
  </div>
);
