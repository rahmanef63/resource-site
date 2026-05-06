/**
 * ImportJsonDialog
 *
 * Proper dialog for importing Studio JSON or n8n workflow JSON.
 * Features:
 *  - Textarea for pasting JSON
 *  - File picker button
 *  - Auto-detected format badge
 *  - Real-time schema validation with copyable error list
 *  - Toast feedback on success/failure
 */
'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle2, FileJson, Upload, Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type SchemaError,
  validateAndNormalizeSchema,
} from '../ui/utils/validateSchema';

// ─── Format detection ────────────────────────────────────────────────────────

type DetectedFormat = 'studio-ui' | 'studio-workflow' | 'n8n' | 'unknown' | null;

function detectFormat(raw: unknown): DetectedFormat {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'unknown';
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.nodes) && obj.connections !== undefined) return 'n8n';
  if (obj.studioVersion && obj.flow) return 'studio-workflow';
  const ui = obj.ui as Record<string, unknown> | undefined;
  if ((obj.root && obj.nodes) || (ui?.root && ui?.nodes)) return 'studio-ui';
  return 'unknown';
}

const FORMAT_LABELS: Record<string, { label: string; color: string }> = {
  'studio-ui':       { label: 'Studio UI Layout',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  'studio-workflow': { label: 'Studio Workflow',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  'n8n':             { label: 'n8n Workflow',          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  'unknown':         { label: 'Unknown format',        color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface ImportJsonDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called when user confirms import of a valid Studio UI schema */
  onImportUI: (schema: Record<string, unknown>) => void;
  /** Called when user confirms import of a workflow JSON */
  onImportWorkflow: (text: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ImportJsonDialog: React.FC<ImportJsonDialogProps> = ({
  open,
  onClose,
  onImportUI,
  onImportWorkflow,
}) => {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<SchemaError[]>([]);
  const [format, setFormat] = useState<DetectedFormat>(null);
  const [copied, setCopied] = useState(false);
  const [normalizedUiSchema, setNormalizedUiSchema] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Parse + validate whenever text changes ────────────────────────────────
  const handleTextChange = useCallback((value: string) => {
    setText(value);
    if (!value.trim()) {
      setErrors([]);
      setFormat(null);
      setNormalizedUiSchema(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      const detected = detectFormat(parsed);
      setFormat(detected);
      if (detected === 'studio-ui') {
        const parsedObj = parsed as Record<string, unknown>;
        const uiSchema = parsedObj.ui ?? parsedObj;
        const result = validateAndNormalizeSchema(uiSchema);
        setErrors(result.errors);
        setNormalizedUiSchema(result.normalizedSchema);
      } else {
        setErrors([]);
        setNormalizedUiSchema(null);
      }
    } catch {
      setFormat('unknown');
      setErrors([{ id: 'schema', message: 'Invalid JSON — could not parse', severity: 'error' }]);
      setNormalizedUiSchema(null);
    }
  }, []);

  // ── File picker ───────────────────────────────────────────────────────────
  const handleFilePick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    handleTextChange(content);
    // Reset so same file can be re-picked
    e.target.value = '';
  }, [handleTextChange]);

  // ── Copy errors ───────────────────────────────────────────────────────────
  const copyErrors = useCallback(() => {
    const msg = errors.map(e => `[${e.severity.toUpperCase()}] node "${e.id}": ${e.message}`).join('\n');
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [errors]);

  // ── Import ────────────────────────────────────────────────────────────────
  const handleImport = useCallback(() => {
    if (!text.trim()) return;
    try {
      const parsed = JSON.parse(text);
      const fmt = detectFormat(parsed);

      if (fmt === 'studio-ui') {
        const parsedObj = parsed as Record<string, unknown>;
        onImportUI(normalizedUiSchema ?? (parsedObj.ui as Record<string, unknown>) ?? parsedObj);
      } else {
        // Workflow or n8n — hand raw text to parent
        onImportWorkflow(text);
      }
      onClose();
      setText('');
      setErrors([]);
      setFormat(null);
      setNormalizedUiSchema(null);
    } catch {
      // Parent already handles parse errors — shouldn't reach here after validation
    }
  }, [text, normalizedUiSchema, onImportUI, onImportWorkflow, onClose]);

  // ── Reset on close ────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    onClose();
    setText('');
    setErrors([]);
    setFormat(null);
    setNormalizedUiSchema(null);
  }, [onClose]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const hasText = text.trim().length > 0;
  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');
  const canImport = hasText && !hasErrors;
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warnCount  = errors.filter(e => e.severity === 'warning').length;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson size={18} />
            Import JSON
          </DialogTitle>
          <DialogDescription>
            Paste Studio UI JSON, Studio workflow JSON, or an n8n workflow export.
          </DialogDescription>
        </DialogHeader>

        {/* ── Textarea ── */}
        <div className="relative">
          <textarea
            className={cn(
              'w-full h-56 rounded-md border bg-muted/40 p-3 font-mono text-xs resize-none focus:outline-none focus:ring-2 transition-colors',
              hasErrors   ? 'border-destructive/60 focus:ring-destructive/40' :
              hasWarnings ? 'border-yellow-400/60 focus:ring-yellow-400/40' :
              hasText     ? 'border-green-500/60 focus:ring-green-500/40' :
                            'border-border focus:ring-ring',
            )}
            placeholder={'Paste your JSON here…\n\nOr click "Pick File" to load a .json file.'}
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            spellCheck={false}
          />
          {/* File picker button */}
          <button
            type="button"
            onClick={handleFilePick}
            className="absolute top-2 right-2 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium bg-background/80 border border-border hover:bg-muted transition-colors"
          >
            <Upload size={11} />
            Pick File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* ── Format + validation status ── */}
        {hasText && format && (
          <div className="flex flex-col gap-2">
            {/* Format badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Detected:</span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', FORMAT_LABELS[format]?.color)}>
                {FORMAT_LABELS[format]?.label ?? format}
              </span>
              {!hasErrors && hasText && format !== 'unknown' && (
                <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                  <CheckCircle2 size={11} />
                  {errors.length === 0 ? 'Valid — ready to import' : `${warnCount} warning${warnCount !== 1 ? 's' : ''}`}
                </span>
              )}
            </div>

            {/* Error / warning list */}
            {errors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-destructive/20 bg-destructive/10">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertTriangle size={12} />
                    {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
                    {errorCount > 0 && warnCount > 0 && ', '}
                    {warnCount > 0 && `${warnCount} warning${warnCount !== 1 ? 's' : ''}`}
                  </span>
                  <button
                    type="button"
                    onClick={copyErrors}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                    {copied ? 'Copied!' : 'Copy all'}
                  </button>
                </div>
                <ScrollArea className="max-h-36">
                  <ul className="p-2 space-y-1">
                    {errors.map((err, i) => (
                      <li
                        key={i}
                        className={cn(
                          'flex items-start gap-2 text-[11px] rounded px-2 py-1',
                          err.severity === 'error'
                            ? 'text-destructive bg-destructive/5'
                            : 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
                        )}
                      >
                        {err.severity === 'error'
                          ? <X size={10} className="mt-0.5 shrink-0" />
                          : <AlertTriangle size={10} className="mt-0.5 shrink-0" />}
                        <span>
                          <span className="font-mono font-semibold">{err.id}</span>
                          {' — '}
                          {err.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={!canImport}
            className={cn(!canImport && 'opacity-50 cursor-not-allowed')}
          >
            {hasErrors ? 'Fix errors to import' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
