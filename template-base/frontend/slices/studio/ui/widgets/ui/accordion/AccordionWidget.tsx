import React from 'react';
import { Accordion } from '@/components/ui';

interface AccordionWidgetProps {
  items?: Array<{
    value: string;
    title: string;
    content: string;
  }>;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
}

export const AccordionWidget: React.FC<AccordionWidgetProps> = ({
  items = [
    { value: 'item-1', title: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern.' },
    { value: 'item-2', title: 'Is it styled?', content: 'Yes. It comes with default styles that matches the other components aesthetic.' },
    { value: 'item-3', title: 'Is it animated?', content: 'Yes. It\'s animated by default, but you can disable it if you prefer.' },
  ],
  type = 'single',
  collapsible = true,
  className,
}) => {
  return (
    <Accordion
      items={items}
      type={type}
      collapsible={collapsible}
      className={className}
    />
  );
};
