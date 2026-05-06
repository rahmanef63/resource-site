export interface BuilderProject {
    id: string;
    name: string;
    thumbnail?: string;
    lastModified: number;
    pageCount: number;
    status: 'published' | 'draft';
    url?: string;
}

export interface BuilderTemplate {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    category: string;
}

export interface BuilderData {
    isLoading: boolean;
    projects: BuilderProject[];
    templates: BuilderTemplate[];
}

export * from './types/index';
