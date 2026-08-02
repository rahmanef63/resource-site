import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { CarouselWidget } from './CarouselWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const carouselManifest: WidgetConfig = {
    label: "Carousel",
    category: "UI",
    description: "Image/content carousel with navigation arrows.",
    icon: resolveWidgetIcon(undefined, 'UI', 'carousel'),
    defaults: {
        items: 'Slide 1,Slide 2,Slide 3',
        orientation: 'horizontal',
        showArrows: true,
        loop: false,
        className: '',
    },
    render: (props, children) => <CarouselWidget {...(props as any)}>{children}</CarouselWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'items',
                    label: 'Slide Items (comma-separated)',
                    type: 'text',
                    placeholder: 'Slide 1,Slide 2,Slide 3',
                }),
                createCustomField({
                    key: 'orientation',
                    label: 'Orientation',
                    type: 'select',
                    options: ['horizontal', 'vertical'],
                }),
                createCustomField({
                    key: 'showArrows',
                    label: 'Show Navigation Arrows',
                    type: 'switch',
                }),
                createCustomField({
                    key: 'loop',
                    label: 'Loop',
                    type: 'switch',
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};

