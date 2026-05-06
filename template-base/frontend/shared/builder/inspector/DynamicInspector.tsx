import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Label, Switch, Slider } from '@/components/ui';
import {
  Trash2,
  MoreHorizontal,
  Copy,
  Lock,
  Zap,
  Eye,
  Layers,
  Type,
  Square,
  Layout,
  Paintbrush,
  Sparkles,
  AlignCenter,
  Maximize2,
} from 'lucide-react';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { useSharedCanvas } from '../canvas/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// InspectorField type - defined locally to avoid coupling to studio
export interface InspectorField {
  key: string;
  label: string;
  type:
  | 'text'
  | 'number'
  | 'select'
  | 'switch'
  | 'textarea'
  | 'custom'
  | 'nodeSelector'
  | 'slider'
  | 'color'
  | 'checkbox'
  | 'button'
  | 'buttonGroup'
  | 'range'
  | 'json';
  options?: string[];
  placeholder?: string;
  component?: React.ComponentType<any>;
  min?: number;
  max?: number;
  step?: number;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onButtonClick?: () => void;
  buttons?: Array<{ value: string; label: string; icon?: React.ComponentType<any> }>;
}
import { useInspectorControls, getNestedValue, setNestedValue } from './hooks/useInspectorControls';
import {
  InspectorSection,
  InspectorInput,
  InspectorSelect,
  InspectorButtonGroup,
} from './components/InspectorSection';
import { SectionPicker, type SectionOption } from './components/SectionPicker';
import {
  INSPECTOR_DEFAULTS,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  FONT_SIZES,
  TEXT_ALIGNMENTS,
  TEXT_DECORATIONS,
  BORDER_STYLES,
  BORDER_COLORS,
  BORDER_RADII,
  BOX_SHADOWS,
  DISPLAY_OPTIONS,
  FLEX_WRAPS,
  GAP_OPTIONS,
  toSelectOptions,
  toLabeledSelectOptions,
} from './config/inspector.config';

// ============================================================================
// VISUAL SVG ICONS — flex/layout/animation
// Each icon is a compact inline SVG that visually shows what the value means
// (no text descriptions needed — perfect for non-coders)
// ============================================================================

// --- Flex Direction ---
const FlexRowSvg = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden>
    <rect x="0" y="1" width="4" height="9" rx="1" />
    <rect x="6" y="1" width="4" height="9" rx="1" />
    <rect x="12" y="1" width="4" height="9" rx="1" />
  </svg>
);
const FlexRowRevSvg = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden>
    <rect x="0" y="1" width="4" height="9" rx="1" opacity="0.35" />
    <rect x="6" y="1" width="4" height="9" rx="1" opacity="0.65" />
    <rect x="12" y="1" width="4" height="9" rx="1" />
  </svg>
);
const FlexColSvg = () => (
  <svg width="11" height="16" viewBox="0 0 11 16" fill="currentColor" aria-hidden>
    <rect x="0.5" y="0" width="10" height="3.5" rx="1" />
    <rect x="0.5" y="5.5" width="10" height="3.5" rx="1" />
    <rect x="0.5" y="11" width="10" height="3.5" rx="1" />
  </svg>
);
const FlexColRevSvg = () => (
  <svg width="11" height="16" viewBox="0 0 11 16" fill="currentColor" aria-hidden>
    <rect x="0.5" y="0" width="10" height="3.5" rx="1" opacity="0.35" />
    <rect x="0.5" y="5.5" width="10" height="3.5" rx="1" opacity="0.65" />
    <rect x="0.5" y="11" width="10" height="3.5" rx="1" />
  </svg>
);

// --- Justify Content (horizontal) ---
const JustifyStartSvg = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" aria-hidden>
    <rect x="0" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="5" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="10" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="19" y="0" width="1" height="12" rx="0.5" opacity="0.2" />
  </svg>
);
const JustifyCenterSvg = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" aria-hidden>
    <rect x="3" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="8" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="13" y="1.5" width="4" height="9" rx="0.8" />
  </svg>
);
const JustifyEndSvg = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" aria-hidden>
    <rect x="0" y="0" width="1" height="12" rx="0.5" opacity="0.2" />
    <rect x="6" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="11" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="16" y="1.5" width="4" height="9" rx="0.8" />
  </svg>
);
/** space-between: first & last flush to edges, equal gaps between */
const JustifyBetweenSvg = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" aria-hidden>
    <rect x="0" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="8" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="16" y="1.5" width="4" height="9" rx="0.8" />
  </svg>
);
/** space-around: equal space on both sides of each item */
const JustifyAroundSvg = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" aria-hidden>
    <rect x="1.5" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="8" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="14.5" y="1.5" width="4" height="9" rx="0.8" />
    {/* space dots */}
    <circle cx="0.5" cy="6" r="0.6" opacity="0.3" />
    <circle cx="6.5" cy="6" r="0.6" opacity="0.3" />
    <circle cx="13" cy="6" r="0.6" opacity="0.3" />
    <circle cx="19.5" cy="6" r="0.6" opacity="0.3" />
  </svg>
);
/** space-evenly: exactly equal gaps everywhere including edges */
const JustifyEvenlySvg = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" aria-hidden>
    <rect x="2" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="8" y="1.5" width="4" height="9" rx="0.8" />
    <rect x="14" y="1.5" width="4" height="9" rx="0.8" />
  </svg>
);

