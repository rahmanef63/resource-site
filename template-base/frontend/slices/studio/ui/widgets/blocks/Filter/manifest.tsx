import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { FilterBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Filter';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Filter } from 'lucide-react';

export const filterManifest: WidgetConfig = {
    label: "Filter",
    category: "Blocks",
    description: "Search and filter bar.",
    icon: Filter,
    defaults: {
        className: ""
    },
    render: (props) => <FilterBlock {...(props as any)} fields={[]} onFilterChange={() => { }} onSearchChange={() => { }} />,
    inspector: {
        fields: []
    }
};

