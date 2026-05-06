/**
 * StudioEditorTabs — VS Code-style tabs for multiple open documents.
 * Each document is a named canvas snapshot stored in localStorage.
 * Active document = current canvas nodes/edges state.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Eye, Code, Columns2, LayoutPanelLeft, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ActiveView = 'canvas' | 'preview' | 'json' | 'split-preview' | 'split-json' | 'json-preview';

const STORAGE_KEY = 'studio-editor-tabs';

interface DocumentSnapshot {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  savedAt: number;
}

interface StudioEditorTabsProps {
  currentNodes: any[];
  currentEdges: any[];
  onSwitchDocument: (nodes: any[], edges: any[]) => void;
  onNewDocument: () => void;
  activeView?: ActiveView;
  onViewChange?: (view: ActiveView) => void;
}

function loadDocuments(): DocumentSnapshot[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ id: 'default', name: 'Untitled', nodes: [], edges: [], savedAt: Date.now() }];
}

function saveDocuments(docs: DocumentSnapshot[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {}
}

export function StudioEditorTabs({
  currentNodes,
  currentEdges,
  onSwitchDocument,
  onNewDocument,
  activeView = 'canvas',
  onViewChange,
}: StudioEditorTabsProps) {
  const [documents, setDocuments] = useState<DocumentSnapshot[]>(() => loadDocuments());
  const [activeId, setActiveId] = useState<string>(() => loadDocuments()[0]?.id ?? 'default');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced auto-save current canvas state to active document
  useEffect(() => {
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      setDocuments(prev => {
        const next = prev.map(doc =>
          doc.id === activeId
            ? { ...doc, nodes: currentNodes, edges: currentEdges, savedAt: Date.now() }
            : doc
        );
        saveDocuments(next);
        return next;
      });
    }, 1000);
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [currentNodes, currentEdges, activeId]);

  // Focus rename input when renaming starts
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const switchTo = useCallback((doc: DocumentSnapshot) => {
    const isCanvasView = activeView === 'canvas' || activeView === 'split-preview' || activeView === 'split-json' || activeView === 'json-preview';
    if (doc.id === activeId && isCanvasView) return;
    // Save current state first (immediate, no debounce)
    setDocuments(prev => {
      const next = prev.map(d =>
        d.id === activeId
          ? { ...d, nodes: currentNodes, edges: currentEdges, savedAt: Date.now() }
          : d
      );
      saveDocuments(next);
      return next;
    });
    setActiveId(doc.id);
    onViewChange?.('canvas');
    onSwitchDocument(doc.nodes, doc.edges);
  }, [activeId, activeView, currentNodes, currentEdges, onSwitchDocument, onViewChange]);

  const createDocument = useCallback(() => {
    // Save current state first
    setDocuments(prev => {
      const savedPrev = prev.map(d =>
        d.id === activeId
          ? { ...d, nodes: currentNodes, edges: currentEdges, savedAt: Date.now() }
          : d
      );
      const newDoc: DocumentSnapshot = {
        id: `doc-${Date.now()}`,
        name: `Untitled ${savedPrev.length + 1}`,
        nodes: [],
        edges: [],
        savedAt: Date.now(),
      };
      const next = [...savedPrev, newDoc];
      saveDocuments(next);
      setActiveId(newDoc.id);
      onNewDocument();
      return next;
    });
  }, [activeId, currentNodes, currentEdges, onNewDocument]);

  const closeDocument = useCallback((docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(prev => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex(d => d.id === docId);
      const next = prev.filter(d => d.id !== docId);
      saveDocuments(next);
      if (docId === activeId) {
        const newActive = next[Math.max(0, idx - 1)];
        setActiveId(newActive.id);
        onSwitchDocument(newActive.nodes, newActive.edges);
      }
      return next;
    });
  }, [activeId, onSwitchDocument]);

  const startRename = useCallback((doc: DocumentSnapshot) => {
    setRenamingId(doc.id);
    setRenameValue(doc.name);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    const name = renameValue.trim() || 'Untitled';
    setDocuments(prev => {
      const next = prev.map(d => d.id === renamingId ? { ...d, name } : d);
      saveDocuments(next);
      return next;
    });
    setRenamingId(null);
  }, [renamingId, renameValue]);

  return (
    <div className="flex items-center overflow-x-auto shrink-0 bg-muted/30 border-b border-border min-h-0">
      {documents.map(doc => {
        const isActive = doc.id === activeId && (activeView === 'canvas' || activeView === 'split-preview' || activeView === 'split-json');
        return (
          <div
            key={doc.id}
            onClick={() => switchTo(doc)}
            onDoubleClick={() => startRename(doc)}
            title="Double-click to rename"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 cursor-pointer whitespace-nowrap text-xs shrink-0 border-r border-border/50 select-none',
              isActive
                ? 'bg-background border border-border text-foreground border-b-0'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {renamingId === doc.id ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                onBlur={commitRename}
                onClick={e => e.stopPropagation()}
                className="w-24 bg-transparent border-b border-primary outline-none text-xs"
              />
            ) : (
              <span className="max-w-[100px] truncate">{doc.name}</span>
            )}
            {documents.length > 1 && (
              <button
                onClick={(e) => closeDocument(doc.id, e)}
                className="ml-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={10} />
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={createDocument}
        className="flex items-center justify-center w-8 h-8 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        title="New document"
      >
        <Plus size={13} />
      </button>

      {/* Separator before view switcher */}
      <div className="w-px h-5 bg-border/60 shrink-0 mx-1" />

      {/* Canvas — explicit view tab */}
      <button
        onClick={() => onViewChange?.('canvas')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 cursor-pointer whitespace-nowrap text-xs shrink-0 select-none transition-colors rounded-sm',
          activeView === 'canvas'
            ? 'bg-background text-foreground shadow-sm font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Canvas editor"
      >
        <LayoutPanelLeft size={12} />
        <span>Canvas</span>
      </button>

      {/* Preview — permanent tab */}
      <button
        onClick={() => onViewChange?.('preview')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 cursor-pointer whitespace-nowrap text-xs shrink-0 select-none transition-colors rounded-sm',
          activeView === 'preview'
            ? 'bg-background text-foreground shadow-sm font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Live preview"
      >
        <Eye size={12} />
        <span>Preview</span>
      </button>

      {/* JSON — permanent tab */}
      <button
        onClick={() => onViewChange?.('json')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 cursor-pointer whitespace-nowrap text-xs shrink-0 select-none transition-colors rounded-sm',
          activeView === 'json'
            ? 'bg-background text-foreground shadow-sm font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="JSON schema editor"
      >
        <Code size={12} />
        <span>JSON</span>
      </button>

      {/* Separator before split view */}
      <div className="w-px h-5 bg-border/60 shrink-0 mx-1" />

      {/* Split dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 cursor-pointer whitespace-nowrap text-xs shrink-0 select-none transition-colors rounded-sm',
              ['split-preview', 'split-json', 'json-preview'].includes(activeView ?? '')
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Split view — Canvas + Preview or JSON"
          >
            <Columns2 size={11} />
            <span>Split</span>
            <ChevronDown size={9} className="opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className="w-48">
          <DropdownMenuItem onClick={() => onViewChange?.('split-preview')} className="gap-2 text-xs">
            <LayoutPanelLeft size={12} />
            <Eye size={11} />
            Canvas + Preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewChange?.('split-json')} className="gap-2 text-xs">
            <LayoutPanelLeft size={12} />
            <Code size={11} />
            Canvas + JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onViewChange?.('json-preview')} className="gap-2 text-xs">
            <Code size={11} />
            <Eye size={11} />
            JSON + Preview
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
