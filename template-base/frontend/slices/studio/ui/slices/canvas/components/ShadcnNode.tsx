import React from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { getWidgetConfig } from '@/frontend/slices/studio/ui/registry';
import { useOptionalSharedCanvas } from '@/frontend/shared/builder';
import {
  Pin, PinOff, Image, Tag, Type, Link2, FileText, Layers,
  Trash2, Copy, Ungroup,
} from 'lucide-react';

type ShadcnNodeData = {
  comp: string;
  props: Record<string, any>;
};

function ContentIcon({ data }: { data: ShadcnNodeData }) {
  if (data.props?.src) return <Image size={10} className="text-sky-400 shrink-0" />;
  if (data.props?.href) return <Link2 size={10} className="text-blue-400 shrink-0" />;
  if (data.props?.tag) return <Tag size={10} className="text-amber-400 shrink-0" />;
  if (data.props?.content || data.props?.text || data.props?.title)
    return <Type size={10} className="text-green-400 shrink-0" />;
  return <Layers size={10} className="text-muted-foreground/40 shrink-0" />;
}

export const ShadcnNode: React.FC<NodeProps<ShadcnNodeData>> = ({ id, data, selected }) => {
  const config = getWidgetConfig(data.comp);
  const shared = useOptionalSharedCanvas();
  const isPinned = shared?.isPinned?.(id) ?? false;
  const slots = config?.slots;
  const hasSlots = slots && slots.length > 0;

  const isBlock = config?.category === 'Blocks';
  const canExplode = isBlock && typeof (config as any)?.explode === 'function';

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shared) return;
    isPinned ? shared.unpin(id) : shared.pin(id);
  };

  const handleExplode = (e: React.MouseEvent) => {
    e.stopPropagation();
    (shared as any)?.explodeBlock?.(id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shared) return;
    shared.setSelectedNodeId(id);
    shared.copy();
    shared.paste();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shared) return;
    const edgesArr = (shared as any).edges as any[] | undefined;
    const hasParent = !!edgesArr?.find((edge: any) => edge.target === id);
    const hasChildren = !!edgesArr?.find((edge: any) => edge.source === id);
    // Middle node → reconnect parent to children
    (shared as any).deleteNodeWithReconnect?.(id, hasParent && hasChildren);
  };

  const labelText = (() => {
    const p = data.props ?? {};
    if (p.content) return String(p.content).slice(0, 40);
    if (p.title) return String(p.title).slice(0, 40);
    if (p.text) return String(p.text).slice(0, 40);
    if (p.src) return String(p.src).split('/').pop()?.slice(0, 30) ?? '';
    return '';
  })();

  return (
    <>
      {/* ── NodeToolbar: floating action bar above selected node ── */}
      <NodeToolbar isVisible={selected} position={Position.Top} offset={6}>
        <div className="flex items-center gap-0.5 bg-background border border-border rounded-lg shadow-md px-1 py-0.5 select-none">
          <button
            onClick={togglePin}
            title={isPinned ? 'Unpin from preview' : 'Pin to preview'}
            className={cn(
              'p-1 rounded-md transition-colors hover:bg-muted',
              isPinned ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>

          {canExplode && (
            <>
              <div className="w-px h-4 bg-border mx-0.5" />
              <button
                onClick={handleExplode}
                title="Explode block into primitive nodes"
                className="p-1 rounded-md transition-colors hover:bg-primary/10 text-primary"
              >
                <Ungroup size={13} />
              </button>
            </>
          )}

          <div className="w-px h-4 bg-border mx-0.5" />

          <button
            onClick={handleDuplicate}
            title="Duplicate"
            className="p-1 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Copy size={13} />
          </button>

          <button
            onClick={handleDelete}
            title="Delete (reconnects if middle node)"
            className="p-1 rounded-md transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </NodeToolbar>

      {/* ── Node Card ── */}
      <div className={cn(
        'min-w-[200px] rounded-xl border bg-card shadow-sm transition-all',
        selected ? 'border-primary ring-1 ring-primary/30' : 'border-border',
        isBlock && !selected && 'border-primary/20',
      )}>
        <Handle type="target" position={Position.Top} style={{ width: 8, height: 8 }} />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60">
          <div className="flex items-center gap-1.5 min-w-0">
            {config?.icon
              ? React.createElement(config.icon as any, { size: 12, className: 'text-primary shrink-0' })
              : <FileText size={12} className="text-muted-foreground shrink-0" />
            }
            <span className="text-xs font-medium truncate">{config?.label || data.comp}</span>
            {isBlock && (
              <span className="shrink-0 rounded-sm bg-primary/10 px-1 py-0.5 text-[9px] text-primary font-semibold leading-none">
                B
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={togglePin}
              title={isPinned ? 'Unpin' : 'Pin to preview'}
              className={cn(
                'p-0.5 rounded transition-colors',
                isPinned
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-muted-foreground/40 hover:text-muted-foreground',
              )}
            >
              {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
            </button>
            <span className="text-[9px] text-muted-foreground/30 font-mono">{id.slice(-4)}</span>
          </div>
        </div>

        {/* Content preview row */}
        {(labelText || data.props?.tag) && (
          <div className="px-3 py-1.5 flex items-center gap-1.5">
            <ContentIcon data={data} />
            <span className="text-[10px] text-muted-foreground truncate">
              {data.props?.tag ? `<${data.props.tag}> ` : ''}{labelText}
            </span>
          </div>
        )}

        {/* Slot handles or single source handle */}
        {hasSlots ? (
          <div className="flex items-end justify-around px-2 pb-1 pt-1 border-t border-border/40 gap-1">
            {slots!.map((slot, i) => {
              const pct = slots!.length === 1
                ? 50
                : Math.round(10 + (80 / (slots!.length - 1)) * i);
              return (
                <div
                  key={slot.id}
                  className="flex flex-col items-center gap-0.5 relative"
                  style={{ width: `${100 / slots!.length}%` }}
                >
                  <span className="text-[8px] text-muted-foreground/50 select-none">{slot.label}</span>
                  <Handle
                    type="source"
                    position={Position.Bottom}
                    id={slot.id}
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      left: `${pct}%`,
                      transform: 'translateX(-50%)',
                      width: 8,
                      height: 8,
                      background: 'hsl(var(--primary))',
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8 }} />
        )}
      </div>
    </>
  );
};
