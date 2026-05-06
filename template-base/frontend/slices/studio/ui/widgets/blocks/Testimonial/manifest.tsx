import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { TestimonialBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Testimonial';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { MessageSquareQuote } from 'lucide-react';

export const testimonialManifest: WidgetConfig = {
  label: "Testimonial",
  category: "Blocks",
  description: "Customer quote with author, role, and star rating.",
  icon: MessageSquareQuote,
  defaults: {
    quote: "This product completely changed how our team works. Highly recommended!",
    author: "Sarah Johnson",
    role: "Product Lead",
    company: "Acme Corp",
    rating: 5,
    className: "",
  },
  render: (props) => <TestimonialBlock {...(props as any)} />,
  inspector: {
    fields: [
      createCustomField({ key: 'quote', label: 'Quote', type: 'textarea' }),
      createCustomField({ key: 'author', label: 'Author Name', type: 'text' }),
      createCustomField({ key: 'role', label: 'Role', type: 'text' }),
      createCustomField({ key: 'company', label: 'Company', type: 'text' }),
      createCustomField({ key: 'avatar', label: 'Avatar URL', type: 'text' }),
      createCustomField({ key: 'rating', label: 'Rating (1-5)', type: 'number' }),
    ],
  },
};
