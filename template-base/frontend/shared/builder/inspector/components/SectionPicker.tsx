'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface SectionPickerProps {
  options: SectionOption[];
  activeSections: Set<string>;
  onChange: (sections: Set<string>) => void;
}

/**
 * SectionPicker — "Add more properties" button that opens a multi-select
 * filter-style popover. Users tick the property sections they want visible.
 * Non-coders see a clean minimal inspector by default; power users can unlock
 * Typography, Flex & Layout, Border, etc. on demand.
 */
export function SectionPicker({ options, activeSections, onChange }: SectionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const toggle = (id: string) => {
    const next = new Set(activeSections);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(next);
  };

  const activeCount = options.filter(o => activeSections.has(o.id)).length;
  const remaining = options.length - activeCount;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs transition-all font-medium',
          'border-dashed border-border/70 text-muted-foreground',
          'hover:border-primary/60 hover:text-foreground hover:bg-primary/5 active:scale-[0.98]',
          isOpen && 'border-primary/60 bg-primary/5 text-foreground shadow-sm'
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add more properties</span>
        {remaining > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-mono leading-none">
            Show {remaining} more
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full left-0 right-0 mb-2 z-[200]',
            'bg-popover border border-border/80 rounded-2xl shadow-2xl overflow-hidden',
            'animate-in fade-in-0 slide-in-from-bottom-3 duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
            <div>
              <p className="text-xs font-semibold text-foreground">Property Sections</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Pick what you want to edit — start simple!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Options list */}
          <div className="p-2 space-y-0.5 max-h-72 overflow-y-auto">
            {options.map(opt => {
              const active = activeSections.has(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all select-none',
                    active
                      ? 'bg-primary/8 text-foreground shadow-sm border border-primary/15'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent'
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'w-4 h-4 rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150',
                      active ? 'bg-primary border-primary shadow-sm' : 'border-border/70 bg-background'
                    )}
                  >
                    {active && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                  </div>

                  {/* Section icon */}
                  <span className="text-base shrink-0 leading-none w-5 flex items-center justify-center">
                    {opt.icon}
                  </span>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                      {opt.description}
                    </p>
                  </div>

                  {/* Active badge */}
                  {active && (
                    <span className="shrink-0 text-[9px] text-primary font-semibold px-1.5 py-0.5 bg-primary/10 rounded-full">
                      ON
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {activeCount > 0 && (
            <div className="px-4 py-2.5 border-t border-border/40 flex items-center justify-between bg-muted/10">
              <span className="text-[10px] text-muted-foreground">
                {activeCount} section{activeCount !== 1 ? 's' : ''} active
              </span>
              <button
                type="button"
                onClick={() => onChange(new Set())}
                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
