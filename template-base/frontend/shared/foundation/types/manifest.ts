export interface FeatureManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category?: string;
  permissions?: string[];
  children?: FeatureManifest[];
  badge?: string;
  hidden?: boolean;
  order?: number;
}

export interface FeatureRegistry {
  [key: string]: FeatureManifest;
}
