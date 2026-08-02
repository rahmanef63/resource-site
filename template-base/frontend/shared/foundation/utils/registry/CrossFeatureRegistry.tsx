import React from 'react';
export interface InspectorField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'switch' | 'textarea' | 'custom' | 'nodeSelector'
  // Extended types for studio
  | 'slider' | 'color' | 'checkbox' | 'button' | 'buttonGroup' | 'range' | 'code' | 'json';
  options?: string[];
  placeholder?: string;
  component?: React.ComponentType<any>;
  // Extended properties for automation
  description?: string;
  required?: boolean;
  defaultValue?: any;
  // Additional properties for extended field types
  min?: number;
  max?: number;
  step?: number;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onButtonClick?: () => void;
  buttons?: Array<{ value: string; label: string; icon?: React.ComponentType<any> }>;
}

export interface ComponentConfig {
  key: string;
  label: string;
  category: string;
  feature: string;
  description?: string;
  icon?: React.ComponentType<any> | string;
  defaults?: Record<string, any>;
  render?: (props: any, children?: React.ReactNode) => React.ReactNode;
  inspector?: {
    fields: InspectorField[];
  };
  inspectorFields?: InspectorField[];
  inspectorPreset?: string;
  autoConnect?: Record<string, {
    type: string;
    props?: Record<string, any>;
  }>;
  tags?: string[];
  previewImage?: string;
  version?: string;
}

export interface FeatureTab {
  id: string;
  label: string;
  feature: string;
  categories?: string[];
}

class CrossFeatureRegistry {
  private components = new Map<string, ComponentConfig>();
  private featureTabs = new Map<string, FeatureTab[]>();
  private componentsByCategory = new Map<string, ComponentConfig[]>();
  private componentsByFeature = new Map<string, ComponentConfig[]>();
  private componentStats = new Map<string, { total: number; byCategory: Record<string, number> }>();

  registerComponent(config: ComponentConfig) {
    this.components.set(config.key, config);
    this.updateIndexes(config);
  }

  private updateIndexes(config: ComponentConfig) {
    // Update category index
    if (!this.componentsByCategory.has(config.category)) {
      this.componentsByCategory.set(config.category, []);
    }
    const categoryComponents = this.componentsByCategory.get(config.category)!;
    const existingIndex = categoryComponents.findIndex(c => c.key === config.key);
    if (existingIndex >= 0) {
      categoryComponents[existingIndex] = config;
    } else {
      categoryComponents.push(config);
    }

    // Update feature index
    if (!this.componentsByFeature.has(config.feature)) {
      this.componentsByFeature.set(config.feature, []);
    }
    const featureComponents = this.componentsByFeature.get(config.feature)!;
    const existingFeatureIndex = featureComponents.findIndex(c => c.key === config.key);
    if (existingFeatureIndex >= 0) {
      featureComponents[existingFeatureIndex] = config;
    } else {
      featureComponents.push(config);
    }

    // Update stats
    this.updateStats(config.feature);
  }

  private updateStats(feature: string) {
    const featureComponents = this.getComponentsByFeature(feature);
    const byCategory: Record<string, number> = {};

    featureComponents.forEach(component => {
      byCategory[component.category] = (byCategory[component.category] || 0) + 1;
    });

    this.componentStats.set(feature, {
      total: featureComponents.length,
      byCategory,
    });
  }

  registerFeatureTabs(feature: string, tabs: FeatureTab[]) {
    this.featureTabs.set(feature, tabs);
  }

  getComponent(key: string): ComponentConfig | undefined {
    return this.components.get(key);
  }

  // Alias for getComponent to maintain compatibility
  getWidget(key: string): ComponentConfig | undefined {
    return this.getComponent(key);
  }

  getComponentsByFeature(feature: string): ComponentConfig[] {
    return this.componentsByFeature.get(feature) || [];
  }

  getComponentsByCategory(category: string): ComponentConfig[] {
    return this.componentsByCategory.get(category) || [];
  }

  getComponentsByTags(tags: string[]): ComponentConfig[] {
    return Array.from(this.components.values()).filter(comp =>
      comp.tags && tags.some(tag => comp.tags!.includes(tag))
    );
  }

  searchComponents(query: string): ComponentConfig[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.components.values()).filter(comp => {
      const searchableText = [
        comp.label,
        comp.description,
        comp.category,
        comp.feature,
        ...(comp.tags || [])
      ].join(' ').toLowerCase();

      return searchableText.includes(lowerQuery);
    });
  }

  getFeatureStats(feature: string) {
    return this.componentStats.get(feature) || { total: 0, byCategory: {} };
  }

  getAllCategories(): string[] {
    return Array.from(this.componentsByCategory.keys());
  }

  getAllFeatures(): string[] {
    return Array.from(this.componentsByFeature.keys());
  }

  getAllComponents(): ComponentConfig[] {
    return Array.from(this.components.values());
  }

  getFeatureTabs(feature: string): FeatureTab[] {
    return this.featureTabs.get(feature) || [];
  }

  getComponentsForTab(feature: string, tabId: string): ComponentConfig[] {
    const tabs = this.getFeatureTabs(feature);
    const tab = tabs.find(t => t.id === tabId);

    if (!tab) return [];

    if (tab.feature === 'all') {
      return this.getAllComponents();
    }

    if (tab.feature !== feature && tab.feature !== 'cross') {
      // Cross-feature access
      return this.getComponentsByFeature(tab.feature);
    }

    if (tab.categories) {
      return tab.categories.flatMap(category => this.getComponentsByCategory(category));
    }

    return this.getComponentsByFeature(feature);
  }
}

export const crossFeatureRegistry = new CrossFeatureRegistry();

// Hook for using the registry
export const useCrossFeatureRegistry = () => {
  return React.useMemo(() => ({
    registerComponent: (config: ComponentConfig) => crossFeatureRegistry.registerComponent(config),
    registerFeatureTabs: (feature: string, tabs: FeatureTab[]) => crossFeatureRegistry.registerFeatureTabs(feature, tabs),
    getComponent: (key: string) => crossFeatureRegistry.getComponent(key),
    getWidget: (key: string) => crossFeatureRegistry.getWidget(key),
    getComponentsByFeature: (feature: string) => crossFeatureRegistry.getComponentsByFeature(feature),
    getComponentsByCategory: (category: string) => crossFeatureRegistry.getComponentsByCategory(category),
    getComponentsByTags: (tags: string[]) => crossFeatureRegistry.getComponentsByTags(tags),
    searchComponents: (query: string) => crossFeatureRegistry.searchComponents(query),
    getAllComponents: () => crossFeatureRegistry.getAllComponents(),
    getFeatureTabs: (feature: string) => crossFeatureRegistry.getFeatureTabs(feature),
    getComponentsForTab: (feature: string, tabId: string) => crossFeatureRegistry.getComponentsForTab(feature, tabId),
    getFeatureStats: (feature: string) => crossFeatureRegistry.getFeatureStats(feature),
    getAllCategories: () => crossFeatureRegistry.getAllCategories(),
    getAllFeatures: () => crossFeatureRegistry.getAllFeatures(),
  }), []);
};
