import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export const alertDialogManifest: WidgetConfig = {
  label: 'Alert Dialog',
  category: 'Components',
  description: 'Confirmation dialog requiring explicit user action.',
  icon: AlertTriangle,
  defaults: {
    triggerText: 'Delete',
    title: 'Are you absolutely sure?',
    description: 'This action cannot be undone.',
    cancelText: 'Cancel',
    actionText: 'Continue',
    className: '',
  },
  render: (props) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className={(props as any).className}>
          {(props as any).triggerText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{(props as any).title}</AlertDialogTitle>
          <AlertDialogDescription>{(props as any).description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{(props as any).cancelText}</AlertDialogCancel>
          <AlertDialogAction>{(props as any).actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  inspector: {
    fields: [
      createCustomField({ key: 'triggerText', label: 'Trigger Text', type: 'text' }),
      createCustomField({ key: 'title', label: 'Title', type: 'text' }),
      createCustomField({ key: 'description', label: 'Description', type: 'textarea' }),
      createCustomField({ key: 'cancelText', label: 'Cancel Text', type: 'text' }),
      createCustomField({ key: 'actionText', label: 'Action Text', type: 'text' }),
    ],
  },
};
