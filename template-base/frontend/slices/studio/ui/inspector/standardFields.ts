import type { InspectorField } from '../types/index';

/**
 * Standard inspector field configurations for common widget properties
 * This reduces duplication and ensures consistency across all widgets
 */

// Layout & Positioning Fields
export const layoutFields: InspectorField[] = [
  {
    key: 'display',
    label: 'Display',
    type: 'select',
    options: ['block', 'flex', 'grid', 'inline', 'inline-block', 'inline-flex', 'hidden']
  },
  {
    key: 'position',
    label: 'Position',
    type: 'select',
    options: ['static', 'relative', 'absolute', 'fixed', 'sticky']
  },
  {
    key: 'zIndex',
    label: 'Z-Index',
    type: 'select',
    options: ['auto', '0', '10', '20', '30', '40', '50']
  },
];

// Flexbox Fields
export const flexFields: InspectorField[] = [
  {
    key: 'direction',
    label: 'Flex Direction',
    type: 'select',
    options: ['row', 'column', 'row-reverse', 'column-reverse']
  },
  {
    key: 'justify',
    label: 'Justify Content',
    type: 'select',
    options: ['start', 'end', 'center', 'between', 'around', 'evenly']
  },
  {
    key: 'align',
    label: 'Align Items',
    type: 'select',
    options: ['start', 'end', 'center', 'baseline', 'stretch']
  },
  {
    key: 'wrap',
    label: 'Flex Wrap',
    type: 'select',
    options: ['nowrap', 'wrap', 'wrap-reverse']
  },
  {
    key: 'gap',
    label: 'Gap',
    type: 'select',
    options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
  },
];

// Spacing Fields
export const spacingFields: InspectorField[] = [
  {
    key: 'padding',
    label: 'Padding',
    type: 'select',
    options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
  },
  {
    key: 'margin',
    label: 'Margin',
    type: 'select',
    options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
  },
];

// Sizing Fields
export const sizingFields: InspectorField[] = [
  {
    key: 'width',
    label: 'Width',
    type: 'select',
    options: ['auto', 'full', 'screen', 'min', 'max', 'fit', '1/2', '1/3', '2/3', '1/4', '3/4']
  },
  {
    key: 'height',
    label: 'Height',
    type: 'select',
    options: ['auto', 'full', 'screen', 'min', 'max', 'fit']
  },
  {
    key: 'maxWidth',
    label: 'Max Width',
    type: 'select',
    options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']
  },
];

// Typography Fields
export const typographyFields: InspectorField[] = [
  {
    key: 'fontSize',
    label: 'Font Size',
    type: 'select',
    options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']
  },
  {
    key: 'fontWeight',
    label: 'Font Weight',
    type: 'select',
    options: ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black']
  },
  {
    key: 'textAlign',
    label: 'Text Align',
    type: 'select',
    options: ['left', 'center', 'right', 'justify']
  },
  {
    key: 'textColor',
    label: 'Text Color',
    type: 'select',
    options: ['inherit', 'current', 'transparent', 'black', 'white', 'gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900', 'red-500', 'blue-500', 'green-500', 'yellow-500', 'purple-500', 'pink-500', 'indigo-500']
  },
  {
    key: 'textTransform',
    label: 'Text Transform',
    type: 'select',
    options: ['none', 'uppercase', 'lowercase', 'capitalize']
  },
  {
    key: 'textDecoration',
    label: 'Text Decoration',
    type: 'select',
    options: ['none', 'underline', 'overline', 'line-through']
  },
  {
    key: 'letterSpacing',
    label: 'Letter Spacing',
    type: 'select',
    options: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']
  },
  {
    key: 'lineHeight',
    label: 'Line Height',
    type: 'select',
    options: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose']
  },
  {
    key: 'fontFamily',
    label: 'Font Family',
    type: 'select',
    options: ['sans', 'serif', 'mono']
  },
  {
    key: 'fontStyle',
    label: 'Font Style',
    type: 'select',
    options: ['normal', 'italic']
  },
];

// Background & Color Fields
export const backgroundFields: InspectorField[] = [
  {
    key: 'background',
    label: 'Background',
    type: 'select',
    options: ['none', 'white', 'gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900', 'black', 'transparent']
  },
  {
    key: 'backgroundImage',
    label: 'Background Image URL',
    type: 'text',
    placeholder: 'https://example.com/image.jpg'
  },
  {
    key: 'backgroundSize',
    label: 'Background Size',
    type: 'select',
    options: ['auto', 'cover', 'contain']
  },
  {
    key: 'backgroundPosition',
    label: 'Background Position',
    type: 'select',
    options: ['center', 'top', 'bottom', 'left', 'right']
  },
  {
    key: 'backgroundRepeat',
    label: 'Background Repeat',
    type: 'select',
    options: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y']
  },
];

// Border Fields
export const borderFields: InspectorField[] = [
  {
    key: 'border',
    label: 'Show Border',
    type: 'switch'
  },
  {
    key: 'borderColor',
    label: 'Border Color',
    type: 'select',
    options: ['gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900', 'black', 'white', 'red-500', 'blue-500', 'green-500', 'yellow-500', 'purple-500']
  },
  {
    key: 'borderWidth',
    label: 'Border Width',
    type: 'select',
    options: ['0', '1', '2', '4', '8']
  },
  {
    key: 'borderStyle',
    label: 'Border Style',
    type: 'select',
    options: ['solid', 'dashed', 'dotted', 'double']
  },
  {
    key: 'borderRadius',
    label: 'Border Radius',
    type: 'select',
    options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']
  },
];

