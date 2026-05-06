import type { WidgetConfig, InspectorField } from '../types';
import { createInspectorFieldGroups, createCustomField, combineFields, customCSSField } from '../inspector/standardFields';
import { resolveWidgetIcon, type IconType } from './iconUtils';

/**
 * Widget factory utilities for creating standardized widget configurations
 */

export interface WidgetFactoryOptions {
  label: string;
  category: 'Layout' | 'Content' | 'Media' | 'Navigation' | 'Action' | 'UI' | 'Templates';
  description?: string;
  icon?: IconType;
  tags?: string[];
  defaults?: Record<string, any>;
  customFields?: InspectorField[];
  inspectorType?: 'layout' | 'content' | 'ui' | 'media' | 'interactive' | 'custom';
  autoConnect?: WidgetConfig['autoConnect'];
  previewImage?: string;
}

/**
 * Creates a standardized widget configuration
 * @param key - Widget key identifier
 * @param render - Widget render function
 * @param options - Widget configuration options
 * @returns Complete widget configuration
 */
export const createWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: WidgetFactoryOptions
): WidgetConfig => {
  const {
    label,
    category,
    description,
    icon,
    tags,
    defaults = {},
    customFields = [],
    inspectorType = getDefaultInspectorType(category),
    autoConnect,
    previewImage,
  } = options;

  // Get base inspector fields based on category
  const baseFields = inspectorType === 'custom' 
    ? [] 
    : createInspectorFieldGroups[inspectorType]();

  // Combine custom fields with base fields
  const inspectorFields = customFields.length > 0 
    ? combineFields([...customFields], baseFields)
    : baseFields;

  return {
    label,
    category,
    description: description || `${label} widget for ${category.toLowerCase()} layouts`,
    icon: resolveWidgetIcon(icon, category, key as any),
    tags: tags || [category.toLowerCase(), key],
    defaults: {
      ...getDefaultDefaults(category),
      ...defaults,
    },
    render,
    inspector: {
      fields: inspectorFields,
    },
    autoConnect,
    previewImage,
  };
};

/**
 * Creates a layout widget (containers, sections, etc.)
 */
export const createLayoutWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: Omit<WidgetFactoryOptions, 'category' | 'inspectorType'> & {
    inspectorType?: 'layout' | 'custom';
  }
): WidgetConfig => {
  return createWidget(key, render, {
    ...options,
    category: 'Layout',
    inspectorType: options.inspectorType || 'layout',
  });
};

/**
 * Creates a content widget (text, headings, etc.)
 */
export const createContentWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: Omit<WidgetFactoryOptions, 'category' | 'inspectorType'> & {
    inspectorType?: 'content' | 'custom';
  }
): WidgetConfig => {
  return createWidget(key, render, {
    ...options,
    category: 'Content',
    inspectorType: options.inspectorType || 'content',
  });
};

/**
 * Creates a UI component widget (buttons, forms, etc.)
 */
export const createUIWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: Omit<WidgetFactoryOptions, 'category' | 'inspectorType'> & {
    inspectorType?: 'ui' | 'interactive' | 'custom';
  }
): WidgetConfig => {
  return createWidget(key, render, {
    ...options,
    category: 'UI',
    inspectorType: options.inspectorType || 'ui',
  });
};

/**
 * Creates a media widget (images, videos, etc.)
 */
export const createMediaWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: Omit<WidgetFactoryOptions, 'category' | 'inspectorType'> & {
    inspectorType?: 'media' | 'custom';
  }
): WidgetConfig => {
  return createWidget(key, render, {
    ...options,
    category: 'Media',
    inspectorType: options.inspectorType || 'media',
  });
};

/**
 * Creates an action widget (buttons, links, etc.)
 */
export const createActionWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: Omit<WidgetFactoryOptions, 'category' | 'inspectorType'> & {
    inspectorType?: 'interactive' | 'custom';
  }
): WidgetConfig => {
  return createWidget(key, render, {
    ...options,
    category: 'Action',
    inspectorType: options.inspectorType || 'interactive',
  });
};

/**
 * Creates a navigation widget (menus, breadcrumbs, etc.)
 */
export const createNavigationWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: Omit<WidgetFactoryOptions, 'category' | 'inspectorType'> & {
    inspectorType?: 'ui' | 'custom';
  }
): WidgetConfig => {
  return createWidget(key, render, {
    ...options,
    category: 'Navigation',
    inspectorType: options.inspectorType || 'ui',
  });
};

/**
 * Creates a template widget (heroes, sections, etc.)
 */
export const createTemplateWidget = (
  key: string,
  render: WidgetConfig['render'],
  options: Omit<WidgetFactoryOptions, 'category' | 'inspectorType'> & {
    inspectorType?: 'layout' | 'custom';
  }
): WidgetConfig => {
  return createWidget(key, render, {
    ...options,
    category: 'Templates',
    inspectorType: options.inspectorType || 'layout',
  });
};

/**
 * Helper to get default inspector type based on category
 */
function getDefaultInspectorType(category: string): keyof typeof createInspectorFieldGroups {
  switch (category) {
    case 'Layout':
    case 'Templates':
      return 'layout';
    case 'Content':
      return 'content';
    case 'Media':
      return 'media';
    case 'Action':
      return 'interactive';
    case 'UI':
    case 'Navigation':
      return 'ui';
    default:
      return 'ui';
  }
}

/**
 * Helper to get default defaults based on category
 */
function getDefaultDefaults(category: string): Record<string, any> {
  const common = {
    className: '',
  };

  switch (category) {
    case 'Layout':
      return {
        ...common,
        padding: 'md',
        margin: 'none',
        display: 'block',
      };
    case 'Content':
      return {
        ...common,
        fontSize: 'base',
        fontWeight: 'normal',
        textAlign: 'left',
        color: 'gray-900',
      };
    case 'Action':
      return {
        ...common,
        variant: 'default',
        size: 'md',
        disabled: false,
      };
    case 'UI':
      return {
        ...common,
        variant: 'default',
        size: 'md',
      };
    case 'Media':
      return {
        ...common,
        width: 'auto',
        height: 'auto',
      };
    case 'Navigation':
      return {
        ...common,
        orientation: 'horizontal',
      };
    case 'Templates':
      return {
        ...common,
        padding: 'lg',
        background: 'none',
      };
    default:
      return common;
  }
}

/**
 * Common field presets for quick widget creation
 */
export const fieldPresets = {
  text: () => createCustomField({
    key: 'text',
    label: 'Text',
    type: 'text',
    placeholder: 'Enter text...',
  }),
  
  content: () => createCustomField({
    key: 'content',
    label: 'Content',
    type: 'textarea',
    placeholder: 'Enter content...',
  }),
  
  url: () => createCustomField({
    key: 'url',
    label: 'URL',
    type: 'text',
    placeholder: 'https://example.com',
  }),
  
  alt: () => createCustomField({
    key: 'alt',
    label: 'Alt Text',
    type: 'text',
    placeholder: 'Describe the image...',
  }),
  
  placeholder: () => createCustomField({
    key: 'placeholder',
    label: 'Placeholder',
    type: 'text',
    placeholder: 'Enter placeholder text...',
  }),
  
  required: () => createCustomField({
    key: 'required',
    label: 'Required',
    type: 'switch',
  }),
  
  disabled: () => createCustomField({
    key: 'disabled',
    label: 'Disabled',
    type: 'switch',
  }),
};
