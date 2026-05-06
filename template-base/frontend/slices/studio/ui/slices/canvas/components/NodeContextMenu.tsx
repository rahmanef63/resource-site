"use client";

import React, { useEffect, useRef } from 'react';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';
import {
  Pin, PinOff, Copy, Trash2, Ungroup,
  Link, Layers, Group, Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  comp: string;
  isPinned: boolean;
  onPin: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExplode?: () => void;
  onGroup?: () => void;
  onFocusNode?: () => void;
  onClose: () => void;
}

interface MenuItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

function MenuItem({ icon: Icon, label, shortcut, onClick, variant = 'default', disabled }: MenuItemProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-md transition-colors text-left',
        variant === 'destructive'
          ? 'text-destructive hover:bg-destructive/10 disabled:opacity-40'
          : 'text-foreground hover:bg-muted disabled:opacity-40',
      )}
    >
      <Icon size={14} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-muted-foreground font-mono">{shortcut}</span>
      )}
    </button>
  );
}

export function NodeContextMenu({
  x, y, nodeId, comp,
  isPinned,
  onPin, onDuplicate, onDelete, onExplode, onGroup, onFocusNode,
  onClose,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const config = getWidgetConfig(comp);
  const isBlock = config?.category === 'Blocks';
  const canExplode = isBlock && typeof (config as any)?.explode === 'function';

  // Close on outside click or Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  // Clamp position so menu stays in viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 280),
    zIndex: 9999,
  };

  return (
    <div
      ref={ref}
      style={style}
      className="w-52 rounded-xl border border-border bg-background shadow-xl p-1.5 select-none"
    >
      {/* Node label header */}
      <div className="px-2.5 py-1.5 mb-1 flex items-center gap-2 border-b border-border/50">
        {config?.icon && React.createElement(config.icon as any, { size: 13, className: 'text-primary shrink-0' })}
        <span className="text-xs font-semibold truncate">{config?.label ?? comp}</span>
        {isBlock && (
          <span className="ml-auto text-[9px] rounded-sm bg-primary/10 text-primary px-1 py-0.5 font-bold">Block</span>
        )}
      </div>

      {/* Actions */}
      <MenuItem
        icon={isPinned ? PinOff : Pin}
        label={isPinned ? 'Unpin from preview' : 'Pin to preview'}
        shortcut="P"
        onClick={() => { onPin(); onClose(); }}
      />

      {onFocusNode && (
        <MenuItem
          icon={Maximize2}
          label="Focus in canvas"
          onClick={() => { onFocusNode(); onClose(); }}
        />
      )}

      <div className="my-1 border-t border-border/40" />

      <MenuItem
        icon={Copy}
        label="Duplicate"
        shortcut="⌘D"
        onClick={() => { onDuplicate(); onClose(); }}
      />

      {onGroup && (
        <MenuItem
          icon={Group}
          label="Group selected"
          onClick={() => { onGroup(); onClose(); }}
        />
      )}

      {canExplode && onExplode && (
        <>
          <div className="my-1 border-t border-border/40" />
          <MenuItem
            icon={Ungroup}
            label="Explode to nodes"
            onClick={() => { onExplode(); onClose(); }}
          />
        </>
      )}

      <div className="my-1 border-t border-border/40" />

      <MenuItem
        icon={Trash2}
        label="Delete"
        shortcut="Del"
        variant="destructive"
        onClick={() => { onDelete(); onClose(); }}
      />
    </div>
  );
}
