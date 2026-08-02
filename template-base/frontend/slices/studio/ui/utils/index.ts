export type { IconType } from './iconUtils';
export {
  categoryIcons,
  widgetIcons,
  resolveWidgetIcon,
  getCategoryStandardIcon,
  isValidLucideIcon,
  getAvailableIcons,
} from './iconUtils';

export type { ValidationResult } from './widgetValidation';
export {
  validateWidget,
  standardizeWidget,
  validateWidgetRegistry,
  getValidationSummary,
} from './widgetValidation';

export type { WidgetFactoryOptions } from './widgetFactory';
export {
  createWidget,
  createLayoutWidget,
  createContentWidget,
  createUIWidget,
  createMediaWidget,
  createActionWidget,
  createNavigationWidget,
  createTemplateWidget,
  fieldPresets,
} from './widgetFactory';
