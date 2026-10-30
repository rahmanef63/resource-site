import React from 'react';
import {
  Accordion as UiAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui';

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

/** Thin wrapper over the shadcn accordion. Radix drives the item list through
 *  children, not an `items` prop, and `collapsible` is only valid for
 *  `type="single"` — passing it on `multiple` is a type error. */
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
  const items_ = items.map((item) => (
    <AccordionItem key={item.value} value={item.value}>
      <AccordionTrigger>{item.title}</AccordionTrigger>
      <AccordionContent>{item.content}</AccordionContent>
    </AccordionItem>
  ));

  return type === 'single' ? (
    <UiAccordion type="single" collapsible={collapsible} className={className}>
      {items_}
    </UiAccordion>
  ) : (
    <UiAccordion type="multiple" className={className}>
      {items_}
    </UiAccordion>
  );
};
