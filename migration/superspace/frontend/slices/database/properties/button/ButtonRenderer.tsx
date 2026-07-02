'use client';

import React, { useState } from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, Mail, Phone, Copy, Check } from 'lucide-react';

type ButtonAction = 'url' | 'email' | 'phone' | 'copy' | 'webhook';
type ButtonStyle = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

interface ButtonConfig {
  label?: string;
  action?: ButtonAction;
  style?: ButtonStyle;
  confirmMessage?: string;
}

export const ButtonRenderer: React.FC<PropertyRendererProps> = ({ value, property }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!value) {
    return <span className="text-muted-foreground italic">No action</span>;
  }

  const config: ButtonConfig = (property.options as ButtonConfig) || {};
  const buttonLabel = config.label || 'Click';
  const actionType = config.action || 'url';
  const buttonStyle = config.style || 'outline';
  const confirmMessage = config.confirmMessage;

  const getIcon = () => {
    if (isLoading) return <Loader2 className="ml-1 h-3 w-3 animate-spin" />;
    if (copied) return <Check className="ml-1 h-3 w-3" />;
    
    switch (actionType) {
      case 'url': return <ExternalLink className="ml-1 h-3 w-3" />;
      case 'email': return <Mail className="ml-1 h-3 w-3" />;
      case 'phone': return <Phone className="ml-1 h-3 w-3" />;
      case 'copy': return <Copy className="ml-1 h-3 w-3" />;
      default: return <ExternalLink className="ml-1 h-3 w-3" />;
    }
  };

  const executeAction = async () => {
    const actionValue = String(value);
    setIsLoading(true);

    try {
      switch (actionType) {
        case 'url':
          window.open(actionValue, '_blank', 'noopener,noreferrer');
          break;
        
        case 'email':
          window.location.href = `mailto:${actionValue}`;
          break;
        
        case 'phone':
          window.location.href = `tel:${actionValue}`;
          break;
        
        case 'copy':
          await navigator.clipboard.writeText(actionValue);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          break;
        
        case 'webhook':
          // Make POST request to webhook URL
          await fetch(actionValue, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: new Date().toISOString() })
          });
          break;
      }
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For confirmation, use native confirm dialog (more compatible)
    if (confirmMessage) {
      if (!confirm(confirmMessage)) {
        return;
      }
    }
    
    executeAction();
  };

  return (
    <Button
      size="sm"
      variant={buttonStyle as any}
      onClick={handleClick}
      disabled={isLoading}
      className="h-7 text-xs"
    >
      {buttonLabel}
      {getIcon()}
    </Button>
  );
};
