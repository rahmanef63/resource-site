/**
 * Div Widget — Universal container/section/group
 *
 * Replaces the old "container" and "section" widgets with one unified element.
 * Choose the semantic tag (div/section/article/header/footer/main/aside/nav)
 * and optionally set a route path for page navigation.
 *
 * Prop key strategy
 * -----------------
 * Layout props (flexDirection, justifyContent, alignItems, gap) use the SAME
 * key names as DynamicInspector's Dimensions section so that inspector changes
 * are immediately reflected in the render WITHOUT going through propsToStyle().
 * propsToStyle() will additionally apply them as inline styles (via cloneElement)
 * which wins over any Tailwind class generated here, providing a consistent
 * "last write wins" behaviour.
 */
import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { ANIMATION_INSPECTOR_FIELDS } from '@/frontend/slices/studio/ui/lib/animations';

const TAG_MAP: Record<string, string> = {
    div: 'div', section: 'section', article: 'article',
    header: 'header', footer: 'footer', main: 'main', aside: 'aside', nav: 'nav',
};

// Map CSS flex-direction value → Tailwind class suffix
const FLEX_DIR_CLASS: Record<string, string> = {
    row: 'flex-row', column: 'flex-col',
    'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse',
    // legacy short values kept for backward-compat
    col: 'flex-col',
};

// Map CSS justify-content value → Tailwind class
const JUSTIFY_CLASS: Record<string, string> = {
    'flex-start': 'justify-start', center: 'justify-center',
    'flex-end': 'justify-end', 'space-between': 'justify-between',
    'space-around': 'justify-around', 'space-evenly': 'justify-evenly',
    // legacy short values
    start: 'justify-start', end: 'justify-end',
    between: 'justify-between', around: 'justify-around',
};

// Map CSS align-items value → Tailwind class
const ALIGN_CLASS: Record<string, string> = {
    'flex-start': 'items-start', center: 'items-center',
    'flex-end': 'items-end', stretch: 'items-stretch', baseline: 'items-baseline',
    // legacy short values
    start: 'items-start', end: 'items-end',
};

// Gap: static lookup table — Tailwind v4 requires complete class strings (no dynamic fragments)
// CSS rem values (e.g. '0.25rem') are skipped — propsToStyle() handles them as inline styles
const GAP_CLASS: Record<string, string> = {
    sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8',
    '1': 'gap-1', '2': 'gap-2', '3': 'gap-3', '4': 'gap-4',
    '5': 'gap-5', '6': 'gap-6', '8': 'gap-8', '10': 'gap-10', '12': 'gap-12',
};
const gapClass = (g: string | undefined) => {
    if (!g || g === '0' || g === 'none') return '';
    if (/\d+(px|rem|em|%)/.test(g)) return ''; // CSS value → propsToStyle handles it
    return GAP_CLASS[g] ?? '';
};

const divRender = (p: Record<string, any>, children?: React.ReactNode) => {
    const Tag = (TAG_MAP[p.tag] ?? 'div') as any;
    const isFlexDisplay = p.display === 'flex' || p.display === 'inline-flex';
    const isGridDisplay = p.display === 'grid';
    const cls = cn(
        // Only emit explicit display class when set to non-default value.
        // Omitting 'block' avoids conflicting with 'flex'/'grid' in className prop,
        // since browser default for div is already block.
        p.display && p.display !== 'block' && p.display !== 'Default' ? p.display : undefined,
        // flex props (only active when display=flex)
        isFlexDisplay && FLEX_DIR_CLASS[p.flexDirection ?? 'col'],
        isFlexDisplay && JUSTIFY_CLASS[p.justifyContent ?? p.justify ?? ''],
        isFlexDisplay && ALIGN_CLASS[p.alignItems ?? p.align ?? ''],
        // gap (grid or flex)
        (isFlexDisplay || isGridDisplay) && gapClass(p.gap),
        // pass-through className (templates use this for all styling)
        p.className || '',
    );
    return <Tag className={cls}>{children}</Tag>;
};

export const divManifest: WidgetConfig = {
    label: "Div",
    category: "Layout",
    description: "Universal container. Choose the HTML tag and layout mode. Use CSS Classes for full styling control.",
    icon: Square,
    defaults: {
        tag: 'div',
        path: '',
        display: 'block',
        gap: '',
        className: '',
    },
    render: divRender,
    autoConnect: {
        text: { type: 'text', props: { content: 'Content goes here', tag: 'p' } },
    },
    inspector: {
        fields: [
            { key: 'tag',            label: 'HTML Tag',      type: 'select', options: ['div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav'] },
            { key: 'path',           label: 'Route Path',    type: 'text',   placeholder: '/dashboard' },
            { key: 'display',        label: 'Display',       type: 'select', options: ['block', 'flex', 'inline-flex', 'grid', 'inline', 'inline-block'] },
            { key: 'flexDirection',  label: 'Direction',     type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
            { key: 'justifyContent', label: 'Justify',       type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
            { key: 'alignItems',     label: 'Align Items',   type: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
            { key: 'gap',            label: 'Gap',           type: 'select', options: ['', '0.25rem', '0.5rem', '1rem', '1.5rem', '2rem', '3rem'] },
            { key: 'className',      label: 'CSS Classes',   type: 'text',   placeholder: 'max-w-6xl mx-auto py-20 px-8 ...' },
            // ── Animation ──────────────────────────────────────────────────────
            ...ANIMATION_INSPECTOR_FIELDS,
        ],
    },
};
