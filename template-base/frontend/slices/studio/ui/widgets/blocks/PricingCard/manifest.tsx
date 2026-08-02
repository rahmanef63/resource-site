import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { PricingCardBlock } from '@/frontend/slices/studio/ui/widgets/blocks/PricingCard';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { CreditCard } from 'lucide-react';

export const pricingCardManifest: WidgetConfig = {
  label: "Pricing Card",
  category: "Blocks",
  description: "Pricing tier card with feature list and CTA.",
  icon: CreditCard,
  defaults: {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "Everything you need to grow.",
    ctaLabel: "Get started",
    ctaHref: "#",
    highlighted: false,
    className: "",
  },
  render: (props) => <PricingCardBlock {...(props as any)} />,
  inspector: {
    fields: [
      createCustomField({ key: 'name', label: 'Plan Name', type: 'text' }),
      createCustomField({ key: 'price', label: 'Price', type: 'text' }),
      createCustomField({ key: 'period', label: 'Period', type: 'text' }),
      createCustomField({ key: 'description', label: 'Description', type: 'text' }),
      createCustomField({ key: 'ctaLabel', label: 'Button Label', type: 'text' }),
      createCustomField({ key: 'ctaHref', label: 'Button Link', type: 'text' }),
      createCustomField({ key: 'badge', label: 'Badge (optional)', type: 'text' }),
      createCustomField({ key: 'highlighted', label: 'Highlighted', type: 'switch' }),
    ],
  },
};
