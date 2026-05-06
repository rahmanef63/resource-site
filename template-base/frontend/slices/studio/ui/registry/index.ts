import type { WidgetConfig } from '../types/index';
import { cmsWidgetRegistry } from '../widgets/registry';

export const getWidgetRegistry = () => cmsWidgetRegistry;

export const getWidgetConfig = (type: string): WidgetConfig | undefined => {
  return cmsWidgetRegistry[type];
};

export const getWidgetsByCategory = (category: string): Array<{ key: string; config: WidgetConfig }> => {
  return Object.entries(cmsWidgetRegistry)
    .filter(([, config]) => config.category === category)
    .map(([key, config]) => ({ key, config }));
};

export const getAllWidgets = (): Array<{ key: string; config: WidgetConfig }> => {
  return Object.entries(cmsWidgetRegistry).map(([key, config]) => ({ key, config }));
};

// Function to manually register a widget (for runtime registration)
export const registerWidget = (key: string, config: WidgetConfig) => {
  (cmsWidgetRegistry as Record<string, WidgetConfig>)[key] = config;
};

// Function to get all available widget keys
export const getAvailableWidgetKeys = (): string[] => {
  return Object.keys(cmsWidgetRegistry);
};
