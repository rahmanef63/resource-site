import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { FooterBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Footer';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { PanelBottom } from 'lucide-react';

export const footerManifest: WidgetConfig = {
  label: "Footer",
  category: "Blocks",
  description: "Site footer with logo, link columns, and copyright.",
  icon: PanelBottom,
  defaults: {
    logoText: "Brand",
    tagline: "Building better products together.",
    copyright: "",
    className: "",
  },
  render: (props) => <FooterBlock {...(props as any)} />,
  inspector: {
    fields: [
      createCustomField({ key: 'logoText', label: 'Logo Text', type: 'text' }),
      createCustomField({ key: 'tagline', label: 'Tagline', type: 'text' }),
      createCustomField({ key: 'copyright', label: 'Copyright Text', type: 'text' }),
    ],
  },
};