// Shadow & Effects Fields
export const effectsFields: InspectorField[] = [
  {
    key: 'shadow',
    label: 'Shadow',
    type: 'select',
    options: ['none', 'sm', 'md', 'lg', 'xl', '2xl']
  },
  {
    key: 'opacity',
    label: 'Opacity',
    type: 'select',
    options: ['0', '25', '50', '75', '100']
  },
  {
    key: 'overflow',
    label: 'Overflow',
    type: 'select',
    options: ['visible', 'hidden', 'scroll', 'auto']
  },
];

// Animation Fields
export const animationFields: InspectorField[] = [
  {
    key: 'animation',
    label: 'Animation',
    type: 'select',
    options: ['none', 'bounce', 'pulse', 'ping', 'spin', 'fade', 'slide']
  },
  {
    key: 'transition',
    label: 'Transition',
    type: 'select',
    options: ['none', 'all', 'colors', 'opacity', 'shadow', 'transform']
  },
];

// Common UI Element Fields
export const commonUIFields: InspectorField[] = [
  {
    key: 'variant',
    label: 'Variant',
    type: 'select',
    options: ['default', 'primary', 'secondary', 'destructive', 'outline', 'ghost', 'link']
  },
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    options: ['xs', 'sm', 'md', 'lg', 'xl']
  },
  {
    key: 'disabled',
    label: 'Disabled',
    type: 'switch'
  },
];

// Custom CSS Field
export const customCSSField: InspectorField = {
  key: 'className',
  label: 'Custom CSS Classes',
  type: 'text',
  placeholder: 'Additional CSS classes'
};

/**
 * Helper function to create field groups for specific widget types
 */
export const createInspectorFieldGroups = {
  // For layout containers
  layout: (): InspectorField[] => [
    ...layoutFields,
    ...flexFields,
    ...spacingFields,
    ...sizingFields,
    ...backgroundFields,
    ...borderFields,
    ...effectsFields,
    customCSSField,
  ],

  // For content widgets
  content: (): InspectorField[] => [
    ...typographyFields,
    ...spacingFields,
    ...backgroundFields,
    ...borderFields,
    ...effectsFields,
    customCSSField,
  ],

  // For UI components
  ui: (): InspectorField[] => [
    ...commonUIFields,
    ...spacingFields,
    ...effectsFields,
    customCSSField,
  ],

  // For media elements
  media: (): InspectorField[] => [
    ...sizingFields,
    ...spacingFields,
    ...borderFields,
    ...effectsFields,
    customCSSField,
  ],

  // For interactive elements
  interactive: (): InspectorField[] => [
    ...commonUIFields,
    ...typographyFields.slice(0, 4), // Just basic typography
    ...spacingFields,
    ...effectsFields,
    ...animationFields,
    customCSSField,
  ],
};

/**
 * Helper function to create a custom field configuration
 */
export const createCustomField = (config: Partial<InspectorField> & Pick<InspectorField, 'key' | 'label' | 'type'>): InspectorField => ({
  ...config,
});

/**
 * Helper function to filter fields by keys
 */
export const filterFields = (fields: InspectorField[], keys: string[]): InspectorField[] => {
  return fields.filter(field => keys.includes(field.key));
};

/**
 * Helper function to combine multiple field groups
 */
export const combineFields = (...fieldGroups: InspectorField[][]): InspectorField[] => {
  return fieldGroups.flat();
};

// ============================================================================
// Props-Based Configuration Helpers (Single Source of Truth)
// ============================================================================

import type { PropDefinition, PropsConfig } from '@/frontend/slices/studio/workflow/nodes/types';

/**
 * Convert a prop key to a human-readable label
 * e.g., "workspaceId" -> "Workspace Id"
 */
export const keyToLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Extract default values from a PropsConfig
 * Use this to generate the `defaults` object from `props`
 */
export const getDefaultsFromProps = (props: PropsConfig): Record<string, any> => {
  const defaults: Record<string, any> = {};
  for (const [key, def] of Object.entries(props)) {
    defaults[key] = def.default;
  }
  return defaults;
};

/**
 * Generate inspector fields from a PropsConfig
 * Use this to generate the `inspector.fields` array from `props`
 */
export const getInspectorFieldsFromProps = (props: PropsConfig): InspectorField[] => {
  const fields: InspectorField[] = [];

  for (const [key, def] of Object.entries(props)) {
    if (def.hidden) continue;

    fields.push({
      key,
      label: def.label || keyToLabel(key),
      type: def.type as InspectorField['type'],
      placeholder: def.placeholder,
      options: def.options,
      min: def.min,
      max: def.max,
      step: def.step,
    });
  }

  return fields;
};

/**
 * Create a complete inspector config from PropsConfig
 * Separates basic and advanced fields into sections
 */
export const getInspectorFromProps = (props: PropsConfig, title = 'Configuration'): {
  fields?: InspectorField[];
  sections?: { title: string; fields: InspectorField[]; collapsed?: boolean }[];
} => {
  const basicFields: InspectorField[] = [];
  const advancedFields: InspectorField[] = [];

  for (const [key, def] of Object.entries(props)) {
    if (def.hidden) continue;

    const field: InspectorField = {
      key,
      label: def.label || keyToLabel(key),
      type: def.type as InspectorField['type'],
      placeholder: def.placeholder,
      options: def.options,
      min: def.min,
      max: def.max,
      step: def.step,
    };

    if (def.advanced) {
      advancedFields.push(field);
    } else {
      basicFields.push(field);
    }
  }

  // If no advanced fields, return simple fields array
  if (advancedFields.length === 0) {
    return { fields: basicFields };
  }

  // Otherwise return sections
  return {
    sections: [
      { title, fields: basicFields },
      { title: 'Advanced', fields: advancedFields, collapsed: true },
    ],
  };
};

/**
 * Helper to define a prop with type inference
 */
export const defineProp = <T extends PropDefinition>(def: T): T => def;
