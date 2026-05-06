import React from 'react';
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { BellRing } from 'lucide-react';

export const sonnerManifest: WidgetConfig = {
  label: 'Sonner Toast',
  category: 'Components',
  description: 'Toast notification trigger (Sonner).',
  icon: BellRing,
  defaults: { message: 'Event has been created.', triggerText: 'Show Toast', type: 'default', className: '' },
  render: (props) => {
    const type = (props as any).type ?? 'default';
    const message = (props as any).message ?? 'Notification';
    const trigger = () => {
      if (type === 'success') toast.success(message);
      else if (type === 'error') toast.error(message);
      else if (type === 'warning') toast.warning(message);
      else toast(message);
    };
    return (
      <div className={(props as any).className}>
        <Toaster />
        <Button variant="outline" onClick={trigger}>{(props as any).triggerText ?? 'Show Toast'}</Button>
      </div>
    );
  },
  inspector: {
    fields: [
      createCustomField({ key: 'message', label: 'Message', type: 'text' }),
      createCustomField({ key: 'triggerText', label: 'Trigger Text', type: 'text' }),
      createCustomField({ key: 'type', label: 'Type', type: 'select', options: ['default', 'success', 'error', 'warning'] }),
    ],
  },
};
