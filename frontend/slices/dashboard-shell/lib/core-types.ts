export interface NavItemCore<TChild = unknown> {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  exact?: boolean;
  active?: boolean;
  dock?: boolean;
  items?: TChild[];
}

export interface NavGroupCore<TItem = NavItemCore<unknown>> {
  id: string;
  label?: string;
  items: TItem[];
}

export interface BrandCore {
  name: string;
  href?: string;
  caption?: string;
}
