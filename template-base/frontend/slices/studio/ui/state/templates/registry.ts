import type { StudioTemplateFactory } from './shared';

export interface BuiltinTemplateModule {
  default: StudioTemplateFactory;
}

export type BuiltinTemplateLoader = () => Promise<BuiltinTemplateModule>;

export const BUILTIN_TEMPLATE_REGISTRY: Record<string, BuiltinTemplateLoader> = {
  'SaaS Product Landing': () => import('./saas-product-landing'),
  'Agency Studio': () => import('./agency-studio'),
  'Personal Portfolio': () => import('./personal-portfolio'),
  'Startup Pitch': () => import('./startup-pitch'),
  'Mobile App Landing': () => import('./mobile-app-landing'),
  'Local Business': () => import('./local-business'),
  'Event Conference': () => import('./event-conference'),
  'Waitlist Coming Soon': () => import('./waitlist-coming-soon'),
  'Streaming Platform (Netflix Clone)': () => import('./streaming-platform'),
};

export const BUILTIN_TEMPLATE_KEYS = Object.keys(BUILTIN_TEMPLATE_REGISTRY);
