/**
 * Template Library Component
 * Generic template browser with no feature coupling
 * Uses props injection pattern for template storage
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useDnD } from '../canvas/core';

/** Derive a stable pastel gradient from a template name for visual identification */
function templateGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1},55%,40%) 0%, hsl(${h2},65%,55%) 100%)`;
}

// ============================================================================
// Props Injection Pattern - No Feature Coupling!
// ============================================================================

export interface TemplateProvider {
  /**
   * Get default/built-in templates
   * @returns Record of template name to template data
   */
  getDefaultTemplates: () => Record<string, any>

  /**
   * List saved/asset templates
   * @returns Record of template name to template data
   */
  listAssetTemplates: () => Record<string, any>

  /**
   * Save a new template
   * @param name Template name/key
   * @param schema Template schema/data
   */
  saveAssetTemplate: (name: string, schema: any) => void

  /**
   * Delete a saved template
   * @param name Template name/key to delete
   */
  deleteAssetTemplate: (name: string) => void
}

interface TemplateLibraryProps {
  /**
   * Callback when user wants to open a template
   * @param key Template key in format "source:name" (e.g. "builtin:hero", "asset:mytemplate")
   */
  onOpen: (key: string) => void

  /**
   * Template provider for storage operations
   * If not provided, library will show empty state
   */
  templateProvider?: TemplateProvider
}

/**
 * Template Library - Truly Shared, No Feature Coupling
 *
 * @example
 * // Without provider (empty library)
 * <TemplateLibrary onOpen={handleOpen} />
 *
 * @example
 * // With CMS template provider
 * import { cmsTemplateProvider } from "@/frontend/slices/cms/state/templateProvider"
 * <TemplateLibrary onOpen={handleOpen} templateProvider={cmsTemplateProvider} />
 *
 * @example
 * // With custom provider
 * const myProvider = {
 *   getDefaultTemplates: () => ({ "starter": {...} }),
 *   listAssetTemplates: () => myAssets,
 *   saveAssetTemplate: (name, data) => saveToStorage(name, data),
 *   deleteAssetTemplate: (name) => removeFromStorage(name)
 * }
 * <TemplateLibrary onOpen={handleOpen} templateProvider={myProvider} />
 */
export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onOpen,
  templateProvider
}) => {
  const [query, setQuery] = useState("")
  const [assets, setAssets] = useState<Record<string, any>>({})
  const [, setType] = useDnD()

  // Load assets when provider changes
  useEffect(() => {
    if (templateProvider) {
      setAssets(templateProvider.listAssetTemplates())
    } else {
      setAssets({})
    }
  }, [templateProvider])

  // Get built-in templates
  const builtin = useMemo(() => {
    if (!templateProvider) return {}
    return templateProvider.getDefaultTemplates()
  }, [templateProvider])

  const builtinKeys = Object.keys(builtin)
  const assetKeys = Object.keys(assets)

  const filteredBuiltins = builtinKeys.filter(k =>
    k.toLowerCase().includes(query.toLowerCase())
  )
  const filteredAssets = assetKeys.filter(k =>
    k.toLowerCase().includes(query.toLowerCase())
  )

  const onDragStart = (e: React.DragEvent, key: string, source: 'builtin' | 'asset') => {
    setType(null) // prevent SharedCanvas default add-node behavior
    e.dataTransfer.setData('cms/template', JSON.stringify({ key, source }))
    e.dataTransfer.effectAllowed = 'copyMove'
  }

  const removeAsset = (key: string) => {
    if (!templateProvider) return

    templateProvider.deleteAssetTemplate(key)
    setAssets(templateProvider.listAssetTemplates())
  }

  const renderItem = (key: string, source: 'builtin' | 'asset') => (
    <div
      key={`${source}:${key}`}
      className="relative rounded-xl border overflow-hidden hover:shadow-md transition-shadow group cursor-default"
      title={key}
    >
      {/* Thumbnail */}
      <div
        className="h-16 w-full"
        style={{ background: templateGradient(key) }}
        draggable
        onDragStart={(e) => onDragStart(e, key, source)}
      />
      <div className="p-2.5">
        <div className="text-sm font-medium truncate">{key}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {source === 'builtin' ? 'Built-in' : 'Saved'}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => onOpen(`${source}:${key}`)}>
            Open
          </Button>
          {source === 'asset' && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => removeAsset(key)}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  // Empty state if no provider
  if (!templateProvider) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">No Template Provider</div>
          <div className="text-xs text-muted-foreground">
            Connect a template provider to browse and manage templates
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates..."
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Built-in</div>
          <div className="grid grid-cols-1 gap-2">
            {filteredBuiltins.map(key => renderItem(key, 'builtin'))}
            {filteredBuiltins.length === 0 && (
              <div className="text-xs text-muted-foreground">No templates</div>
            )}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Asset Templates</div>
          <div className="grid grid-cols-1 gap-2">
            {filteredAssets.map(key => renderItem(key, 'asset'))}
            {filteredAssets.length === 0 && (
              <div className="text-xs text-muted-foreground">No saved templates yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper to save a new asset template from external callers
 * Now requires provider to be passed
 *
 * @example
 * ```ts
 * import { cmsTemplateProvider } from "@/frontend/slices/cms/state/templateProvider"
 * addSelectionAsTemplate(cmsTemplateProvider, "my-template", schema)
 * ```
 */
export function addSelectionAsTemplate(
  provider: TemplateProvider,
  name: string,
  schema: any
): void {
  provider.saveAssetTemplate(name, schema)
}
