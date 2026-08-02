export interface InspectorControl {
  label: string;
  ui: 'text' | 'textarea' | 'select' | 'toggle' | 'dimension' | 'colorPicker' | 'percentage' | 'segmented' | 'iconPicker' | 'spacing' | 'toggleGroup' | 'tabbed';
  uiComponentPath: string;
  path: string;
  options?: string[];
  default: any;
  layout?: 'single' | 'double' | 'triple' | 'quad';
  group?: string;
  tabs?: string[];
  sides?: ('top' | 'right' | 'bottom' | 'left')[];
  lockable?: boolean;
}

export interface InspectorGroup {
  id: string;
  label: string;
  controls: string[];
  layout?: 'single' | 'double' | 'triple';
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface InspectorPreset {
  extends: string[];
  overrides: Record<string, any>;
}

export interface InspectorConfig {
  tokens: Record<string, any>;
  library: {
    controls: Record<string, InspectorControl>;
    groups: Record<string, string[]>;
  };
  presets: Record<string, InspectorPreset>;
}