// --- Align Items (vertical in a row container) ---
/** stretch: both boxes fill full height */
const AlignStretchSvg = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor" aria-hidden>
    <rect x="1" y="1" width="5" height="12" rx="0.8" />
    <rect x="9" y="1" width="5" height="12" rx="0.8" />
  </svg>
);
/** flex-start: boxes aligned to top */
const AlignStartSvg = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor" aria-hidden>
    <line x1="0" y1="0.5" x2="16" y2="0.5" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
    <rect x="1" y="1.5" width="5" height="12" rx="0.8" />
    <rect x="9" y="1.5" width="5" height="7" rx="0.8" />
  </svg>
);
/** center: boxes centered vertically */
const AlignCenterSvg = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor" aria-hidden>
    <rect x="1" y="1" width="5" height="12" rx="0.8" />
    <rect x="9" y="3.5" width="5" height="7" rx="0.8" />
  </svg>
);
/** flex-end: boxes aligned to bottom */
const AlignEndSvg = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor" aria-hidden>
    <line x1="0" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
    <rect x="1" y="1" width="5" height="12" rx="0.8" />
    <rect x="9" y="5.5" width="5" height="7.5" rx="0.8" />
  </svg>
);
/** baseline: aligned to first text baseline */
const AlignBaselineSvg = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor" aria-hidden>
    <rect x="1" y="2" width="5" height="10" rx="0.8" />
    <rect x="9" y="5" width="5" height="7" rx="0.8" />
    <line x1="0" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.45" strokeDasharray="2 1.5" />
  </svg>
);

// --- Animation Type Icons ---
const AnimFadeSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" opacity="0.2" />
    <rect x="5" y="5" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.6" />
    <rect x="6" y="6" width="4" height="4" rx="1" fill="currentColor" />
  </svg>
);
const AnimSlideSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <rect x="6" y="4" width="8" height="8" rx="1.5" />
    <path d="M5 8H1M1 8L3.5 5.5M1 8L3.5 10.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const AnimScaleSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <rect x="0.5" y="5" width="5" height="5" rx="0.8" opacity="0.35" />
    <rect x="7" y="2" width="8" height="8" rx="1.5" opacity="0.9" />
    <path d="M5.5 7.5L7 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
  </svg>
);
const AnimBounceSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <rect x="5" y="2" width="6" height="6" rx="1.5" />
    <path d="M2 13 Q5 10 8 13 Q11 16 14 13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);
const AnimSpinSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="8" cy="8" r="5.5" strokeDasharray="8 4" strokeLinecap="round" />
    <path d="M8 2.5V5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// NODE CATEGORY DETECTION
// Used to set smart section defaults per node type
// ============================================================================
const CONTAINER_NODES = ['div', 'section', 'container', 'flex', 'grid', 'group', 'page', 'card', 'box', 'hero', 'row', 'col', 'panel'];
const TEXT_NODES = ['heading', 'paragraph', 'text', 'label', 'span', 'h1', 'h2', 'h3', 'p', 'richtext', 'markdown'];
const BUTTON_NODES = ['button', 'link', 'iconbutton', 'badge', 'cta'];
const FORM_NODES = ['input', 'select', 'checkbox', 'radio', 'textarea', 'switch', 'form', 'slider'];

type NodeCategory = 'container' | 'text' | 'button' | 'form' | 'other';
function getNodeCategory(comp: string): NodeCategory {
  const lc = comp.toLowerCase();
  if (CONTAINER_NODES.some(n => lc.includes(n))) return 'container';
  if (TEXT_NODES.some(n => lc.includes(n))) return 'text';
  if (BUTTON_NODES.some(n => lc.includes(n))) return 'button';
  if (FORM_NODES.some(n => lc.includes(n))) return 'form';
  return 'other';
}

/** Default sections shown per node category — containers → layout, text → typography */
const CATEGORY_DEFAULT_SECTIONS: Record<NodeCategory, string[]> = {
  container: ['layout'],
  text: ['typography'],
  button: [],
  form: [],
  other: [],
};

// ============================================================================
// INSPECTOR SECTION OPTIONS (for SectionPicker)
// ============================================================================
const INSPECTOR_SECTION_OPTIONS: SectionOption[] = [
  {
    id: 'typography',
    label: 'Typography',
    description: 'Font, size, weight, alignment',
    icon: <Type className="h-3.5 w-3.5" />,
  },
  {
    id: 'layout',
    label: 'Layout & Spacing',
    description: 'Size, display, flex, gap, padding, margin',
    icon: <Layout className="h-3.5 w-3.5" />,
  },
  {
    id: 'border',
    label: 'Border & Radius',
    description: 'Border style, color, corner radius',
    icon: <Square className="h-3.5 w-3.5" />,
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Opacity and shadow effects',
    icon: <Eye className="h-3.5 w-3.5" />,
  },
  {
    id: 'animation',
    label: 'Animation',
    description: 'CSS transitions and hover effects',
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
];

const LS_KEY = 'studio-inspector-active-sections';

/** Persists active sections per node category in localStorage */
function useActiveInspectorSections(comp: string) {
  const category = getNodeCategory(comp);

  const [activeSections, setActiveSections] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data[category]) return new Set<string>(data[category]);
      }
    } catch {}
    return new Set<string>(CATEGORY_DEFAULT_SECTIONS[category]);
  });

  // When node category changes, reload from localStorage (or defaults)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data[category]) {
          setActiveSections(new Set<string>(data[category]));
          return;
        }
      }
    } catch {}
    setActiveSections(new Set<string>(CATEGORY_DEFAULT_SECTIONS[category]));
  }, [category]);

  const updateSections = useCallback(
    (next: Set<string>) => {
      setActiveSections(next);
      try {
        const stored = localStorage.getItem(LS_KEY);
        const data = stored ? JSON.parse(stored) : {};
        data[category] = Array.from(next);
        localStorage.setItem(LS_KEY, JSON.stringify(data));
      } catch {}
    },
    [category]
  );

  return { activeSections, updateSections };
}

