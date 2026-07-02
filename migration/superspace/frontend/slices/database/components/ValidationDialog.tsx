import React from 'react';
import { ResponsiveDialog } from '@/frontend/shared/ui/components/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
}) => {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} size="sm">
      <ResponsiveDialog.Header>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <ResponsiveDialog.Title>{title}</ResponsiveDialog.Title>
        </div>
        <ResponsiveDialog.Description>{description}</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Footer>
        <Button onClick={() => onOpenChange(false)}>OK</Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
};
