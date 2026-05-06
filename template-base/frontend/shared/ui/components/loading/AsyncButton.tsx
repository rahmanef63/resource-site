import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';

interface AsyncButtonProps extends React.ComponentProps<typeof Button> {
  onClick: () => Promise<void> | void;
  loadingText?: string;
}

export function AsyncButton({ 
  onClick, 
  children, 
  loadingText, 
  disabled, 
  ...props 
}: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onClick();
    } catch (error) {
      console.error('AsyncButton error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}