// ============================================================================
// JSON FIELD EDITOR
// ============================================================================
function JsonFieldEditor({
  value,
  placeholder,
  nodeId,
  onChange,
}: {
  value: any;
  placeholder?: string;
  nodeId?: string;
  onChange: (v: any) => void;
}) {
  const toStr = (v: any) =>
    typeof v === 'string' ? v : JSON.stringify(v ?? [], null, 2);
  const [text, setText] = React.useState(() => toStr(value));
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setText(toStr(value));
    setHasError(false);
  }, [nodeId, value]);

  return (
    <div className="space-y-1">
      <textarea
        value={text}
        onChange={e => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setHasError(false);
          } catch {
            setHasError(true);
          }
        }}
        placeholder={placeholder || '[]'}
        rows={5}
        className={`w-full px-2.5 py-1.5 text-xs rounded-md border font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring bg-background ${hasError ? 'border-destructive' : 'border-border/50'}`}
      />
      {hasError && <p className="text-[10px] text-destructive">Invalid JSON</p>}
      <p className="text-[10px] text-muted-foreground">Changes apply on valid JSON.</p>
    </div>
  );
}

// ============================================================================
// NODE INFO BAR
// ============================================================================
function NodeInfoBar({
  node,
  childrenCount,
  propCount,
}: {
  node: any;
  childrenCount: number;
  propCount: number;
}) {
  const { setNodeProps } = useSharedCanvas();
  const comp = node?.data?.comp || 'Unknown';
  const id = node?.id || '';
  const currentLabel = node?.data?.label || '';

  const [editing, setEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(currentLabel);

  const commitLabel = () => {
    setEditing(false);
    const trimmed = labelValue.trim();
    setNodeProps(id, { ...node.data.props, _label: trimmed || undefined });
  };

  return (
    <div className="flex flex-col border-b border-border/50 bg-muted/20">
      {/* Editable display name row */}
      <div className="flex items-center gap-1.5 px-3 pt-1.5 pb-0.5">
        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold shrink-0">
          {comp}
        </span>
        {editing ? (
          <input
            autoFocus
            value={labelValue}
            onChange={e => setLabelValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitLabel(); if (e.key === 'Escape') setEditing(false); }}
            onBlur={commitLabel}
            placeholder="Add label..."
            className="flex-1 text-[10px] bg-transparent border-b border-primary outline-none text-foreground min-w-0"
          />
        ) : (
          <button
            onClick={() => { setLabelValue(currentLabel); setEditing(true); }}
            className="flex-1 text-left text-[10px] text-muted-foreground hover:text-foreground transition-colors truncate min-w-0"
            title="Click to rename"
          >
            {currentLabel || <span className="italic opacity-50">Add label…</span>}
          </button>
        )}
      </div>
      {/* Meta row */}
      <div className="flex items-center gap-1.5 px-3 pb-1.5 text-xs flex-wrap">
        {childrenCount > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium text-[10px]">
            {childrenCount} {childrenCount === 1 ? 'child' : 'children'}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground cursor-default select-none">
          {propCount} props
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/30 truncate max-w-[72px]" title={id}>
          #{id.slice(0, 6)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK PRESETS
// ============================================================================
const QUICK_PRESETS = [
  {
    label: 'Full Width',
    icon: <Maximize2 className="h-3 w-3" />,
    apply: { width: '100%', height: 'auto' },
    hint: 'Makes element fill its container horizontally',
  },
  {
    label: 'Center',
    icon: <AlignCenter className="h-3 w-3" />,
    apply: { marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' },
    hint: 'Centers element horizontally',
  },
  {
    label: 'Card',
    icon: <Square className="h-3 w-3" />,
    apply: {
      paddingTop: '16px',
      paddingBottom: '16px',
      paddingLeft: '16px',
      paddingRight: '16px',
      borderRadius: 'rounded-lg',
      boxShadow: 'shadow-md',
    },
    hint: 'Adds padding and a card shadow',
  },
  {
    label: 'Hidden',
    icon: <Eye className="h-3 w-3" />,
    apply: { opacity: '0' },
    hint: 'Hides the element (opacity 0)',
  },
];

function QuickPresets({ onApply }: { onApply: (props: Record<string, any>) => void }) {
  return (
    <div className="px-3 pt-2.5 pb-2">
      <div className="flex items-center gap-1 mb-2">
        <Zap className="h-3 w-3 text-yellow-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Apply
        </span>
      </div>
      <TooltipProvider delayDuration={400}>
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_PRESETS.map(p => (
            <Tooltip key={p.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onApply(p.apply)}
                  className="flex flex-col items-center gap-1 px-1 py-2 rounded-lg border border-border/50 bg-background hover:bg-muted/50 hover:border-primary/40 transition-all text-center group"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {p.icon}
                  </span>
                  <span className="text-[9px] text-muted-foreground group-hover:text-foreground leading-none font-medium">
                    {p.label}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{p.hint}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

// ============================================================================
// COMPACT COLOR ROW — always visible, 2-column
// ============================================================================
function CompactColorRow({
  textColor,
  bgColor,
  onTextColor,
  onBgColor,
}: {
  textColor: string;
  bgColor: string;
  onTextColor: (v: string) => void;
  onBgColor: (v: string) => void;
}) {
  return (
    <div className="px-3 py-2.5 border-b border-border/50">
      <div className="grid grid-cols-2 gap-2">
        {/* Text Color */}
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <Type className="h-2.5 w-2.5" />
            Text color
          </span>
          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/50 bg-background hover:border-primary/40 cursor-pointer transition-colors group">
            <div
              className="w-4 h-4 rounded-[3px] border border-border/50 shrink-0"
              style={{ backgroundColor: textColor || '#111111' }}
            />
            <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
              {textColor || 'default'}
            </span>
            <input
              type="color"
              value={textColor || '#111111'}
              onChange={e => onTextColor(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
        {/* Background Color */}
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <Paintbrush className="h-2.5 w-2.5" />
            Background
          </span>
          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/50 bg-background hover:border-primary/40 cursor-pointer transition-colors group">
            <div
              className="w-4 h-4 rounded-[3px] border border-border/50 shrink-0"
              style={{
                background: bgColor
                  ? bgColor
                  : 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 0 0 / 8px 8px',
              }}
            />
            <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
              {bgColor || 'none'}
            </span>
            <input
              type="color"
              value={bgColor || '#ffffff'}
              onChange={e => onBgColor(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SPACING GRID (TRBL) — 4-column, shadcn sidebar block style
// ============================================================================
function SpacingGrid({
  prefix,
  getProp,
  setProp,
}: {
  prefix: 'margin' | 'padding';
  getProp: (k: string) => any;
  setProp: (k: string, v: any) => void;
}) {
  const sides = [
    { key: 'Top', label: 'T', title: 'Top' },
    { key: 'Right', label: 'R', title: 'Right' },
    { key: 'Bottom', label: 'B', title: 'Bottom' },
    { key: 'Left', label: 'L', title: 'Left' },
  ];
  const isMargin = prefix === 'margin';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${isMargin ? 'text-orange-500' : 'text-blue-500'}`}
        >
          {prefix === 'margin' ? '↔ Margin' : '↕ Padding'}
        </span>
        {/* Lock all equal button */}
        <button
          type="button"
          className="flex items-center gap-1 text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          title={`Set all ${prefix} sides equal`}
          onClick={() => {
            const val = getProp(`${prefix}Top`);
            sides.forEach(s => setProp(`${prefix}${s.key}`, val));
          }}
        >
          <Lock className="h-2.5 w-2.5" />
          lock all
        </button>
      </div>
      {/* 4-column TRBL grid — shadcn sidebar block reference */}
      <div className="grid grid-cols-4 gap-1.5">
        {sides.map(({ key, label, title }) => (
          <div key={key} className="space-y-0.5">
            <span className="text-[9px] text-muted-foreground/60 text-center block font-medium">
              {label}
            </span>
            <input
              type="text"
              value={getProp(`${prefix}${key}`) ?? ''}
              onChange={e => setProp(`${prefix}${key}`, e.target.value)}
              placeholder="0"
              title={`${prefix} ${title.toLowerCase()}`}
              className="w-full text-center text-xs h-7 bg-background border border-border/50 rounded-md px-1 py-0.5 outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors placeholder:text-muted-foreground/40"
            />
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground/40 px-0.5">
        {isMargin
          ? 'Space outside this element (px, %, rem)'
          : 'Space inside this element (px, %, rem)'}
      </p>
    </div>
  );
}

// ============================================================================
// OPACITY CONTROL
// ============================================================================
function OpacityControl({ value, onChange }: { value: any; onChange: (v: string) => void }) {
  const raw = value === '' || value === undefined ? 1 : Number(value);
  const pct = Math.round(Math.min(Math.max(raw, 0), 1) * 100);
  const isHidden = pct === 0;
  const isPartial = pct > 0 && pct < 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Eye className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Visibility</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isHidden && (
            <span className="text-[9px] text-orange-500 font-medium">Hidden</span>
          )}
          {isPartial && (
            <span className="text-[9px] text-yellow-500 font-medium">Partial</span>
          )}
          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground min-w-[36px] text-center">
            {pct}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded border border-border/50 shrink-0 relative overflow-hidden"
          style={{
            background: 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px',
          }}
        >
          <div className="absolute inset-0 bg-foreground" style={{ opacity: raw }} />
        </div>
        <Slider
          value={[pct]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => onChange(String(v / 100))}
          className="flex-1"
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/50 px-0.5">
        <span>Invisible</span>
        <span>Fully visible</span>
      </div>
    </div>
  );
}

// ============================================================================
// TYPOGRAPHY PREVIEW
// ============================================================================
function TypographyPreview({ props }: { props: Record<string, any> }) {
  const style: React.CSSProperties = {
    fontFamily: props.fontFamily || 'inherit',
    fontWeight: props.fontWeight || 'normal',
    fontSize: props.fontSize || '14px',
    textAlign: (props.textAlign as any) || 'left',
    textDecoration: props.textDecoration || 'none',
    lineHeight: props.lineHeight || 'normal',
    letterSpacing: props.letterSpacing || 'normal',
    color: props.color || 'currentColor',
  };
  return (
    <div className="px-3 py-2 rounded-lg border border-border/50 bg-muted/10 mt-1">
      <p className="text-[9px] text-muted-foreground/60 mb-1 uppercase tracking-wide">Preview</p>
      <p style={style} className="truncate text-sm">
        The quick brown fox jumps over the lazy dog
      </p>
    </div>
  );
}

// ============================================================================
// SHADOW PREVIEW
// ============================================================================
const SHADOW_CSS_MAP: Record<string, string> = {
  'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  'shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  'shadow-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

function ShadowPreview({ value }: { value: string }) {
  if (!value || value === 'none' || value === '') return null;
  const cssVal = SHADOW_CSS_MAP[value] || value;
  return (
    <div className="flex items-center justify-center py-4 bg-muted/20 rounded-lg mt-1">
      <div
        className="w-16 h-10 rounded-lg bg-background border border-border/30"
        style={{ boxShadow: cssVal }}
      />
    </div>
  );
}

// ============================================================================
// BORDER RADIUS PREVIEW
// ============================================================================
function BorderRadiusPreview({ value }: { value: string }) {
  const radiiMap: Record<string, string> = {
    'rounded-none': '0px',
    'rounded-sm': '2px',
    rounded: '4px',
    'rounded-md': '6px',
    'rounded-lg': '8px',
    'rounded-xl': '12px',
    'rounded-2xl': '16px',
    'rounded-3xl': '24px',
    'rounded-full': '9999px',
  };
  const cssVal = radiiMap[value] || value;
  if (!cssVal || cssVal === '0px') return null;
  return (
    <div className="flex items-center gap-2 mt-1 px-2 py-1.5 bg-muted/20 rounded-lg">
      <div
        className="w-6 h-6 bg-primary/30 border border-primary/40 shrink-0"
        style={{ borderRadius: cssVal }}
      />
      <span className="text-[10px] text-muted-foreground">{cssVal} radius</span>
    </div>
  );
}

// ============================================================================
// ANIMATION OPTIONS (new section — CSS transitions)
// ============================================================================
const ANIM_TRANSITIONS = [
  { value: 'none', label: 'None', icon: <span className="opacity-30">—</span> },
  { value: 'all', label: 'All', icon: <AnimFadeSvg /> },
  { value: 'colors', label: 'Colors', icon: <Paintbrush className="h-3 w-3" /> },
  { value: 'opacity', label: 'Fade', icon: <AnimFadeSvg /> },
  { value: 'transform', label: 'Move', icon: <AnimSlideSvg /> },
];
const ANIM_DURATIONS = [
  { value: '150ms', label: '150ms (Snap)' },
  { value: '300ms', label: '300ms (Fast)' },
  { value: '500ms', label: '500ms (Smooth)' },
  { value: '700ms', label: '700ms (Slow)' },
  { value: '1000ms', label: '1s (Very Slow)' },
];
const ANIM_EASINGS = [
  { value: 'ease', label: 'Ease (Natural)' },
  { value: 'ease-in', label: 'Ease In (Start slow)' },
  { value: 'ease-out', label: 'Ease Out (End slow)' },
  { value: 'ease-in-out', label: 'Ease In-Out (Both)' },
  { value: 'linear', label: 'Linear (Constant)' },
];
const HOVER_EFFECTS = [
  { value: '', label: 'None', icon: <span className="opacity-30">—</span> },
  { value: 'scale', label: 'Grow', icon: <AnimScaleSvg /> },
  { value: 'opacity', label: 'Dim', icon: <AnimFadeSvg /> },
  { value: 'lift', label: 'Lift', icon: <AnimBounceSvg /> },
];

// ============================================================================
// MAIN INSPECTOR PROPS
// ============================================================================
interface DynamicInspectorProps {
  selectedNode: any | null;
  getWidgetFields?: (comp: string) => InspectorField[] | undefined;
}

export function DynamicInspector({ selectedNode, getWidgetFields }: DynamicInspectorProps) {
  const registry = useCrossFeatureRegistry();
  const canvas = useSharedCanvas();
  const controls = useInspectorControls(selectedNode?.data.comp || '');

  const comp = selectedNode?.data?.comp || '';
  const { activeSections, updateSections } = useActiveInspectorSections(comp);

  const currentProps = useMemo(() => {
    if (!selectedNode) return {};
    return selectedNode.data.props || {};
  }, [selectedNode]);

  const getProp = useCallback(
    (key: string) => {
      return currentProps[key] ?? INSPECTOR_DEFAULTS[key as keyof typeof INSPECTOR_DEFAULTS] ?? '';
    },
    [currentProps]
  );

  const setProp = useCallback(
    (path: string, value: any) => {
      if (!selectedNode) return;
      const newProps = { ...currentProps };
      setNestedValue(newProps, path, value);
      canvas.setNodeProps(selectedNode.id, newProps);
    },
    [selectedNode, currentProps, canvas]
  );

  const applyPreset = useCallback(
    (preset: Record<string, any>) => {
      if (!selectedNode) return;
      canvas.setNodeProps(selectedNode.id, { ...currentProps, ...preset });
    },
    [selectedNode, currentProps, canvas]
  );

  // ── Empty State ──────────────────────────────────────────────────────────
  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-5 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Layers className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Nothing selected</p>
          <p className="text-xs text-muted-foreground">
            Click any element on the canvas to edit it here
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2 text-left mt-2">
          {[
            { step: '1', text: 'Click a component on the canvas' },
            { step: '2', text: 'Edit colors, fonts, spacing & more' },
            { step: '3', text: 'Changes appear instantly in preview' },
          ].map(item => (
            <div
              key={item.step}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/30 border border-border/30"
            >
              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {item.step}
              </span>
              <span className="text-xs text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const widget =
    registry.getWidget(selectedNode.data.comp) ||
    registry.getComponent(selectedNode.data.comp);
  const nodeType = widget?.label || selectedNode.data.comp;
  const childrenCount = canvas.childrenOrdered?.length ?? 0;
  const propCount = Object.keys(currentProps).filter(
    k => currentProps[k] !== '' && currentProps[k] !== undefined
  ).length;

  const widgetFields: InspectorField[] =
    (getWidgetFields ? getWidgetFields(selectedNode.data.comp) : undefined) ?? [];

  // ── Field Renderer ───────────────────────────────────────────────────────
  const renderField = (field: InspectorField) => {
    const value = currentProps[field.key] ?? '';
    const update = (v: any) => setProp(field.key, v);
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.key}
            value={value}
            onChange={e => update(e.target.value)}
            placeholder={field.placeholder}
            className="w-full min-h-[64px] px-2.5 py-1.5 text-sm rounded-lg border border-border/50 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        );
      case 'select':
        return (
          <select
            key={field.key}
            value={value}
            onChange={e => update(e.target.value)}
            className="w-full h-8 px-2.5 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {(field.options || []).map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      case 'switch':
      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center gap-2">
            <Switch checked={!!value} onCheckedChange={update} />
          </div>
        );
      case 'color':
        return (
          <input
            key={field.key}
            type="color"
            value={value || '#000000'}
            onChange={e => update(e.target.value)}
            className="h-8 w-full rounded-lg border border-border/50"
          />
        );
      case 'slider':
      case 'range':
        return (
          <div key={field.key} className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-muted-foreground">{field.min ?? 0}</span>
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                {Number(value) || field.min || 0}
              </span>
              <span className="text-[10px] text-muted-foreground">{field.max ?? 100}</span>
            </div>
            <Slider
              value={[Number(value) || field.min || 0]}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              onValueChange={([v]) => update(v)}
              className="w-full"
            />
          </div>
        );
      case 'number':
        return (
          <Input
            key={field.key}
            type="number"
            value={value}
            onChange={e => update(Number(e.target.value))}
            placeholder={field.placeholder}
            className="h-8"
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
      case 'json':
        return (
          <JsonFieldEditor
            key={field.key}
            value={value}
            placeholder={field.placeholder}
            nodeId={selectedNode?.id}
            onChange={update}
          />
        );
      case 'custom':
        if (field.component) {
          const Comp = field.component;
          return <Comp key={field.key} value={value} onChange={update} />;
        }
        return null;
      default:
        return (
          <Input
            key={field.key}
            value={value}
            onChange={e => update(e.target.value)}
            placeholder={field.placeholder}
            className="h-8"
          />
        );
    }
  };

  // ── Button group options with visual SVG icons ───────────────────────────
  const alignmentOptions = TEXT_ALIGNMENTS.map(a => ({
    value: a.value,
    icon: <a.icon className="h-3.5 w-3.5" />,
    label: a.label,
  }));
  const decorationOptions = TEXT_DECORATIONS.map(d => ({
    value: d.value,
    icon: <d.icon className="h-3.5 w-3.5" />,
    label: d.label,
  }));

  // Visual flex direction options
  const flexDirOptions = [
    { value: 'row', icon: <FlexRowSvg />, label: 'Row →' },
    { value: 'row-reverse', icon: <FlexRowRevSvg />, label: 'Row ←' },
    { value: 'column', icon: <FlexColSvg />, label: 'Column ↓' },
    { value: 'column-reverse', icon: <FlexColRevSvg />, label: 'Column ↑' },
  ];

  // Visual justify-content options (shows exact spacing behaviour)
  const justifyOptions = [
    { value: 'flex-start', icon: <JustifyStartSvg />, label: 'Start — items at beginning' },
    { value: 'center', icon: <JustifyCenterSvg />, label: 'Center — items centered' },
    { value: 'flex-end', icon: <JustifyEndSvg />, label: 'End — items at end' },
    {
      value: 'space-between',
      icon: <JustifyBetweenSvg />,
      label: 'Space Between — equal gaps, flush edges',
    },
    {
      value: 'space-around',
      icon: <JustifyAroundSvg />,
      label: 'Space Around — equal space each side',
    },
    {
      value: 'space-evenly',
      icon: <JustifyEvenlySvg />,
      label: 'Space Evenly — all gaps equal',
    },
  ];

  // Visual align-items options (shows vertical alignment in row)
  const alignOptions = [
    { value: 'stretch', icon: <AlignStretchSvg />, label: 'Stretch — fill container height' },
    { value: 'flex-start', icon: <AlignStartSvg />, label: 'Start — align to top' },
    { value: 'center', icon: <AlignCenterSvg />, label: 'Center — align to middle' },
    { value: 'flex-end', icon: <AlignEndSvg />, label: 'End — align to bottom' },
    { value: 'baseline', icon: <AlignBaselineSvg />, label: 'Baseline — align by text baseline' },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ── Header: element type + action buttons ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary text-base leading-none shrink-0">◇</span>
          <span className="text-sm font-semibold truncate">{nodeType}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Copy node"
            onClick={() => canvas.copy?.()}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive/70 hover:text-destructive"
            title="Delete node"
            onClick={() => canvas.removeSelectedNode?.()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Node info bar ── */}
      <NodeInfoBar node={selectedNode} childrenCount={childrenCount} propCount={propCount} />

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Quick Presets */}
        <QuickPresets onApply={applyPreset} />

        {/* ━━━ ALWAYS VISIBLE: Content section ━━━ */}
        {(widgetFields.length > 0 || currentProps.content !== undefined) && (
          <InspectorSection title="Content" defaultOpen>
            <div className="space-y-3">
              {widgetFields.map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{field.label}</Label>
                  {renderField(field)}
                </div>
              ))}
              {currentProps.content !== undefined &&
                !widgetFields.some(f => f.key === 'content') && (
                  <textarea
                    value={currentProps.content || ''}
                    onChange={e => setProp('content', e.target.value)}
                    placeholder="Add content…"
                    className="w-full min-h-[80px] px-3 py-2 text-sm rounded-lg border border-border/50 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                )}
            </div>
          </InspectorSection>
        )}

        {/* ━━━ ALWAYS VISIBLE: Compact Color Row ━━━ */}
        <CompactColorRow
          textColor={getProp('color')}
          bgColor={getProp('backgroundColor')}
          onTextColor={v => setProp('color', v)}
          onBgColor={v => setProp('backgroundColor', v)}
        />

        {/* ━━━ DYNAMIC SECTIONS (toggled via SectionPicker) ━━━ */}

        {/* ── Typography ── */}
        {activeSections.has('typography') && (
          <InspectorSection
            title="Typography"
            icon={Type}
            defaultOpen
          >
            {/* Shadcn sidebar 2-column reference: label left + control right */}
            <div className="space-y-2.5">
              {/* Font Family — full row */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground shrink-0">Family</Label>
                <InspectorSelect
                  value={getProp('fontFamily')}
                  onChange={v => setProp('fontFamily', v)}
                  options={toSelectOptions(FONT_FAMILIES)}
                />
              </div>

              {/* Weight + Size — 2 equal columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Weight</Label>
                  <InspectorSelect
                    value={getProp('fontWeight')}
                    onChange={v => setProp('fontWeight', v)}
                    options={toLabeledSelectOptions(FONT_WEIGHTS)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Size</Label>
                  <InspectorSelect
                    value={getProp('fontSize')}
                    onChange={v => setProp('fontSize', v)}
                    options={toLabeledSelectOptions(FONT_SIZES)}
                  />
                </div>
              </div>

              {/* Line Height + Letter Spacing — 2 equal columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Line Height</Label>
                  <InspectorInput
                    value={getProp('lineHeight')}
                    onChange={v => setProp('lineHeight', v)}
                    placeholder="1.5"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Letter Spacing</Label>
                  <InspectorInput
                    value={getProp('letterSpacing')}
                    onChange={v => setProp('letterSpacing', v)}
                    placeholder="normal"
                  />
                </div>
              </div>

              {/* Alignment + Decoration — button groups, 2 equal columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Align</Label>
                  <InspectorButtonGroup
                    value={getProp('textAlign')}
                    onChange={v => setProp('textAlign', v)}
                    options={alignmentOptions}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Style</Label>
                  <InspectorButtonGroup
                    value={getProp('textDecoration')}
                    onChange={v => setProp('textDecoration', v)}
                    options={decorationOptions}
                  />
                </div>
              </div>

              {/* Live preview */}
              <TypographyPreview props={currentProps} />
            </div>
          </InspectorSection>
        )}

        {/* ── Layout & Spacing (merged: size + display + flex + spacing) ── */}
        {activeSections.has('layout') && (
          <InspectorSection title="Layout & Spacing" icon={Layout} defaultOpen>
            <div className="space-y-3">

              {/* Width + Height — 2-col */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Width</Label>
                  <InspectorInput value={getProp('width')} onChange={v => setProp('width', v)} placeholder="auto" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Height</Label>
                  <InspectorInput value={getProp('height')} onChange={v => setProp('height', v)} placeholder="auto" />
                </div>
              </div>

              {/* Display — single row (determines whether flex controls appear) */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground shrink-0">Display</Label>
                <InspectorSelect
                  value={getProp('display')}
                  onChange={v => setProp('display', v)}
                  options={toLabeledSelectOptions(DISPLAY_OPTIONS)}
                />
              </div>

              {/* Flex controls — only meaningful when display is flex/inline-flex */}
              <div className="space-y-3 border-t border-border/30 pt-3">
                {/* Flex Direction — visual SVG button group */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">
                    Direction
                    <span className="ml-1.5 text-muted-foreground/50">— arrange children</span>
                  </Label>
                  <InspectorButtonGroup
                    value={getProp('flexDirection')}
                    onChange={v => setProp('flexDirection', v)}
                    options={flexDirOptions}
                  />
                </div>

                {/* Justify Content — 6 visual SVG icons */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">
                    Justify
                    <span className="ml-1.5 text-muted-foreground/50">— main axis spacing</span>
                  </Label>
                  <div className="grid grid-cols-6 border border-border/50 rounded-lg overflow-hidden">
                    {justifyOptions.map((opt, idx) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProp('justifyContent', getProp('justifyContent') === opt.value ? '' : opt.value)}
                        title={opt.label}
                        className={`flex items-center justify-center p-2 transition-colors ${idx > 0 ? 'border-l border-border/50' : ''} ${getProp('justifyContent') === opt.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                      >{opt.icon}</button>
                    ))}
                  </div>
                  {getProp('justifyContent') && (
                    <p className="text-[9px] text-muted-foreground/60 px-0.5">
                      {justifyOptions.find(o => o.value === getProp('justifyContent'))?.label}
                    </p>
                  )}
                </div>

                {/* Align Items — 5 visual SVG icons */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">
                    Align
                    <span className="ml-1.5 text-muted-foreground/50">— cross axis</span>
                  </Label>
                  <div className="grid grid-cols-5 border border-border/50 rounded-lg overflow-hidden">
                    {alignOptions.map((opt, idx) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProp('alignItems', getProp('alignItems') === opt.value ? '' : opt.value)}
                        title={opt.label}
                        className={`flex items-center justify-center p-2 transition-colors ${idx > 0 ? 'border-l border-border/50' : ''} ${getProp('alignItems') === opt.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                      >{opt.icon}</button>
                    ))}
                  </div>
                  {getProp('alignItems') && (
                    <p className="text-[9px] text-muted-foreground/60 px-0.5">
                      {alignOptions.find(o => o.value === getProp('alignItems'))?.label}
                    </p>
                  )}
                </div>

                {/* Gap + Wrap — 2-col */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Gap</Label>
                    <InspectorSelect value={getProp('gap')} onChange={v => setProp('gap', v)} options={toLabeledSelectOptions(GAP_OPTIONS)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Wrap</Label>
                    <InspectorSelect value={getProp('flexWrap')} onChange={v => setProp('flexWrap', v)} options={toLabeledSelectOptions(FLEX_WRAPS)} />
                  </div>
                </div>
              </div>

              {/* Spacing: Padding + Margin TRBL */}
              <div className="border-t border-border/30 pt-3 space-y-3">
                <SpacingGrid prefix="padding" getProp={getProp} setProp={setProp} />
                <SpacingGrid prefix="margin" getProp={getProp} setProp={setProp} />
              </div>
            </div>
          </InspectorSection>
        )}

        {/* ── Border & Radius ── */}
        {activeSections.has('border') && (
          <InspectorSection title="Border & Radius" icon={Square} defaultOpen={false}>
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Style</Label>
                  <InspectorSelect
                    value={getProp('borderStyle')}
                    onChange={v => setProp('borderStyle', v)}
                    options={toSelectOptions(BORDER_STYLES)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Width</Label>
                  <InspectorInput
                    value={getProp('borderWidth')}
                    onChange={v => setProp('borderWidth', v)}
                    placeholder="1px"
                  />
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground shrink-0">Color</Label>
                <InspectorSelect
                  value={getProp('borderColor')}
                  onChange={v => setProp('borderColor', v)}
                  options={toLabeledSelectOptions(BORDER_COLORS)}
                />
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground shrink-0">Radius</Label>
                <InspectorSelect
                  value={getProp('borderRadius')}
                  onChange={v => setProp('borderRadius', v)}
                  options={toLabeledSelectOptions(BORDER_RADII)}
                />
              </div>
              <BorderRadiusPreview value={getProp('borderRadius')} />
            </div>
          </InspectorSection>
        )}

        {/* ── Appearance (Opacity + Shadow) ── */}
        {activeSections.has('appearance') && (
          <InspectorSection title="Appearance" icon={Eye} defaultOpen={false}>
            <div className="space-y-4">
              <OpacityControl value={getProp('opacity')} onChange={v => setProp('opacity', v)} />
              <div className="space-y-2">
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <Label className="text-[10px] text-muted-foreground shrink-0">Shadow</Label>
                  <InspectorSelect
                    value={getProp('boxShadow')}
                    onChange={v => setProp('boxShadow', v)}
                    options={toLabeledSelectOptions(BOX_SHADOWS)}
                  />
                </div>
                <ShadowPreview value={getProp('boxShadow')} />
              </div>
            </div>
          </InspectorSection>
        )}

        {/* ── Animation ── */}
        {activeSections.has('animation') && (
          <InspectorSection title="Animation" icon={Sparkles} defaultOpen={false}>
            <div className="space-y-3">
              {/* Transition type */}
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">
                  Transition
                  <span className="ml-1.5 text-muted-foreground/50">
                    — animate on state change
                  </span>
                </Label>
                <div className="grid grid-cols-5 border border-border/50 rounded-lg overflow-hidden">
                  {ANIM_TRANSITIONS.map((opt, idx) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setProp(
                          'transition',
                          getProp('transition') === opt.value ? '' : opt.value
                        )
                      }
                      title={opt.label}
                      className={`flex flex-col items-center gap-0.5 p-2 transition-colors ${idx > 0 ? 'border-l border-border/50' : ''} ${getProp('transition') === opt.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                    >
                      {opt.icon}
                      <span className="text-[8px] leading-none">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration + Easing — 2-col */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Duration</Label>
                  <InspectorSelect
                    value={getProp('transitionDuration')}
                    onChange={v => setProp('transitionDuration', v)}
                    options={ANIM_DURATIONS}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Easing</Label>
                  <InspectorSelect
                    value={getProp('transitionTimingFunction')}
                    onChange={v => setProp('transitionTimingFunction', v)}
                    options={ANIM_EASINGS}
                  />
                </div>
              </div>

              {/* Hover effect */}
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">
                  Hover Effect
                  <span className="ml-1.5 text-muted-foreground/50">— on mouse over</span>
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {HOVER_EFFECTS.map(opt => {
                    const isActive = getProp('hoverEffect') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setProp('hoverEffect', isActive ? '' : opt.value)
                        }
                        title={opt.label}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${isActive ? 'border-primary/40 bg-primary/8 text-foreground' : 'border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                      >
                        {opt.icon}
                        <span className="text-[9px] leading-none">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground/50 px-0.5">
                Transitions run in the live preview. Enable a transition type first.
              </p>
            </div>
          </InspectorSection>
        )}

        {/* ━━━ SECTION PICKER — "Add more properties" ━━━ */}
        <div className="px-3 py-4 border-t border-border/30 mt-1">
          <SectionPicker
            options={INSPECTOR_SECTION_OPTIONS}
            activeSections={activeSections}
            onChange={updateSections}
          />
        </div>
      </div>

      {/* ── Children footer ── */}
      {canvas.childrenOrdered && canvas.childrenOrdered.length > 0 && (
        <div className="border-t border-border/50 max-h-44 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-border/50 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Children</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold">
                {canvas.childrenOrdered.length}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground/50">Layers tab for full control</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {canvas.childrenOrdered.map((child: any, idx: number) => {
              const isSelected = child.id === canvas.selectedNodeId;
              return (
                <div
                  key={child.id}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500/70 bg-blue-500/10 text-blue-300 shadow-sm'
                      : 'border-border/50 bg-background hover:bg-accent/30 hover:border-border'
                  }`}
                  onClick={() => canvas.setSelectedNodeId?.(child.id)}
                  title="Click to select this child"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-blue-400' : 'bg-muted-foreground/30'}`}
                  />
                  <span className="flex-1 truncate font-medium">{child.label}</span>
                  <span className="text-[9px] text-muted-foreground/50 font-mono shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={() => canvas.reorderChild?.(idx, idx - 1)}
                      disabled={idx === 0}
                      title="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={() => canvas.reorderChild?.(idx, idx + 1)}
                      disabled={idx === canvas.childrenOrdered.length - 1}
                      title="Move down"
                    >
                      ↓
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 text-destructive/60 hover:text-destructive"
                      onClick={() => canvas.removeChildEdge?.(child.edgeId)}
                      title="Detach child"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
