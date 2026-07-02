import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

export function useErrorToast() {
  const { toast } = useToast();

  return {
    showError: (error: unknown, context?: string) => {
      const message = error instanceof Error ? error.message : String(error);
      
      toast({
        title: context || 'Error',
        description: message,
        variant: 'destructive',
      });
      
      console.error(context || 'Error:', error);
    },
    
    showSuccess: (message: string, title?: string) => {
      toast({
        title: title || 'Success',
        description: message,
      });
    },
    
    showWarning: (message: string, title?: string) => {
      toast({
        title: title || 'Warning',
        description: message,
      });
    },
    
    showInfo: (message: string, title?: string) => {
      toast({
        title: title || 'Info',
        description: message,
      });
    },
  };
}

export function getToastIcon(type: ToastType) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" />;
    case 'error':
      return <AlertCircle className="w-5 h-5" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
    default:
      return null;
  }
}
